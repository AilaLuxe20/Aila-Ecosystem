import assert from "node:assert/strict";
import { test } from "node:test";

import { clearDocument, getDocument, hasDocument, saveDocument } from "./documentContext";

test("legacy document context does not keep uploaded text in process memory", () => {
  saveDocument("secret.pdf", "confidential clause");
  assert.equal(hasDocument(), false);
  assert.deepEqual(getDocument(), { fileName: "", text: "" });
  clearDocument();
  assert.equal(hasDocument(), false);
});
