import { getUser } from "../../lib/auth";

interface GenerateInput { prompt?: unknown; style?: unknown; format?: unknown; product?: unknown; creativity?: unknown; }
interface SelectInput { title?: unknown; style?: unknown; prompt?: unknown; image?: unknown; isPublic?: unknown; }
interface PrintOrderInput { designId?: unknown; product?: unknown; color?: unknown; position?: unknown; configuration?: unknown; }
interface FluxResult { image: string; }

function stringValue(value: unknown, max: number): string | null {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max ? value.trim() : null;
}

function bytesFromDataUri(dataUri: string): Uint8Array | null {
  const match = dataUri.match(/^data:image\/jpeg;charset=utf-8;base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return null;
  const bytes = Uint8Array.from(atob(match[1]), (character) => character.charCodeAt(0));
  return bytes.byteLength <= 5 * 1024 * 1024 ? bytes : null;
}

/** Creates two preview-only image proposals. Nothing enters R2 until the user selects one. */
export async function generate(request: Request, env: Env): Promise<Response> {
  const user = await getUser(request, env);
  if (!user) return Response.json({ error: "Inicia sesión para crear con IA." }, { status: 401 });
  let input: GenerateInput;
  try { input = await request.json<GenerateInput>(); } catch { return Response.json({ error: "JSON inválido." }, { status: 400 }); }
  const prompt = stringValue(input.prompt, 1_500);
  const style = stringValue(input.style, 60) ?? "Urbano";
  if (!prompt) return Response.json({ error: "Describe tu idea para generar las propuestas." }, { status: 400 });
  const format = stringValue(input.format, 60) ?? "vertical adaptable";
  const product = stringValue(input.product, 60) ?? "camiseta";
  const creativity = stringValue(input.creativity, 40) ?? "alta";
  const enrichedPrompt = `Create an original premium ${style} artistic print design for a ${product}. ${prompt}. Compose a non-square, print-ready ${format} artwork with an organic silhouette, rich color and professional composition. Creativity: ${creativity}. No logos, watermark, or text unless explicitly requested. Avoid product mockups: generate the art asset only.`;
  try {
    const imageModel = env.AI as unknown as { run: (model: string, input: { prompt: string; steps?: number }) => Promise<FluxResult> };
    const [first, second] = await Promise.all([
      imageModel.run("@cf/black-forest-labs/flux-1-schnell", { prompt: `${enrichedPrompt} Variant A: bold central composition with dynamic diagonal movement.`, steps: 4 }),
      imageModel.run("@cf/black-forest-labs/flux-1-schnell", { prompt: `${enrichedPrompt} Variant B: a distinctly different composition with layered depth and asymmetrical energy.`, steps: 4 }),
    ]);
    return Response.json({ options: [first, second].map((result, index) => ({ id: `preview-${index + 1}`, image: `data:image/jpeg;charset=utf-8;base64,${result.image}` })) });
  } catch (error) {
    console.error("Workers AI generation failed", error);
    return Response.json({ error: "La IA no pudo generar el diseño ahora mismo. Inténtalo de nuevo en unos segundos." }, { status: 503 });
  }
}

/** Persists exactly the user-selected preview in Cloudflare R2 and D1. */
export async function selectCreation(request: Request, env: Env): Promise<Response> {
  const user = await getUser(request, env);
  if (!user) return Response.json({ error: "Inicia sesión para guardar tu creación." }, { status: 401 });
  let input: SelectInput;
  try { input = await request.json<SelectInput>(); } catch { return Response.json({ error: "JSON inválido." }, { status: 400 }); }
  const title = stringValue(input.title, 120);
  const style = stringValue(input.style, 60) ?? "Urbano";
  const prompt = stringValue(input.prompt, 1_500);
  const image = typeof input.image === "string" ? bytesFromDataUri(input.image) : null;
  if (!title || !prompt || !image) return Response.json({ error: "La creación seleccionada no es válida." }, { status: 400 });
  const id = crypto.randomUUID();
  const r2Key = `users/${user.id}/creations/${id}.jpg`;
  await env.CREATIONS.put(r2Key, image, { httpMetadata: { contentType: "image/jpeg" } });
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
  const design = await env.DB.prepare("SELECT r2_key FROM designs WHERE id = ?1 AND owner_id = ?2").bind(designId, user.id).first<{ r2_key: string }>();
  if (!design?.r2_key) return new Response("Not Found", { status: 404 });
  const object = await env.CREATIONS.get(design.r2_key);
  if (!object) return new Response("Not Found", { status: 404 });
  return new Response(object.body, { headers: { "content-type": object.httpMetadata?.contentType ?? "image/jpeg", "cache-control": "private, max-age=3600" } });
}
