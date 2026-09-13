import { home } from "./routes/home";
import { health } from "./routes/health";

/** Cloudflare Worker entry point. Keep request routing here and endpoint code in routes/. */
export default {
  fetch(request: Request): Response {
    const { pathname } = new URL(request.url);

    if (request.method === "GET" && pathname === "/health") {
      return health();
    }

    if (request.method === "GET" && pathname === "/") {
      return home();
    }

    return new Response("Not Found", { status: 404 });
  },
};
