export async function reserveAiAttempt(env: Env, owner: string, action: "image" | "prompt"): Promise<boolean> {
  const limit = action === "image" ? 10 : 20;
  const row = await env.DB.prepare(`INSERT INTO ai_usage (owner_id, day, action, attempts)
    VALUES (?1, date('now'), ?2, 1)
    ON CONFLICT(owner_id, day, action) DO UPDATE SET attempts = attempts + 1
    WHERE attempts < ?3 RETURNING attempts`).bind(owner, action, limit).first<{ attempts: number }>();
  return Boolean(row);
}
