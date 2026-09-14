import { clearSessionCookie, createSession, deleteSession, getUser, hashPassword, sessionCookie, verifyPassword } from "../../lib/auth";

interface Credentials { email?: unknown; password?: unknown; phone?: unknown; name?: unknown; nickname?: unknown; }

async function credentials(request: Request): Promise<{ email: string; password: string; phone: string; name: string; nickname: string } | null> {
  try {
    const input = await request.json<Credentials>();
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const password = typeof input.password === "string" ? input.password : "";
    const phone = typeof input.phone === "string" ? input.phone.trim().replace(/[^+\d() -]/g, "") : "";
    const name = typeof input.name === "string" ? input.name.trim() : "";
    const nickname = typeof input.nickname === "string" ? input.nickname.trim() : "";
    return email.includes("@") && email.length <= 254 && password.length >= 10 && password.length <= 128 && phone.length <= 32 && name.length <= 80 && nickname.length <= 50 ? { email, password, phone, name, nickname } : null;
  } catch { return null; }
}

export async function register(request: Request, env: Env): Promise<Response> {
  const input = await credentials(request);
  if (!input) return Response.json({ error: "Usa un correo válido y una contraseña de al menos 10 caracteres." }, { status: 400 });
  if (input.phone.length < 7 || input.name.length < 2) return Response.json({ error: "Agrega tu nombre y un número móvil válido." }, { status: 400 });
  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?1").bind(input.email).first();
  if (existing) return Response.json({ error: "Este correo ya está registrado." }, { status: 409 });
  const id = crypto.randomUUID();
  const password = await hashPassword(input.password);
  await env.DB.prepare("INSERT INTO users (id, email, phone, name, nickname, password_hash, password_salt) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)")
    .bind(id, input.email, input.phone, input.name, input.nickname || null, password.hash, password.salt).run();
  const token = await createSession(id, env);
  return Response.json({ user: { id, email: input.email } }, { status: 201, headers: { "set-cookie": sessionCookie(token) } });
}

export async function login(request: Request, env: Env): Promise<Response> {
  const input = await credentials(request);
  if (!input) return Response.json({ error: "Correo o contraseña inválidos." }, { status: 400 });
  const user = await env.DB.prepare("SELECT id, email, password_hash, password_salt FROM users WHERE email = ?1").bind(input.email)
    .first<{ id: string; email: string; password_hash: string; password_salt: string }>();
  if (!user || !(await verifyPassword(input.password, user.password_salt, user.password_hash))) return Response.json({ error: "Correo o contraseña inválidos." }, { status: 401 });
  const token = await createSession(user.id, env);
  return Response.json({ user: { id: user.id, email: user.email } }, { headers: { "set-cookie": sessionCookie(token) } });
}

export async function me(request: Request, env: Env): Promise<Response> {
  const user = await getUser(request, env);
  return Response.json({ user });
}

export async function logout(request: Request, env: Env): Promise<Response> {
  await deleteSession(request, env);
  return Response.json({ ok: true }, { headers: { "set-cookie": clearSessionCookie } });
}
