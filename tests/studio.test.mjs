import { test } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { reserveAiAttempt } from '../src/lib/ai-usage.ts';
import assert from 'node:assert/strict';
import { generate, generationStatus, promptAssist, selectCreation } from '../src/routes/api/creations.ts';
import { validReference, dimensions } from '../src/lib/cloud-images.ts';
import { parseImage } from '../src/lib/image-data.ts';
import { studioPage } from '../src/ui/studio.ts';
const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aDa0AAAAASUVORK5CYII=';
const image='data:image/png;base64,'+png;
function environment(run=async()=>({image:png}),quota=true){return {AI:{run},DB:{prepare:sql=>({bind(){return this},first:async()=>sql.includes('ai_usage')?(quota?{attempts:1}:null):{id:'user-1'},run:async()=>({})})},CREATIONS:{put:async()=>{}}}}
const request=(body={},authenticated=true)=>new Request('https://pinoleros.test/api/generate',{method:'POST',headers:{'content-type':'application/json',...(authenticated?{cookie:'pinoleros_session=test'}:{})},body:JSON.stringify(body)});

test('authentication required for generation and status',async()=>{
  for(const action of [generate,generationStatus,promptAssist])assert.equal((await action(request({},false),environment())).status,401);
});
test('invalid controls and references never call Workers AI',async()=>{
  const env=environment(async()=>{throw new Error('must not run')});
  for(const body of [null,[],{prompt:'x'.repeat(3001)},{prompt:'test',format:'bad'},{prompt:'test',model:'unknown'},{prompt:'test',model:'__proto__'},{prompt:'test',quality:'4K'},{prompt:'test',seed:-1},{prompt:'test',strength:2},{prompt:'test',reference:'data:image/svg+xml;base64,PHN2Zz4='}])assert.equal((await generate(request(body),env)).status,400);
});
test('FLUX uses multipart binding with real reference bytes and correct geometry',async()=>{
  let calls=0;const env=environment(async(model,input)=>{
    calls++;assert.equal(model,'@cf/black-forest-labs/flux-2-klein-4b');
    const form=await new Response(input.multipart.body,{headers:{'content-type':input.multipart.contentType}}).formData();
    assert.equal(form.get('seed'),'42');assert.equal(form.get('width'),'1536');assert.equal(form.get('height'),'864');
    assert.equal(form.get('steps'),null);assert.equal(form.get('strength'),null);
    assert.equal(Buffer.from(await form.get('input_image_0').arrayBuffer()).toString('base64'),png);
    assert.match(form.get('prompt'),/Meliodas/);return {image:png};
  });
  const r=await generate(request({prompt:'Meliodas en una ciudad',reference:image,seed:42,quality:'standard',format:'16:9'}),env);
  assert.equal(r.status,200);assert.equal((await r.json()).options[0].image,image);assert.equal(calls,1);
});
test('SDXL stream is decoded and reference strength is honored',async()=>{
  const env=environment(async(model,input)=>{
    assert.equal(model,'@cf/stabilityai/stable-diffusion-xl-base-1.0');assert.equal(input.image_b64,png);assert.equal(input.strength,0.4);assert.equal(input.num_steps,20);
    return new Response(Buffer.from(png,'base64')).body;
  });
  const r=await generate(request({prompt:'a mountain',model:'sdxl',reference:image,strength:0.4,quality:'standard'}),env);
  assert.equal(r.status,200);assert.equal((await r.json()).options[0].image,image);
});
test('daily quota stops inference before consumption',async()=>{
  let calls=0;const env=environment(async()=>{calls++;return {image:png}},false);
  assert.equal((await generate(request({prompt:'a mountain'}),env)).status,429);
  assert.equal((await promptAssist(request({prompt:'a mountain'}),env)).status,429);
  assert.equal(calls,0);
});
test('provider quota errors and invalid output are sanitized without retry',async()=>{
  let calls=0;const env=environment(async()=>{calls++;throw new Error('429 private information')});
  const r=await generate(request({prompt:'a mountain'}),env);assert.equal(r.status,429);assert.doesNotMatch(await r.text(),/private information/);assert.equal(calls,1);
  assert.equal((await generate(request({prompt:'a mountain'}),environment(async()=>({image:'bad'})))).status,503);
});
test('prompt assistant preserves character names and translates without forcing realism',async()=>{
  const env=environment(async(model,input)=>{assert.equal(model,'@cf/meta/llama-3.1-8b-instruct-fast');assert.match(input.messages[0].content,/Preserve named characters/);return {response:'Meliodas in a 2D anime illustration'}});
  const result=await promptAssist(request({prompt:'Meliodas en anime 2D'}),env);assert.equal((await result.json()).assisted,true);
  const failed=await promptAssist(request({prompt:'Original'}),environment(async()=>{throw new Error('offline')}));assert.equal((await failed.json()).prompt,'Original');
});
test('PNG favorites retain type and private storage',async()=>{
  let saved;const env=environment();env.CREATIONS.put=async(...args)=>{saved=args};
  const r=await selectCreation(request({title:'Mountain',prompt:'A mountain',image}),env);assert.equal(r.status,201);assert.match(saved[0],/^users\/user-1\/creations\/.*\.png$/);assert.equal(saved[2].httpMetadata.contentType,'image/png');
});
test('reference bounds and native aspect ratios are validated',()=>{
  const parsed=parseImage(image);assert.ok(validReference(parsed));
  new DataView(parsed.bytes.buffer).setUint32(16,1024);assert.equal(validReference(parsed),false);
  assert.equal(parseImage('data:image/png;base64,'+btoa('<svg/>')),null);
  for(const [ratio,sizes] of Object.entries(dimensions)){const [a,b]=ratio.split(':').map(Number);for(const [w,h] of sizes){assert.equal(w*b,h*a);assert.ok(w<=1920&&h<=1920)}}
});
test('browser script parses and no local engine dependency remains',()=>{
  const page=studioPage();for(const match of page.matchAll(/<script>([\s\S]*?)<\/script>/g))assert.doesNotThrow(()=>new Function(match[1]));
  assert.doesNotMatch(page,/localhost|127\.0\.0\.1|engine:start|PINOLEROS Local|\/api\/generation\/jobs/);
  assert.match(page,/id="model"/);assert.match(page,/Cloudflare/);assert.match(page,/clearInterval\(timer\)/);
});


test('actual SQLite quota SQL allows only ten atomic daily image reservations',async()=>{
  const db=new DatabaseSync(':memory:');
  db.exec('CREATE TABLE users (id TEXT PRIMARY KEY); INSERT INTO users VALUES ("test-user")'.replaceAll('"',"'"));
  db.exec(readFileSync('migrations/0007_add_ai_usage.sql','utf8'));
  const env={DB:{prepare:sql=>({bind:(...args)=>({first:async()=>db.prepare(sql).get(...args)||null})})}};
  const attempts=await Promise.all(Array.from({length:20},()=>reserveAiAttempt(env,'test-user','image')));
  assert.equal(attempts.filter(Boolean).length,10);
  assert.equal(await reserveAiAttempt(env,'test-user','prompt'),true);
  db.exec("UPDATE ai_usage SET day='2000-01-01'");
  assert.equal(await reserveAiAttempt(env,'test-user','image'),true);
  db.close();
});
