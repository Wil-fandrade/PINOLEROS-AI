import { home } from "./routes/home";
import { health } from "./routes/health";
import { createDesign, dashboardData } from "./routes/api/dashboard";
import { login, logout, me, register } from "./routes/api/auth";
import { createPrintOrder, generate, media, myCreations, selectCreation } from "./routes/api/creations";

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

    if (request.method === "GET" && (pathname === "/" || pathname === "/mi-espacio")) {
      return home();
    }

    if (request.method === "GET" && pathname === "/api/dashboard") {
      return dashboardData(env);
    }

    if (request.method === "POST" && pathname === "/api/designs") {
      return createDesign(request, env);
    }

    if (request.method === "POST" && pathname === "/api/auth/register") return register(request, env);
    if (request.method === "POST" && pathname === "/api/auth/login") return login(request, env);
    if (request.method === "POST" && pathname === "/api/auth/logout") return logout(request, env);
    if (request.method === "GET" && pathname === "/api/auth/me") return me(request, env);
    if (request.method === "POST" && pathname === "/api/generate") return generate(request, env);
    if (request.method === "POST" && pathname === "/api/creations") return selectCreation(request, env);
    if (request.method === "GET" && pathname === "/api/creations") return myCreations(request, env);
    if (request.method === "POST" && pathname === "/api/print-orders") return createPrintOrder(request, env);
    if (request.method === "GET" && pathname.startsWith("/api/media/")) return media(request, env, pathname.slice("/api/media/".length));

    return new Response("Not Found", { status: 404 });
  },
};
