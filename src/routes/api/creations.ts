import { createCloudImage, cloudError, dimensions, imageModels, validReference } from "../../lib/cloud-images";
import { reserveAiAttempt } from "../../lib/ai-usage";
import { parseImage } from "../../lib/image-data";
import { getUser } from "../../lib/auth";

interface GenerateInput { prompt?: unknown; style?: unknown; format?: unknown; quality?: unknown; reference?: unknown; colors?: unknown; seed?: unknown; strength?: unknown; model?: unknown; }
interface PromptAssistInput { prompt?: unknown; style?: unknown; format?: unknown; colors?: unknown; }
interface SelectInput { title?: unknown; style?: unknown; prompt?: unknown; image?: unknown; isPublic?: unknown; }
interface PrintOrderInput { designId?: unknown; product?: unknown; color?: unknown; position?: unknown; configuration?: unknown; }

function stringValue(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max ? value.trim() : null;
}

/** Binding presence is not a live quota or model-access check. */
export async function generationStatus(request: Request, env: Env): Promise<Response> {
  const user = await getUser(request, env);
  if (!user) return Response.json({ error: "Inicia sesión para consultar el estudio." }, { status: 401 });
  return Response.json({ configured: Boolean(env.AI), provider: "Cloudflare Workers AI", models: imageModels,
    limits: { imageAttemptsPerDay: 10, promptAttemptsPerDay: 20 } }, { headers: { "cache-control": "no-store" } });
}

export async function promptAssist(request: Request, env: Env): Promise<Response> {
  const user = await getUser(request, env);
  if (!user) return Response.json({ error: "Inicia sesión para usar el asistente creativo." }, { status: 401 });
  let input: PromptAssistInput;
  try { input = await request.json<PromptAssistInput>(); } catch { return Response.json({ error: "JSON inválido." }, { status: 400 }); }
  const prompt = input && typeof input === "object" ? stringValue(input.prompt, 3000) : null;
  if (!prompt) return Response.json({ error: "Escribe una descripción de hasta 3000 caracteres." }, { status: 400 });
  try {
    if (!await reserveAiAttempt(env, user.id, "prompt")) return Response.json({ error: "Llegaste al límite diario de 20 mejoras de descripción." }, { status: 429 });
    const output = await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fast", {
      messages: [{ role: "system", content: "Rewrite the user's image description as a concise English image prompt, maximum 150 words. Preserve named characters, subject counts, requested text and style. Translate Spanish accurately. Do not add unrequested characters, scenes or force photorealism. Return only the prompt." },
        { role: "user", content: prompt }], max_tokens: 250,
    });
    const enhanced = "response" in output && typeof output.response === "string" ? output.response.trim() : undefined;
    return Response.json({ prompt: enhanced?.slice(0, 3000) || prompt, assisted: Boolean(enhanced), notice: enhanced ? undefined : "Conservamos tu descripción original." });
  } catch {
    return Response.json({ prompt, assisted: false, notice: "El asistente de Cloudflare no respondió. Conservamos tu descripción original." });
  }
}

/** Inference runs on Cloudflare GPUs, while the browser awaits the completed result. */
export async function generate(request: Request, env: Env): Promise<Response> {
  const user = await getUser(request, env);
  if (!user) return Response.json({ error: "Inicia sesión para crear con IA." }, { status: 401 });
  let input: GenerateInput;
  try { input = await request.json<GenerateInput>(); } catch { return Response.json({ error: "JSON inválido." }, { status: 400 }); }
  if (!input || typeof input !== "object" || Array.isArray(input)) return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  const prompt = stringValue(input.prompt, 3000);
  const format = input.format ?? "16:9", quality = input.quality ?? "draft", model = input.model ?? "flux";
  const seed = input.seed ?? crypto.getRandomValues(new Uint32Array(1))[0] % 2147483647;
  const strength = input.strength ?? 0.65;
  if (!prompt || typeof format !== "string" || !Object.hasOwn(dimensions, format)
      || typeof model !== "string" || !Object.hasOwn(imageModels, model)
      || (quality !== "draft" && quality !== "standard")
      || typeof seed !== "number" || !Number.isInteger(seed) || seed < 0 || seed > 2147483647
      || typeof strength !== "number" || !Number.isFinite(strength) || strength < 0.2 || strength > 0.9) {
    return Response.json({ error: "Revisa la descripción, el modelo, el formato y los controles de generación." }, { status: 400 });
  }
  const reference = input.reference ? parseImage(input.reference, 2 * 1024 * 1024) : null;
  if (input.reference && (!reference || !validReference(reference))) return Response.json({ error: "Vuelve a cargar la referencia desde la página para prepararla en PNG de hasta 512 píxeles." }, { status: 400 });
  if (!env.AI) return Response.json({ error: "Falta activar Workers AI en este despliegue." }, { status: 503 });
  try {
    if (!await reserveAiAttempt(env, user.id, "image")) return Response.json({ error: "Llegaste al límite diario de 10 solicitudes de imágenes. Vuelve mañana (reinicio a las 00:00 UTC)." }, { status: 429 });
    const result = await createCloudImage(env, { prompt, format: format as keyof typeof dimensions, quality,
      model: model as keyof typeof imageModels, seed, strength, reference,
      style: stringValue(input.style, 60) ?? "Realista", colors: stringValue(input.colors, 100) ?? "" });
    return Response.json({ options: [result] }, { headers: { "cache-control": "no-store" } });
  } catch (error) { return cloudError(error); }
}

