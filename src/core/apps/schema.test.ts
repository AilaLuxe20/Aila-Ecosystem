import assert from "node:assert/strict";
import { test } from "node:test";

import { createAppListingSchema } from "./schema";

test("draft app does not require a url", () => {
  const parsed = createAppListingSchema.safeParse({
    name: "Aila Notes",
    slug: "aila-notes",
    description: "A notes app.",
    platform: "web",
  });
  assert.equal(parsed.success, true);
});

test("live app requires a url", () => {
  const parsed = createAppListingSchema.safeParse({
    name: "Aila Notes",
    slug: "aila-notes",
    description: "A notes app.",
    platform: "web",
    status: "live",
  });
  assert.equal(parsed.success, false);
});

test("slug must be lowercase", () => {
  const parsed = createAppListingSchema.safeParse({
    name: "Aila Notes",
    slug: "Aila Notes",
    description: "A notes app.",
    platform: "web",
  });
  assert.equal(parsed.success, false);
});
