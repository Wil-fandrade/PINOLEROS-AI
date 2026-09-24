import { clearSessionCookie, createSession, deleteSession, getUser, hashPassword, sessionCookie, sha256, verifyPassword } from "../../lib/auth";

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
  try {
    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?1").bind(input.email).first();
    if (existing) return Response.json({ error: "Este correo ya está registrado. Inicia sesión con tu correo y contraseña." }, { status: 409 });
    const id = crypto.randomUUID();
    const password = await hashPassword(input.password);
    await env.DB.prepare("INSERT INTO users (id, email, phone, name, nickname, password_hash, password_salt) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)")
      .bind(id, input.email, input.phone, input.name, input.nickname || null, password.hash, password.salt).run();
    const token = await createSession(id, env);
    return Response.json({ user: { id, email: input.email } }, { status: 201, headers: { "set-cookie": sessionCookie(token) } });
  } catch (error) {
    console.error("Registration failed", error);
    return Response.json({ error: "No pudimos crear la cuenta. Inténtalo de nuevo en un momento." }, { status: 503 });
  }
}

export async function login(request: Request, env: Env): Promise<Response> {
  const input = await credentials(request);
  if (!input) return Response.json({ error: "Correo o contraseña inválidos." }, { status: 400 });
  if (!await allowAuthAttempt(request, env, input.email)) return Response.json({ error: "Demasiados intentos. Inténtalo en una hora." }, { status: 429 });
  const user = await env.DB.prepare("SELECT id, email, role, password_hash, password_salt FROM users WHERE email = ?1").bind(input.email)
    .first<{ id: string; email: string; role: "user" | "master"; password_hash: string; password_salt: string }>();
  if (!user || !(await verifyPassword(input.password, user.password_salt, user.password_hash))) return Response.json({ error: "Correo o contraseña inválidos." }, { status: 401 });
  const token = await createSession(user.id, env);
  return Response.json({ user: { id: user.id, email: user.email, role: user.role } }, { headers: { "set-cookie": sessionCookie(token) } });
}

export async function me(request: Request, env: Env): Promise<Response> {
  const user = await getUser(request, env);
  return Response.json({ user });
}

export async function logout(request: Request, env: Env): Promise<Response> {
  await deleteSession(request, env);
  return Response.json({ ok: true }, { headers: { "set-cookie": clearSessionCookie } });
}

/** Persistent hourly limits shared by login, password changes and recovery. */
async function allowAuthAttempt(request: Request, env: Env, email: string): Promise<boolean> {
  const hour = Math.floor(Date.now() / 3_600_000);
  const keys = [await sha256(`account:${email}:${hour}`), await sha256(`ip:${request.headers.get("cf-connecting-ip") ?? "local"}:${hour}`)];
  await env.DB.prepare("DELETE FROM auth_attempts WHERE expires_at < ?1").bind(Date.now()).run();
  for (let i = 0; i < keys.length; i++) {
    const row = await env.DB.prepare(`INSERT INTO auth_attempts (bucket, attempts, expires_at) VALUES (?1, 1, ?2)
      ON CONFLICT(bucket) DO UPDATE SET attempts = attempts + 1 WHERE attempts < ?3 RETURNING attempts`)
      .bind(keys[i], (hour + 1) * 3_600_000, i === 0 ? 20 : 100).first();
    if (!row) return false;
  }
  return true;
}

