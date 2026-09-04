import assert from "node:assert/strict";
import { test } from "node:test";

import { assertPublicHttpUrl } from "./landing-page";
import { ValidationError } from "@/lib/errors/app-error";

test("https URLs are accepted", () => {
  const url = assertPublicHttpUrl("https://example.com/offer");
  assert.equal(url.hostname, "example.com");
});

test("localhost is blocked", () => {
  assert.throws(() => assertPublicHttpUrl("http://localhost/admin"), ValidationError);
});

test("private IPv4 is blocked", () => {
  assert.throws(() => assertPublicHttpUrl("http://127.0.0.1/"), ValidationError);
  assert.throws(() => assertPublicHttpUrl("http://192.168.1.9/"), ValidationError);
  assert.throws(() => assertPublicHttpUrl("http://10.0.0.4/"), ValidationError);
});

test("metadata host is blocked", () => {
  assert.throws(
    () => assertPublicHttpUrl("http://169.254.169.254/latest/meta-data"),
    ValidationError,
  );
});