/** Persists exactly the user-selected preview in Cloudflare R2 and D1. */
export async function selectCreation(request: Request, env: Env): Promise<Response> {
  const user = await getUser(request, env);
  if (!user) return Response.json({ error: "Inicia sesión para guardar tu creación." }, { status: 401 });
  let input: SelectInput;
  try { input = await request.json<SelectInput>(); } catch { return Response.json({ error: "JSON inválido." }, { status: 400 }); }
  if (!input || typeof input !== "object" || Array.isArray(input)) return Response.json({ error: "Solicitud inválida." }, { status: 400 });
  const title = stringValue(input.title, 120);
  const style = stringValue(input.style, 60) ?? "Urbano";
  const prompt = stringValue(input.prompt, 6_000);
  const image = typeof input.image === "string" ? parseImage(input.image) : null;
  if (!title || !prompt || !image) return Response.json({ error: "La creación seleccionada no es válida." }, { status: 400 });
  const id = crypto.randomUUID();
  const r2Key = `users/${user.id}/creations/${id}.${image.extension}`;
  await env.CREATIONS.put(r2Key, image.bytes, { httpMetadata: { contentType: image.mime } });
  const isPublic = input.isPublic === true || input.isPublic === "on" ? 1 : 0;
  await env.DB.prepare("INSERT INTO designs (id, title, style, prompt, owner_id, r2_key, selected_at, is_public) VALUES (?1, ?2, ?3, ?4, ?5, ?6, CURRENT_TIMESTAMP, ?7)")
    .bind(id, title, style, prompt, user.id, r2Key, isPublic).run();
  await env.DB.prepare("INSERT INTO design_likes (user_id, design_id) VALUES (?1, ?2)").bind(user.id, id).run();
  return Response.json({ id, title, style, isPublic: Boolean(isPublic), imageUrl: `/api/media/${id}` }, { status: 201 });
}

export async function myCreations(request: Request, env: Env): Promise<Response> {
  const user = await getUser(request, env);
  if (!user) return Response.json({ error: "Inicia sesión para ver tus creaciones." }, { status: 401 });
  const { results } = await env.DB.prepare("SELECT id, title, style, is_public, created_at FROM designs WHERE owner_id = ?1 ORDER BY created_at DESC")
    .bind(user.id).all<{ id: string; title: string; style: string; is_public: number; created_at: string }>();
  return Response.json({ creations: results.map((creation) => ({ ...creation, imageUrl: `/api/media/${creation.id}` })) });
}

/** Removes only a creation owned by the active account, from both R2 and D1. */
export async function deleteCreation(request: Request, env: Env, designId: string): Promise<Response> {
  const user = await getUser(request, env);
  if (!user) return Response.json({ error: "Inicia sesión para modificar tu biblioteca." }, { status: 401 });
  const design = await env.DB.prepare("SELECT r2_key FROM designs WHERE id = ?1 AND owner_id = ?2").bind(designId, user.id).first<{ r2_key: string | null }>();
  if (!design) return Response.json({ error: "No tienes acceso a este diseño." }, { status: 404 });
  if (design.r2_key) await env.CREATIONS.delete(design.r2_key);
  await env.DB.prepare("DELETE FROM designs WHERE id = ?1 AND owner_id = ?2").bind(designId, user.id).run();
  return Response.json({ deleted: true });
}

/** Creates a print request for a creation owned by the current account. */
export async function createPrintOrder(request: Request, env: Env): Promise<Response> {
  const user = await getUser(request, env);
  if (!user) return Response.json({ error: "Inicia sesión para imprimir tu diseño." }, { status: 401 });
  let input: PrintOrderInput;
  try { input = await request.json<PrintOrderInput>(); } catch { return Response.json({ error: "JSON inválido." }, { status: 400 }); }
  const designId = stringValue(input.designId, 80);
  const product = stringValue(input.product, 60);
  if (!designId || !product) return Response.json({ error: "Selecciona un diseño y un producto." }, { status: 400 });
  const design = await env.DB.prepare("SELECT id, title FROM designs WHERE id = ?1 AND owner_id = ?2").bind(designId, user.id).first<{ id: string; title: string }>();
  if (!design) return Response.json({ error: "No tienes acceso a este diseño." }, { status: 404 });
  const id = crypto.randomUUID();
  const color = stringValue(input.color, 40);
  const position = stringValue(input.position, 40);
  const configuration = stringValue(input.configuration, 1_000);
  await env.DB.prepare("INSERT INTO print_orders (id, user_id, design_id, product, product_color, design_position, configuration) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)")
    .bind(id, user.id, design.id, product, color, position, configuration).run();
  return Response.json({ id, design: design.title, product, status: "requested" }, { status: 201 });
}

export async function media(request: Request, env: Env, designId: string): Promise<Response> {
  const user = await getUser(request, env);
  if (!user) return new Response("Unauthorized", { status: 401 });
  const design = await env.DB.prepare("SELECT r2_key FROM designs WHERE id = ?1 AND (owner_id = ?2 OR ?3 = 'master')").bind(designId, user.id, user.role).first<{ r2_key: string }>();
  if (!design?.r2_key) return new Response("Not Found", { status: 404 });
  const object = await env.CREATIONS.get(design.r2_key);
  if (!object) return new Response("Not Found", { status: 404 });
  return new Response(object.body, { headers: { "content-type": object.httpMetadata?.contentType ?? "image/jpeg", "cache-control": "private, no-store" } });
}
