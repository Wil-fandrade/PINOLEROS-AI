/** Provides a lightweight liveness endpoint for deployment checks. */
export function health(): Response {
  return Response.json({ status: "ok" });
}
