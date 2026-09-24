import { getUser, hashPassword } from '../../lib/auth';
import { adminPage } from '../admin';
const reply = (data: unknown, status = 200) => Response.json(data, { status, headers: { 'cache-control': 'no-store' } });
const str = (v: unknown, max: number) => typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max ? v.trim() : null;
export async function admin(request: Request, env: Env): Promise<Response> {
  const actor = await getUser(request, env);
  if (!actor) return reply({ error: 'Inicia sesión para entrar al panel.' }, 401);
  if (actor.role !== 'master') return reply({ error: 'Solo una cuenta master puede administrar la plataforma.' }, 403);
  const url = new URL(request.url), path = url.pathname;
  if (path === '/admin' && request.method === 'GET') return adminPage();
  if (request.method === 'GET' && path === '/api/admin') {
    const page = Math.max(0, Math.min(100000, Number(url.searchParams.get('page')) || 0));
    const offset = Math.floor(page) * 50;
    const [users, designs, orders] = await Promise.all([
      env.DB.prepare('SELECT id, name, email, phone, role, disabled FROM users ORDER BY created_at DESC, id LIMIT 50 OFFSET ?1').bind(offset).all(),
      env.DB.prepare('SELECT id, title, style, prompt, owner_id, is_public FROM designs ORDER BY created_at DESC, id LIMIT 50 OFFSET ?1').bind(offset).all(),
      env.DB.prepare('SELECT print_orders.*, users.email FROM print_orders JOIN users ON users.id = print_orders.user_id ORDER BY print_orders.created_at DESC, print_orders.id LIMIT 50 OFFSET ?1').bind(offset).all()
    ]);
    return reply({ users: users.results, designs: designs.results, orders: orders.results, page: Math.floor(page), actor: actor.id });
  }
  if (request.method !== 'POST') return reply({ error: 'Ruta no encontrada.' }, 404);
  const origin = request.headers.get('origin');
  if ((origin && origin !== url.origin) || request.headers.get('sec-fetch-site') === 'cross-site') return reply({ error: 'Origen no permitido.' }, 403);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return reply({ error: 'JSON inválido.' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return reply({ error: 'Solicitud inválida.' }, 400);
  const id = str(body.id, 80);
  try {
    if (path === '/api/admin/users/create') {
      const email = str(body.email, 254)?.toLowerCase(), name = str(body.name, 80), phone = str(body.phone, 32);
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name || !phone || typeof body.password !== 'string' || body.password.length < 10 || body.password.length > 128 || !['user','master'].includes(String(body.role))) return reply({ error: 'Revisa los datos y usa una contraseña de 10 a 128 caracteres.' }, 400);
      const password = await hashPassword(body.password);
      await env.DB.prepare('INSERT INTO users(id,email,name,phone,role,password_hash,password_salt) VALUES(?1,?2,?3,?4,?5,?6,?7)').bind(crypto.randomUUID(),email,name,phone,body.role,password.hash,password.salt).run();
      return reply({ ok: true }, 201);
    }
    if (!id) return reply({ error: 'Identificador inválido.' }, 400);
    if (path === '/api/admin/users/update') {
      const name = str(body.name, 80), phone = str(body.phone, 32);
      if (!name || !phone || !['user','master'].includes(String(body.role)) || typeof body.disabled !== 'boolean') return reply({ error: 'Datos de usuario inválidos.' }, 400);
      if (id === actor.id && (body.disabled || body.role !== 'master')) return reply({ error: 'No puedes quitarte tu propio acceso master.' }, 409);
      const updated = await env.DB.prepare('UPDATE users SET name=?1,phone=?2,role=?3,disabled=?4 WHERE id=?5 RETURNING id').bind(name,phone,body.role,body.disabled?1:0,id).first();
      return updated ? reply({ ok: true }) : reply({ error: 'Usuario no encontrado.' },404);
    }
    if (path === '/api/admin/users/revoke') {
      await env.DB.prepare('DELETE FROM sessions WHERE user_id=?1').bind(id).run();
      return reply({ ok: true });
    }
    if (path === '/api/admin/users/quota') {
      await env.DB.prepare("DELETE FROM ai_usage WHERE owner_id=?1 AND day=date('now')").bind(id).run();
      return reply({ ok: true });
    }
    if (path === '/api/admin/designs/update') {
      const title = str(body.title,120), style = str(body.style,60), prompt = str(body.prompt,6000);
      if (!title || !style || !prompt || typeof body.isPublic !== 'boolean') return reply({ error: 'Datos de diseño inválidos.' },400);
      const updated = await env.DB.prepare('UPDATE designs SET title=?1,style=?2,prompt=?3,is_public=?4 WHERE id=?5 RETURNING id').bind(title,style,prompt,body.isPublic?1:0,id).first();
      return updated ? reply({ ok: true }) : reply({ error: 'Diseño no encontrado.' },404);
    }
    if (path === '/api/admin/designs/delete') {
      const design = await env.DB.prepare('SELECT r2_key FROM designs WHERE id=?1').bind(id).first<{r2_key:string|null}>();
      if (!design) return reply({ error: 'Diseño no encontrado.' },404);
      if (design.r2_key) await env.CREATIONS.delete(design.r2_key);
      await env.DB.prepare('DELETE FROM designs WHERE id=?1').bind(id).run();
      return reply({ ok: true });
    }
    if (path === '/api/admin/orders/update') {
      const product = str(body.product,60);
      if (!product || !['requested','confirmed','in_progress','completed','cancelled'].includes(String(body.status))) return reply({ error: 'Pedido inválido.' },400);
      const updated = await env.DB.prepare('UPDATE print_orders SET product=?1,status=?2 WHERE id=?3 RETURNING id').bind(product,body.status,id).first();
      return updated ? reply({ ok: true }) : reply({ error: 'Pedido no encontrado.' },404);
    }
    if (path === '/api/admin/orders/delete') {
      await env.DB.prepare('DELETE FROM print_orders WHERE id=?1').bind(id).run();
      return reply({ ok: true });
    }
    return reply({ error: 'Ruta no encontrada.' },404);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    return reply({ error: message.includes('LAST_MASTER') ? 'Debe quedar al menos un master activo.' : message.includes('UNIQUE') ? 'Ese correo ya está registrado.' : 'No se pudo guardar el cambio.' },409);
  }
}
