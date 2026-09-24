import { getUser } from '../../lib/auth';
import { parseImage } from '../../lib/image-data';
import { validReference } from '../../lib/cloud-images';
const reply = (data: unknown, status = 200) => Response.json(data,{ status,headers:{'cache-control':'no-store'} });
export async function references(request: Request, env: Env): Promise<Response> {
  const user = await getUser(request,env);
  if (!user) return reply({error:'Inicia sesión para usar las referencias.'},401);
  const path = new URL(request.url).pathname;
  if(request.method==='GET' && path==='/api/references') {
    const sql=user.role==='master'?'SELECT id,title,prompt,tags,enabled FROM creative_references ORDER BY created_at DESC,id LIMIT 100':'SELECT id,title FROM creative_references WHERE enabled=1 ORDER BY created_at DESC,id LIMIT 100';
    const {results}=await env.DB.prepare(sql).all();return reply({references:results});
  }
  if(user.role!=='master')return reply({error:'Solo el master puede gestionar ejemplos.'},403);
  const id=path.slice('/api/references/'.length);
  if(request.method==='GET' && id && path.startsWith('/api/references/')) {
    const row=await env.DB.prepare('SELECT r2_key FROM creative_references WHERE id=?1').bind(id).first<{r2_key:string}>();
    if(!row)return reply({error:'Referencia no encontrada.'},404);
    const object=await env.CREATIONS.get(row.r2_key);if(!object)return reply({error:'Imagen no encontrada.'},404);
    return new Response(object.body,{headers:{'content-type':'image/png','cache-control':'private, no-store'}});
  }
  const origin=request.headers.get('origin');
  if((origin && origin!==new URL(request.url).origin)||request.headers.get('sec-fetch-site')==='cross-site')return reply({error:'Origen no permitido.'},403);
  if(request.method==='DELETE' && id && path.startsWith('/api/references/')){
    const row=await env.DB.prepare('SELECT r2_key FROM creative_references WHERE id=?1').bind(id).first<{r2_key:string}>();
    if(!row)return reply({error:'Referencia no encontrada.'},404);
    await env.CREATIONS.delete(row.r2_key);await env.DB.prepare('DELETE FROM creative_references WHERE id=?1').bind(id).run();return reply({ok:true});
  }
  if(request.method!=='POST')return reply({error:'Ruta no encontrada.'},404);
  if(Number(request.headers.get('content-length'))>3_000_000)return reply({error:'Imagen demasiado grande.'},413);
  let body: Record<string,unknown>;try{body=await request.json();}catch{return reply({error:'Solicitud inválida.'},400)}
  if(!body||typeof body!=='object'||Array.isArray(body))return reply({error:'Solicitud inválida.'},400);
  if(path!=='/api/references'){
    if(typeof body.enabled!=='boolean')return reply({error:'Estado inválido.'},400);
    const row=await env.DB.prepare('UPDATE creative_references SET enabled=?1 WHERE id=?2 RETURNING id').bind(body.enabled?1:0,id).first();return row?reply({ok:true}):reply({error:'Referencia no encontrada.'},404);
  }
  const title=typeof body.title==='string'?body.title.trim():'',prompt=typeof body.prompt==='string'?body.prompt.trim():'',tags=typeof body.tags==='string'?body.tags.trim():'';
  const image=parseImage(body.image,2*1024*1024);
  if(!title||title.length>120||!prompt||prompt.length>3000||tags.length>300||!image||!validReference(image))return reply({error:'Agrega título, prompt y una imagen PNG preparada de hasta 512 píxeles.'},400);
  const count=await env.DB.prepare('SELECT COUNT(*) AS total FROM creative_references').first<{total:number}>();
  if((count?.total??0)>=100)return reply({error:'Hay 100 referencias. Elimina una antes de agregar otra.'},409);
  const newId=crypto.randomUUID(),key='references/'+newId+'.png';
  await env.CREATIONS.put(key,image.bytes,{httpMetadata:{contentType:'image/png'}});
  try{await env.DB.prepare('INSERT INTO creative_references(id,title,prompt,tags,r2_key,created_by) VALUES(?1,?2,?3,?4,?5,?6)').bind(newId,title,prompt,tags,key,user.id).run()}
  catch{await env.CREATIONS.delete(key);return reply({error:'No se pudo guardar el ejemplo.'},503)}
  return reply({id:newId},201);
}
