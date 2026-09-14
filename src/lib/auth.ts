const encoder = new TextEncoder();
const sessionLifetimeSeconds = 60 * 60 * 24 * 14;

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function sha256(value: string): Promise<string> {
  return toBase64(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}

export async function hashPassword(password: string, salt = crypto.getRandomValues(new Uint8Array(16))): Promise<{ hash: string; salt: string }> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  // Cloudflare Workers supports PBKDF2 iteration counts up to 100,000.
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100_000, hash: "SHA-256" }, key, 256);
  return { hash: toBase64(new Uint8Array(bits)), salt: toBase64(salt) };
}

export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  const saltBytes = Uint8Array.from(atob(salt), (character) => character.charCodeAt(0));
  return (await hashPassword(password, saltBytes)).hash === expectedHash;
}

export function readSessionToken(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)pinoleros_session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function getUser(request: Request, env: Env): Promise<{ id: string; email: string } | null> {
  const token = readSessionToken(request);
  if (!token) return null;
  const tokenHash = await sha256(token);
  return env.DB.prepare("SELECT users.id, users.email FROM sessions JOIN users ON users.id = sessions.user_id WHERE sessions.token_hash = ?1 AND sessions.expires_at > CURRENT_TIMESTAMP")
    .bind(tokenHash).first<{ id: string; email: string }>();
}

export async function createSession(userId: string, env: Env): Promise<string> {
  const token = toBase64(crypto.getRandomValues(new Uint8Array(32)));
  const tokenHash = await sha256(token);
  await env.DB.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?1, ?2, datetime('now', '+14 days'))")
    .bind(tokenHash, userId).run();
  return token;
}

export async function deleteSession(request: Request, env: Env): Promise<void> {
  const token = readSessionToken(request);
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?1").bind(await sha256(token)).run();
}

export function sessionCookie(token: string): string {
  return `pinoleros_session=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${sessionLifetimeSeconds}`;
}

export const clearSessionCookie = "pinoleros_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0";
