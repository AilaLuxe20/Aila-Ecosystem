import assert from "node:assert/strict";
import { test } from "node:test";

import { createSiteSchema } from "./schema";

test("site schema requires at least one page", () => {
  const parsed = createSiteSchema.safeParse({
    name: "Studio",
    slug: "studio",
    pages: [],
  });
  assert.equal(parsed.success, false);
});

test("site schema accepts a home page", () => {
  const parsed = createSiteSchema.safeParse({
    name: "Studio",
    slug: "studio",
    pages: [{ title: "Home", path: "/", content: "# Hello" }],
  });
  assert.equal(parsed.success, true);
});
