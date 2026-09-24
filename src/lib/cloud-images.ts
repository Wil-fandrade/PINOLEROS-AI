import { parseImage } from "./image-data";

export const imageModels = {
  flux: { id: "@cf/black-forest-labs/flux-2-klein-4b", label: "FLUX.2 Klein · Cloudflare", references: true },
  sdxl: { id: "@cf/stabilityai/stable-diffusion-xl-base-1.0", label: "SDXL · Cloudflare", references: true },
} as const;
export const dimensions = {
  "16:9": [[1024, 576], [1536, 864]], "9:16": [[576, 1024], [864, 1536]],
  "1:1": [[768, 768], [1024, 1024]], "4:5": [[768, 960], [1024, 1280]],
  "3:2": [[1152, 768], [1536, 1024]],
} as const;

export interface CloudImageInput {
  prompt: string; style: string; colors: string; model: keyof typeof imageModels;
  format: keyof typeof dimensions; quality: "draft" | "standard";
  seed: number; strength: number; reference: ReturnType<typeof parseImage>;
}

/** References are normalized by the browser; validate dimensions again at the server. */
export function validReference(image: NonNullable<CloudImageInput["reference"]>): boolean {
  if (image.mime !== "image/png" || image.bytes.length < 33) return false;
  const view = new DataView(image.bytes.buffer, image.bytes.byteOffset, image.bytes.byteLength);
  const width = view.getUint32(16), height = view.getUint32(20);
  return width > 0 && height > 0 && width <= 512 && height <= 512;
}

function fromBase64(data: string) {
  // Select the raster type before decoding, avoiding repeated multi-MB allocations.
  const mime = data.startsWith("iVBOR") ? "image/png" : data.startsWith("/9j/") ? "image/jpeg" : data.startsWith("UklGR") ? "image/webp" : null;
  if (mime) {
    const uri = `data:${mime};base64,${data}`;
    if (parseImage(uri)) return uri;
  }
  throw new Error("INVALID_IMAGE_OUTPUT");
}

export async function createCloudImage(env: Env, input: CloudImageInput) {
  const [width, height] = dimensions[input.format][input.quality === "standard" ? 1 : 0];
  const prompt = `${input.prompt}\nVisual style: ${input.style}.${input.colors ? ` Color palette: ${input.colors}.` : ""}`;
  let image: string;
  if (input.model === "flux") {
    const form = new FormData();
    form.append("prompt", prompt);
    form.append("width", String(width)); form.append("height", String(height));
    form.append("seed", String(input.seed));
    if (input.reference) form.append("input_image_0", new Blob([input.reference.bytes], { type: "image/png" }), "reference.png");
    const body = new Response(form);
    const output = await env.AI.run("@cf/black-forest-labs/flux-2-klein-4b", {
      multipart: { body: body.body!, contentType: body.headers.get("content-type")! },
    });
    if (!output.image) throw new Error("NO_IMAGE_OUTPUT");
    image = fromBase64(output.image);
  } else {
    const stream = await env.AI.run("@cf/stabilityai/stable-diffusion-xl-base-1.0", {
      prompt, width, height, seed: input.seed, num_steps: input.quality === "standard" ? 20 : 12,
      ...(input.reference ? { image_b64: input.reference.data, strength: input.strength } : {}),
    });
    const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    if (bytes.byteLength > 20 * 1024 * 1024) throw new Error("IMAGE_TOO_LARGE");
    let binary = "";
    for (let offset = 0; offset < bytes.length; offset += 8192) binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
    image = fromBase64(btoa(binary));
  }
  return { id: crypto.randomUUID(), image, prompt: input.prompt, style: input.style, model: imageModels[input.model].label,
    width, height, seed: input.seed };
}

export function cloudError(error: unknown): Response {
  const message = error instanceof Error ? error.message : "";
  const status = typeof error === "object" && error !== null && "status" in error ? Number(error.status) : 0;
  const quota = status === 429 || /quota|neurons|rate.?limit|429|3040/i.test(message);
  const access = status === 403 || /403|5035|unauthorized|not authorized/i.test(message);
  console.error("Workers AI request failed", { status, category: quota ? "quota" : access ? "access" : "generation" });
  return Response.json({ error: quota ? "Cloudflare alcanzó su cuota o capacidad disponible. Inténtalo más tarde; no se reintentó automáticamente."
    : access ? "Cloudflare no permite usar este modelo con la configuración actual de la cuenta. Revisa Workers AI o selecciona otro modelo."
    : "Cloudflare no pudo completar esta imagen. Revisa la descripción y la referencia e inténtalo de nuevo." }, { status: quota ? 429 : 503 });
}
