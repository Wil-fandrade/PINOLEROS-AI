const headers = { "content-type": "text/plain; charset=UTF-8" };

/** Handles the public landing endpoint. */
export function home(): Response {
  return new Response("PINOLEROS AI\nThinking & Printing\nCloudflare Worker is running.", {
    headers,
  });
}
