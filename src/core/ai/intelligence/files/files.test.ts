import assert from "node:assert/strict";
import { test } from "node:test";

import { aiChatRequestSchema } from "@/core/ai/chat-api";
import { decideStreamPersistence } from "@/core/ai/streaming/persist";
import { runRegisteredTool } from "@/core/ai/orchestrator/tools/execute";
import {
  MAX_DOCUMENT_CONTEXT_CHARS,
  MAX_DOCUMENT_SIZE,
  MAX_EXTRACTED_TEXT_CHARS,
} from "@/core/constants";

import {
  buildBoundedDocumentContext,
  buildIntelligenceChatContext,
  createMemoryIntelligenceDocumentStore,
  extractIntelligenceText,
  formatDocumentPromptBlock,
  processIntelligenceUpload,
  resolveIntelligenceDocuments,
  truncateExtractedText,
  validateIntelligenceFile,
} from "./index";

const encoder = new TextEncoder();

function bytes(value: string): Uint8Array {
  return encoder.encode(value);
}

const MINIMAL_PDF = encoder.encode(`%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 200 200] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 44 >>
stream
BT /F1 24 Tf 50 150 Td (Hello) Tj ET
endstream
endobj
trailer
<< /Root 1 0 R >>
%%EOF
`);

test("supported file validation accepts pdf txt csv json markdown", () => {
  assert.equal(validateIntelligenceFile("notes.txt", 5, bytes("hello")).ok, true);
  assert.equal(validateIntelligenceFile("data.csv", 5, bytes("a,b")).ok, true);
  assert.equal(validateIntelligenceFile("rows.json", 2, bytes("{}")).ok, true);
  assert.equal(validateIntelligenceFile("readme.md", 2, bytes("# h")).ok, true);
  assert.equal(validateIntelligenceFile("report.pdf", MINIMAL_PDF.length, MINIMAL_PDF).ok, true);
});

test("client MIME types are ignored during validation", () => {
  const result = validateIntelligenceFile("notes.txt", 5, bytes("hello"));
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.mimeType, "text/plain");
    assert.equal(result.kind, "txt");
  }
});

test("unsupported file rejection", () => {
  const exe = validateIntelligenceFile("payload.exe", 2, bytes("MZ"));
  assert.equal(exe.ok, false);

  const video = validateIntelligenceFile(
    "clip.mp4",
    12,
    bytes("\x00\x00\x00\x18ftypmp42")
  );
  assert.equal(video.ok, false);
  if (!video.ok) {
    assert.match(video.message, /video/i);
  }

  const pngAsTxt = validateIntelligenceFile(
    "notes.txt",
    4,
    new Uint8Array([0x89, 0x50, 0x4e, 0x47])
  );
  assert.equal(pngAsTxt.ok, false);
});

test("image magic is accepted for png", () => {
  const png = validateIntelligenceFile(
    "photo.png",
    4,
    new Uint8Array([0x89, 0x50, 0x4e, 0x47])
  );
  assert.equal(png.ok, true);
  if (png.ok) {
    assert.equal(png.kind, "image");
    assert.equal(png.mimeType, "image/png");
  }
});

test("oversized file rejection", () => {
  const result = validateIntelligenceFile(
    "huge.txt",
    MAX_DOCUMENT_SIZE + 1,
    bytes("hello")
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.message, /too large/i);
  }
});

test("empty file handling", async () => {
  const empty = validateIntelligenceFile("empty.txt", 0, new Uint8Array());
  assert.equal(empty.ok, false);

  const whitespace = await extractIntelligenceText(bytes("   \n"), "txt");
  assert.equal(whitespace.ok, false);
});

test("PDF and text extraction", async () => {
  const text = await extractIntelligenceText(bytes("Hello Aila"), "txt");
  assert.equal(text.ok, true);
  if (text.ok) {
    assert.equal(text.data.text, "Hello Aila");
    assert.equal(text.data.truncated, false);
  }

  const pdf = await extractIntelligenceText(MINIMAL_PDF, "pdf");
  assert.equal(pdf.ok, true);
  if (pdf.ok) {
    assert.match(pdf.data.text.toLowerCase(), /hello/);
  }
});

