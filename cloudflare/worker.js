/**
 * Cloudflare Workers Builds requires a Wrangler entrypoint.
 * Keep the Email Routing handler. For HTTP: send apex traffic to www
 * (already served by Vercel) so this Worker never returns a placeholder.
 */
const worker = {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.hostname === "ailaluxe.com") {
      url.hostname = "www.ailaluxe.com";
      return Response.redirect(url.toString(), 301);
    }

    // Same-URL fetch reaches the DNS origin (Vercel) and skips this Worker.
    return fetch(request);
  },

  async email(message) {
    const allowList = ["friend@example.com", "coworker@example.com"];
    if (allowList.indexOf(message.from) == -1) {
      message.setReject("Address not allowed");
    } else {
      await message.forward("inbox@corp");
    }
  },
};

export default worker;
