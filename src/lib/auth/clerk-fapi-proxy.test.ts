import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CLERK_FAPI_PROXY_PATH,
  shouldUseClerkFrontendApiProxy,
} from "./clerk-fapi-proxy";

test("Clerk FAPI proxy is production-only and uses /__clerk", () => {
  assert.equal(CLERK_FAPI_PROXY_PATH, "/__clerk");
  assert.equal(shouldUseClerkFrontendApiProxy("production"), true);
  assert.equal(shouldUseClerkFrontendApiProxy("preview"), false);
  assert.equal(shouldUseClerkFrontendApiProxy("development"), false);
  assert.equal(shouldUseClerkFrontendApiProxy(undefined), false);
});
