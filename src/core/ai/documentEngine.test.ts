import assert from "node:assert/strict";
import { test } from "node:test";

import { ValidationError } from "@/lib/errors/app-error";

import { processDocument, validateLegalDocumentFile } from "./documentEngine";

const encoder = new TextEncoder();

test("legal upload accepts a plain text file", () => {
  const bytes = encoder.encode("Termination requires 30 days written notice.");
  const result = validateLegalDocumentFile("contract.txt", bytes.length, bytes);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.kind, "txt");
    assert.equal(result.fileName, "contract.txt");
  }
});

test("legal upload rejects a PDF extension without PDF magic bytes", () => {
  const bytes = encoder.encode("not a pdf");
  const result = validateLegalDocumentFile("contract.pdf", bytes.length, bytes);
  assert.equal(result.ok, false);
});

test("legal upload rejects an executable disguised as text", () => {
  const bytes = new Uint8Array([0x4d, 0x5a]);
  const result = validateLegalDocumentFile("notes.txt", bytes.length, bytes);
  assert.equal(result.ok, false);
});

test("processDocument throws a validation error for unsupported types", async () => {
  const file = new File([encoder.encode("hello")], "payload.exe", {
    type: "application/octet-stream",
  });

  await assert.rejects(() => processDocument(file), (error: unknown) => {
    assert.ok(error instanceof ValidationError);
    return true;
  });
});