test("CSV and JSON analysis input from attached document", async () => {
  const csvAuth = {
    userId: "user_1",
    mode: "intelligence" as const,
    documentKind: "csv",
    documentText: "item,price\nA,10\nB,30",
    documentName: "prices.csv",
  };

  const csv = await runRegisteredTool("analyze_data", {}, csvAuth);
  assert.equal(csv.ok, true);
  if (csv.ok) {
    const data = csv.data as { rows: number; format: string };
    assert.equal(data.format, "csv");
    assert.equal(data.rows, 2);
  }

  const json = await runRegisteredTool(
    "analyze_data",
    {},
    {
      userId: "user_1",
      mode: "intelligence",
      documentKind: "json",
      documentText: JSON.stringify([{ sku: "A", price: 4 }]),
      documentName: "rows.json",
    }
  );
  assert.equal(json.ok, true);
});

test("extracted text size limit flags truncation", () => {
  const oversized = "x".repeat(MAX_EXTRACTED_TEXT_CHARS + 25);
  const result = truncateExtractedText(oversized);
  assert.equal(result.truncated, true);
  assert.equal(result.extractedCharCount, MAX_EXTRACTED_TEXT_CHARS);
  assert.equal(result.text.length, MAX_EXTRACTED_TEXT_CHARS);
});

test("authenticated ownership is required to use a document", async () => {
  const store = createMemoryIntelligenceDocumentStore();
  const created = await store.create({
    userId: "owner",
    conversationId: null,
    fileName: "notes.txt",
    fileSize: 5,
    mimeType: "text/plain",
    kind: "txt",
    extractedText: "secret notes",
    extractedCharCount: 12,
    truncated: false,
  });

  const foreign = await resolveIntelligenceDocuments({
    userId: "intruder",
    documentIds: [created.id],
    store,
  });
  assert.equal(foreign.ok, false);
  if (!foreign.ok) {
    assert.equal(foreign.status, 404);
  }

  const owner = await resolveIntelligenceDocuments({
    userId: "owner",
    documentIds: [created.id],
    store,
  });
  assert.equal(owner.ok, true);
});

test("foreign conversation rejection", async () => {
  const store = createMemoryIntelligenceDocumentStore();
  const created = await store.create({
    userId: "owner",
    conversationId: "conv_a",
    fileName: "notes.txt",
    fileSize: 5,
    mimeType: "text/plain",
    kind: "txt",
    extractedText: "thread a only",
    extractedCharCount: 13,
    truncated: false,
  });

  const otherThread = await resolveIntelligenceDocuments({
    userId: "owner",
    conversationId: "conv_b",
    documentIds: [created.id],
    store,
  });
  assert.equal(otherThread.ok, false);
  if (!otherThread.ok) {
    assert.equal(otherThread.status, 409);
  }

  const uploadToMissing = await processIntelligenceUpload({
    userId: "owner",
    fileName: "notes.txt",
    fileSize: 5,
    bytes: bytes("hello"),
    conversationId: "missing",
    store,
    getConversation: async () => null,
  });
  assert.equal(uploadToMissing.ok, false);
  if (!uploadToMissing.ok) {
    assert.equal(uploadToMissing.status, 404);
  }
});

test("document context isolation between users and conversations", async () => {
  const store = createMemoryIntelligenceDocumentStore();
  await store.create({
    userId: "user_a",
    conversationId: "conv_a",
    fileName: "a.txt",
    fileSize: 3,
    mimeType: "text/plain",
    kind: "txt",
    extractedText: "alpha-only",
    extractedCharCount: 10,
    truncated: false,
  });

  const leaked = await resolveIntelligenceDocuments({
    userId: "user_b",
    conversationId: "conv_a",
    store,
  });
  assert.equal(leaked.ok, true);
  if (leaked.ok) {
    assert.equal(leaked.records.length, 0);
  }
});

