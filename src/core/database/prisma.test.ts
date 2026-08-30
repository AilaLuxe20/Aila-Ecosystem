import assert from "node:assert/strict";
import { test } from "node:test";

import { resolvePostgresConnectionString } from "./prisma";

test("remote require SSL is pinned to verify-full", () => {
  const url = "postgresql://user:pass@db.example.com:5432/aila?sslmode=require";
  assert.equal(
    resolvePostgresConnectionString(url),
    "postgresql://user:pass@db.example.com:5432/aila?sslmode=verify-full",
  );
});

test("local development URLs are left unchanged", () => {
  const url = "postgresql://postgres:postgres@localhost:5432/aila?sslmode=disable";
  assert.equal(resolvePostgresConnectionString(url), url);
});

test("accelerate URLs are left unchanged", () => {
  const url = "prisma+postgres://accelerate.example/aila?sslmode=require";
  assert.equal(resolvePostgresConnectionString(url), url);
});
