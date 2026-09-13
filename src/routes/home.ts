import { dashboardPage } from "../ui/dashboard";

/** Serves the first PINOLEROS.AI product dashboard. */
export function home(): Response {
  return new Response(dashboardPage(), {
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "no-store",
    },
  });
}
