export default {
  async fetch(request: Request): Promise<Response> {
    return new Response(
      `PINOLEROS AI
Thinking & Printing
Cloudflare Worker is running.`,
      {
        headers: {
          "content-type": "text/plain; charset=UTF-8",
        },
      }
    );
  },
};