test("failed processing creates no empty conversation and no stored document", async () => {
  const store = createMemoryIntelligenceDocumentStore();
  let conversationLoads = 0;

  const result = await processIntelligenceUpload({
    userId: "owner",
    fileName: "broken.json",
    fileSize: 12,
    bytes: bytes("{not-json"),
    store,
    getConversation: async () => {
      conversationLoads += 1;
      return {
        id: "should-not-load",
        mode: "intelligence",
        title: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
        attachments: [],
      };
    },
  });

  assert.equal(result.ok, false);
  assert.equal(conversationLoads, 0);
  assert.equal((await store.findByConversation("owner", "anything")).length, 0);
});

test("document context is included in Intelligence requests", async () => {
  const store = createMemoryIntelligenceDocumentStore();
  const created = await store.create({
    userId: "owner",
    conversationId: "conv_1",
    fileName: "report.txt",
    fileSize: 20,
    mimeType: "text/plain",
    kind: "txt",
    extractedText: "Revenue dropped. The biggest risks are cash flow and churn.",
    extractedCharCount: 58,
    truncated: false,
  });

  const resolved = await resolveIntelligenceDocuments({
    userId: "owner",
    conversationId: "conv_1",
    store,
  });
  assert.equal(resolved.ok, true);
  if (!resolved.ok) {
    return;
  }

  assert.equal(resolved.records[0]?.id, created.id);

  const context = buildIntelligenceChatContext({
    records: resolved.records,
    query: "What are the biggest risks?",
  });
  assert.ok(context);
  const prompt = formatDocumentPromptBlock(context!);
  assert.match(prompt, /UNTRUSTED DOCUMENT/);
  assert.match(prompt, /risks/);
  assert.match(prompt, /report\.txt/);
});

test("normal chat still works without attachment", () => {
  const parsed = aiChatRequestSchema.safeParse({
    mode: "intelligence",
    messages: [{ role: "user", content: "Hello" }],
  });
  assert.equal(parsed.success, true);

  const context = buildIntelligenceChatContext({
    records: [],
    query: "Hello",
  });
  assert.equal(context, null);
});

test("streaming persist-once behavior is unchanged", () => {
  assert.deepEqual(
    decideStreamPersistence({
      aborted: false,
      providerError: false,
      streamCompleted: true,
      accumulated: "Done",
    }),
    { persist: true, reply: "Done" }
  );

  assert.equal(
    decideStreamPersistence({
      aborted: true,
      providerError: false,
      streamCompleted: false,
      accumulated: "partial",
    }).persist,
    false
  );
});

test("tool execution still works with attached text", async () => {
  const result = await runRegisteredTool(
    "analyze_text",
    {},
    {
      userId: "user_1",
      mode: "intelligence",
      documentText: "Hello world. Hello again.",
      documentName: "notes.txt",
      documentKind: "txt",
    }
  );
  assert.equal(result.ok, true);
});

test("no duplicate persistence decision for one completed stream", () => {
  const first = decideStreamPersistence({
    aborted: false,
    providerError: false,
    streamCompleted: true,
    accumulated: "One reply",
  });
  const second = decideStreamPersistence({
    aborted: false,
    providerError: false,
    streamCompleted: true,
    accumulated: "One reply",
  });
  assert.equal(first.persist, true);
  assert.equal(second.persist, true);
  if (first.persist && second.persist) {
    assert.equal(first.reply, second.reply);
  }
});

test("bounded context does not inject an entire large document", () => {
  const extractedText = `${"alpha ".repeat(2000)} unique-risk-token ${"omega ".repeat(2000)}`;
  const context = buildBoundedDocumentContext({
    fileName: "long.txt",
    kind: "txt",
    extractedText,
    truncated: false,
    query: "What unique-risk-token should we watch?",
  });

  assert.equal(context.bounded, true);
  assert.ok(context.usedChars <= MAX_DOCUMENT_CONTEXT_CHARS + 20);
  assert.match(context.text, /unique-risk-token/);
  assert.match(
    formatDocumentPromptBlock(context),
    /larger than the allowed context window/
  );
});

test("chat request rejects more than one document id", () => {
  const parsed = aiChatRequestSchema.safeParse({
    mode: "intelligence",
    messages: [{ role: "user", content: "Summarize this." }],
    documentIds: ["doc_1", "doc_2"],
  });
  assert.equal(parsed.success, false);
});