export async function changePassword(request: Request, env: Env): Promise<Response> {
  const user = await getUser(request, env);
  if (!user) return Response.json({ error: "Inicia sesión para cambiar tu contraseña." }, { status: 401 });
  let input: { currentPassword?: unknown; newPassword?: unknown };
  try { input = await request.json(); } catch { return Response.json({ error: "Solicitud inválida." }, { status: 400 }); }
  if (!input || typeof input.currentPassword !== "string" || input.currentPassword.length > 128 || !validPassword(input.newPassword)) {
    return Response.json({ error: "Introduce tu contraseña actual y una nueva de 10 a 128 caracteres." }, { status: 400 });
  }
  if (!await allowAuthAttempt(request, env, user.email)) return Response.json({ error: "Demasiados intentos. Inténtalo en una hora." }, { status: 429 });
  const record = await env.DB.prepare("SELECT password_hash, password_salt FROM users WHERE id = ?1").bind(user.id).first<{ password_hash: string; password_salt: string }>();
  if (!record || !await verifyPassword(input.currentPassword, record.password_salt, record.password_hash)) return Response.json({ error: "La contraseña actual no es correcta." }, { status: 403 });
  const password = await hashPassword(input.newPassword);
  const updated = await env.DB.prepare("UPDATE users SET password_hash = ?1, password_salt = ?2 WHERE id = ?3 AND password_hash = ?4 RETURNING id")
    .bind(password.hash, password.salt, user.id, record.password_hash).first();
  if (!updated) return Response.json({ error: "La cuenta cambió. Vuelve a iniciar sesión." }, { status: 409 });
  return Response.json({ ok: true, message: "Contraseña actualizada. Inicia sesión de nuevo en tus dispositivos y genera otro código de recuperación." }, { headers: { "set-cookie": clearSessionCookie, "cache-control": "no-store" } });
}

function validPassword(value: unknown): value is string {
  return typeof value === "string" && value.length >= 10 && value.length <= 128;
}

export async function recoveryCode(request: Request, env: Env): Promise<Response> {
  const user = await getUser(request, env);
  if (!user) return Response.json({ error: "Inicia sesión para crear tu código." }, { status: 401 });
  let input: { currentPassword?: unknown };
  try { input = await request.json(); } catch { return Response.json({ error: "Solicitud inválida." }, { status: 400 }); }
  if (!input || !validPassword(input.currentPassword)) return Response.json({ error: "Introduce tu contraseña actual." }, { status: 400 });
  if (!await allowAuthAttempt(request, env, user.email)) return Response.json({ error: "Demasiados intentos. Inténtalo en una hora." }, { status: 429 });
  const record = await env.DB.prepare("SELECT password_hash, password_salt FROM users WHERE id = ?1").bind(user.id).first<{ password_hash: string; password_salt: string }>();
  if (!record || !await verifyPassword(input.currentPassword, record.password_salt, record.password_hash)) return Response.json({ error: "La contraseña actual no es correcta." }, { status: 403 });
  const code = Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, "0")).join("");
  const updated = await env.DB.prepare("UPDATE users SET recovery_hash = ?1 WHERE id = ?2 AND password_hash = ?3 RETURNING id").bind(await sha256(code), user.id, record.password_hash).first();
  if (!updated) return Response.json({ error: "La cuenta cambió. Vuelve a iniciar sesión." }, { status: 409 });
  return Response.json({ code }, { headers: { "cache-control": "no-store" } });
}

export async function recoverPassword(request: Request, env: Env): Promise<Response> {
  let input: { email?: unknown; code?: unknown; newPassword?: unknown };
  try { input = await request.json(); } catch { return Response.json({ error: "Solicitud inválida." }, { status: 400 }); }
  if (!input || typeof input.email !== "string" || input.email.length > 254 || typeof input.code !== "string" || !/^[a-f0-9]{48}$/i.test(input.code.trim()) || !validPassword(input.newPassword)) {
    return Response.json({ error: "Introduce tu correo, el código de recuperación de 48 caracteres y una contraseña de 10 a 128 caracteres." }, { status: 400 });
  }
  const email = input.email.trim().toLowerCase();
  if (!await allowAuthAttempt(request, env, email)) return Response.json({ error: "Demasiados intentos. Inténtalo en una hora." }, { status: 429 });
  const password = await hashPassword(input.newPassword);
  // One conditional update consumes the code; the trigger atomically revokes sessions.
  const updated = await env.DB.prepare("UPDATE users SET password_hash = ?1, password_salt = ?2 WHERE email = ?3 AND recovery_hash = ?4 RETURNING id")
    .bind(password.hash, password.salt, email, await sha256(input.code.trim().toLowerCase())).first();
  if (!updated) return Response.json({ error: "Correo o código inválido. El código puede haberse utilizado o reemplazado." }, { status: 400 });
  return Response.json({ ok: true, message: "Contraseña restablecida. Inicia sesión y genera un nuevo código de recuperación." }, { headers: { "set-cookie": clearSessionCookie, "cache-control": "no-store" } });
}
