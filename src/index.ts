import { home } from "./routes/home";
import { health } from "./routes/health";
import { createDesign, dashboardData } from "./routes/api/dashboard";

/** Cloudflare Worker entry point. Keep request routing here and endpoint code in routes/. */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (request.method === "GET" && pathname.startsWith("/images/")) {
      return env.ASSETS.fetch(request);
    }

    if (request.method === "GET" && pathname === "/health") {
      return health();
    }

    if (request.method === "GET" && pathname === "/") {
      return home();
    }

    if (request.method === "GET" && pathname === "/api/dashboard") {
      return dashboardData(env);
    }

    if (request.method === "POST" && pathname === "/api/designs") {
      return createDesign(request, env);
    }

    return new Response("Not Found", { status: 404 });
  },
};
