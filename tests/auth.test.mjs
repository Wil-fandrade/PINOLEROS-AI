import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { register, login, changePassword, recoveryCode, recoverPassword } from '../src/routes/api/auth.ts';
import { getUser } from '../src/lib/auth.ts';
import { account } from '../src/routes/account.ts';
import worker from '../src/index.ts';
function environment(){
 const db=new DatabaseSync(':memory:');
 db.exec(`PRAGMA foreign_keys=ON; CREATE TABLE users(id TEXT PRIMARY KEY,email TEXT UNIQUE COLLATE NOCASE,phone TEXT,name TEXT,nickname TEXT,password_hash TEXT,password_salt TEXT); CREATE TABLE sessions(token_hash TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id),expires_at TEXT);`);
 db.exec(readFileSync('migrations/0008_account_security.sql','utf8'));
 db.exec(readFileSync('migrations/0009_user_roles.sql','utf8'));
 db.exec(readFileSync('migrations/0010_admin_access.sql','utf8'));
 return {db,DB:{prepare(sql){let args=[];return {bind(...values){args=values;return this},async first(){return db.prepare(sql).get(...args)||null},async run(){return db.prepare(sql).run(...args)}}}}};
}
const req=(body,cookie='',path='/api/auth/login')=>new Request('https://test.example'+path,{method:'POST',headers:{'content-type':'application/json',cookie},body:JSON.stringify(body)});
const profile={email:'Test@example.com',password:'original-password',name:'Test User',phone:'5551234567'};
async function setup(){const env=environment();const r=await register(req(profile),env);assert.equal(r.status,201);return {env,cookie:r.headers.get('set-cookie').split(';')[0]}}
test('register persists hashed credentials; login validates them',async()=>{
 const {env,cookie}=await setup();const row=env.db.prepare('SELECT * FROM users').get();assert.equal(row.email,'test@example.com');assert.notEqual(row.password_hash,profile.password);assert.ok(await getUser(req({},cookie),env));
 assert.equal((await login(req({...profile,password:'wrong-password'}),env)).status,401);
 assert.equal((await login(req(profile),env)).status,200);
 assert.equal((await register(req(profile),env)).status,409);
 assert.equal(await getUser(req({},'pinoleros_session=%broken'),env),null);
});
test('password change requires current password and revokes every session and recovery code',async()=>{
 const {env,cookie}=await setup();await login(req(profile),env);await recoveryCode(req({currentPassword:profile.password},cookie),env);
 assert.equal((await changePassword(req({currentPassword:'wrong-password',newPassword:'new-password-123'},cookie),env)).status,403);
 assert.equal((await changePassword(req({currentPassword:profile.password,newPassword:'short'},cookie),env)).status,400);
 assert.equal((await changePassword(req({currentPassword:profile.password,newPassword:'new-password-123'},cookie),env)).status,200);
 assert.equal(env.db.prepare('SELECT COUNT(*) AS n FROM sessions').get().n,0);
 assert.equal(env.db.prepare('SELECT recovery_hash FROM users').get().recovery_hash,null);
 assert.equal((await login(req(profile),env)).status,401);
 assert.equal((await login(req({...profile,password:'new-password-123'}),env)).status,200);
});
test('recovery code is hashed, replaceable, single use and cannot target another account',async()=>{
 const {env,cookie}=await setup();assert.equal((await recoveryCode(req({currentPassword:profile.password}),env)).status,401);
 const first=(await (await recoveryCode(req({currentPassword:profile.password},cookie),env)).json()).code;
 const second=(await (await recoveryCode(req({currentPassword:profile.password},cookie),env)).json()).code;
 assert.notEqual(env.db.prepare('SELECT recovery_hash FROM users').get().recovery_hash,second);
 const body={email:profile.email,code:second,newPassword:'recovered-password'};
 assert.equal((await recoverPassword(req({...body,code:first}),env)).status,400);
 assert.equal((await recoverPassword(req({...body,email:'other@example.com'}),env)).status,400);
 const responses=await Promise.all([recoverPassword(req(body),env),recoverPassword(req(body),env)]);
 assert.deepEqual(responses.map(r=>r.status).sort(),[200,400]);
 assert.equal(await getUser(req({},cookie),env),null);
 assert.equal((await login(req({...profile,password:body.newPassword}),env)).status,200);
});
test('login attempts are limited and cross-origin account mutations rejected',async()=>{
 const {env}=await setup();for(let i=0;i<20;i++)assert.equal((await login(req({...profile,password:'wrong-password'}),env)).status,401);
 assert.equal((await login(req(profile),env)).status,429);
 const r=req(profile);r.headers.set('origin','https://attacker.example');assert.equal((await worker.fetch(r,env)).status,403);
});
test('account page script parses and responses prevent caching',async()=>{
 const r=account();assert.equal(r.headers.get('cache-control'),'no-store');const html=await r.text();new Function(html.match(/<script>([\s\S]*?)<\/script>/)[1]);assert.match(html,/Confirmar nueva contraseña/);
});

 test('public registration cannot grant master role and sessions read the stored role',async()=>{
 const env=environment();const r=await register(req({...profile,role:'master'}),env);assert.equal(r.status,201);
 assert.equal(env.db.prepare('SELECT role FROM users').get().role,'user');
 env.db.exec("UPDATE users SET role = 'master'");
 const loginResponse=await login(req(profile),env);assert.equal((await loginResponse.json()).user.role,'master');
 const cookie=loginResponse.headers.get('set-cookie').split(';')[0];assert.equal((await getUser(req({},cookie),env)).role,'master');
 });
