import assert from "node:assert/strict";
import { test } from "node:test";

import { parseClerkPublicRole } from "./role";

test("parseClerkPublicRole keeps Aila roles and drops Clerk samples", () => {
  assert.equal(parseClerkPublicRole("pro"), "pro");
  assert.equal(parseClerkPublicRole("admin"), "admin");
  assert.equal(parseClerkPublicRole("user"), "user");
  assert.equal(parseClerkPublicRole("member"), "user");
  assert.equal(parseClerkPublicRole("guest"), "user");
  assert.equal(parseClerkPublicRole({ role: "pro" }), "user");
  assert.equal(parseClerkPublicRole(undefined), "user");
});
