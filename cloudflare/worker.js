/**
 * Cloudflare Workers Builds requires a Wrangler entrypoint.
 * This keeps the live ailaluxe Email Routing handler and answers HTTP
 * with a short notice so a preview version does not claim the Vercel site.
 */
export default {
  async fetch() {
    return new Response("Aila is served by Vercel.", {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  },

  async email(message, env, ctx) {
    const allowList = ["friend@example.com", "coworker@example.com"];
    if (allowList.indexOf(message.from) == -1) {
      message.setReject("Address not allowed");
    } else {
      await message.forward("inbox@corp");
    }
  },
};
