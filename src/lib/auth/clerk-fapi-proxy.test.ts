import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CLERK_FAPI_PROXY_PATH,
  shouldUseClerkFrontendApiProxy,
} from "./clerk-fapi-proxy";

test("Clerk FAPI proxy is on for hosted deploys and uses /__clerk", () => {
  assert.equal(CLERK_FAPI_PROXY_PATH, "/__clerk");
  assert.equal(shouldUseClerkFrontendApiProxy("production", "production"), true);
  assert.equal(shouldUseClerkFrontendApiProxy("preview", "production"), true);
  assert.equal(shouldUseClerkFrontendApiProxy(undefined, "production"), true);
  assert.equal(shouldUseClerkFrontendApiProxy("development", "development"), false);
  assert.equal(shouldUseClerkFrontendApiProxy(undefined, "development"), false);
  assert.equal(shouldUseClerkFrontendApiProxy("test", "test"), false);
});
