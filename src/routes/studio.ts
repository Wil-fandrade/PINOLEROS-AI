import { studioPage } from "../ui/studio";

export function studio(): Response {
  return new Response(studioPage(), { headers: { "content-type": "text/html; charset=UTF-8", "cache-control": "no-store" } });
}
