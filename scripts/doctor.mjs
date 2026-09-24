import { spawnSync } from 'node:child_process';
console.log('PINOLEROS online: Workers AI + D1 + R2. No requiere motor local.');
const result=spawnSync('npx',['wrangler','whoami'],{stdio:'inherit',shell:process.platform==='win32'});
if(result.status!==0){console.log('Conecta tu cuenta desde una terminal con npx wrangler login.');process.exitCode=1}
console.log('Antes de publicar: npm run check y npm run db:migrate:remote. Publica con npm run deploy.');
