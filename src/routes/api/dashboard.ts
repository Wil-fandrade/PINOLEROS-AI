interface Design {
  id: string;
  title: string;
  style: string;
  created_at: string;
}

interface CreateDesignInput {
  title?: unknown;
  style?: unknown;
  prompt?: unknown;
}

const trends = ["#Anime", "#Streetwear", "#Tropical", "#Graffiti", "#3D", "#Vintage"];

/** Reads the latest saved designs from Cloudflare D1. */
export async function dashboardData(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT id, title, style, created_at FROM designs ORDER BY created_at DESC LIMIT 4",
  ).all<Design>();

  return Response.json({ recentDesigns: results, trends }, {
    headers: { "cache-control": "no-store" },
  });
}

/** Saves a design draft. Authentication will supply user ownership in the next phase. */
export async function createDesign(request: Request, env: Env): Promise<Response> {
  let input: CreateDesignInput;

  try {
    input = await request.json<CreateDesignInput>();
  } catch {
    return Response.json({ error: "El cuerpo debe ser JSON válido." }, { status: 400 });
  }

  const title = typeof input.title === "string" ? input.title.trim() : "";
  const style = typeof input.style === "string" ? input.style.trim() : "Sin estilo";
  const prompt = typeof input.prompt === "string" ? input.prompt.trim() : null;

  if (!title || title.length > 120 || style.length > 60 || (prompt?.length ?? 0) > 1_000) {
    return Response.json({ error: "Revisa el título, estilo o prompt del diseño." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO designs (id, title, style, prompt) VALUES (?1, ?2, ?3, ?4)",
  ).bind(id, title, style, prompt).run();

  return Response.json({ id, title, style }, { status: 201 });
}
