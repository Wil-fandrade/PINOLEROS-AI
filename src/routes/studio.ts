import { studioPage } from "../ui/studio";

export function studio(): Response {
  const page = studioPage().replace(
    "else auth.showModal()",
    "else if (new URLSearchParams(location.search).get('auth') === '1') auth.showModal()",
  );
  return new Response(page, { headers: { "content-type": "text/html; charset=UTF-8", "cache-control": "no-store" } });
}
