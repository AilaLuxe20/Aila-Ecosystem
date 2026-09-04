/**
 * Cloudflare Workers Builds requires a Wrangler entrypoint.
 * Do not 301 www → apex here. That fights Vercel/Cloudflare host rules and
 * cached browser 301s (ERR_TOO_MANY_REDIRECTS). Pass through to origin.
 */
const worker = {
  async fetch(request) {
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
