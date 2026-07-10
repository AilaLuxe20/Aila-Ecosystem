import { NextResponse } from "next/server";
import {
  extractText,
  getDocumentProxy,
} from "unpdf";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DOCUMENT_LENGTH = 30000;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        { message: "No document uploaded." },
        { status: 400 }
      );
    }

    if (uploadedFile.size === 0) {
      return NextResponse.json(
        { message: "The uploaded document is empty." },
        { status: 400 }
      );
    }

    if (uploadedFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          message:
            "The document is too large. Please upload a file smaller than 10 MB.",
        },
        { status: 400 }
      );
    }

    const fileName = uploadedFile.name.toLowerCase();
    const isPdf = fileName.endsWith(".pdf");
    const isText = fileName.endsWith(".txt");

    if (!isPdf && !isText) {
      return NextResponse.json(
        {
          message:
            "This file type is not supported yet. Please upload a PDF or TXT document.",
        },
        { status: 400 }
      );
    }

    let extractedText = "";
    let pageCount: number | null = null;

    if (isPdf) {
      const buffer = await uploadedFile.arrayBuffer();

      const pdf = await getDocumentProxy(
        new Uint8Array(buffer)
      );

      pageCount = pdf.numPages;

      const { text } = await extractText(pdf, {
        mergePages: true,
      });

      extractedText = text;
    } else {
      extractedText = await uploadedFile.text();
    }

    const cleanText = extractedText
      .replace(/\u0000/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    if (!cleanText) {
      return NextResponse.json(
        {
          message:
            "AilaLegal could not find readable text in this document. The file may contain scanned images and require OCR.",
        },
        { status: 422 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        {
          message:
            "AilaLegal Intelligence is not configured.",
        },
        { status: 500 }
      );
    }

    const documentText = cleanText.slice(
      0,
      MAX_DOCUMENT_LENGTH
    );

    const wasTruncated =
      cleanText.length > MAX_DOCUMENT_LENGTH;

    const aiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4.1-mini",
          temperature: 0.15,
          max_tokens: 2600,
          messages: [
            {
              role: "system",
              content: `
You are AilaLegal AI, the legal document intelligence system inside Aila Ecosystem.

You analyze legal documents and explain them clearly.

You provide general legal information and document assistance only. You are not a lawyer and do not provide legal advice.

Analyze only the document content provided.

Return the response using EXACTLY these sections:

DOCUMENT OVERVIEW

Explain:
- what the document appears to be
- its main purpose
- the parties or roles involved
- the overall relationship created by the document

KEY TERMS

Identify the most important:
- financial terms
- payment terms
- commercial terms
- operational terms
- legal terms
- restrictions

IMPORTANT CLAUSES

For each important clause:
- identify the clause or topic
- explain what it means in plain language
- explain why it matters

POTENTIAL RISKS

Identify:
- penalties
- broad obligations
- one-sided provisions
- automatic renewals
- restrictions
- unclear responsibilities
- unusual terms
- financial exposure
- termination risks

Do not exaggerate risk.

OBLIGATIONS

Clearly separate the responsibilities of each party.

DATES AND DEADLINES

Identify:
- start dates
- end dates
- payment deadlines
- notice periods
- renewal periods
- termination deadlines
- response deadlines

If none are stated, say so.

TERMINATION AND RENEWAL

Explain:
- how the agreement can end
- notice requirements
- penalties
- automatic renewal
- post-termination obligations

If the document does not address these matters, say so.

FINANCIAL EXPOSURE

Identify:
- fees
- penalties
- deposits
- damages
- reimbursement duties
- continuing payment obligations

If none are stated, say so.

QUESTIONS TO REVIEW

Give specific questions the user may want to clarify or discuss with a qualified legal professional.

PLAIN LANGUAGE SUMMARY

Finish with a concise explanation of what the document means overall.

STRICT RULES:

- Never invent facts.
- Never invent laws.
- Never invent clauses.
- Never invent deadlines.
- Never claim the document is valid or invalid.
- Never promise a legal outcome.
- Clearly say when information is missing.
- Distinguish explicit document terms from possible concerns.
- Use clear professional language.
- Use bullets where useful.
- Do not use markdown tables.
              `.trim(),
            },
            {
              role: "user",
              content: `
DOCUMENT METADATA

Name: ${uploadedFile.name}
Type: ${uploadedFile.type || "unknown"}
Size: ${uploadedFile.size} bytes
Pages: ${pageCount ?? "Not applicable"}
Content truncated for analysis: ${wasTruncated ? "Yes" : "No"}

DOCUMENT CONTENT

${documentText}
              `.trim(),
            },
          ],
        }),
      }
    );

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      console.error(
        "AilaLegal OpenRouter Error:",
        data
      );

      return NextResponse.json(
        {
          message:
            data?.error?.message ||
            "AilaLegal could not analyze the document right now.",
        },
        { status: aiResponse.status }
      );
    }

    const analysis =
      data?.choices?.[0]?.message?.content;

    if (
      typeof analysis !== "string" ||
      !analysis.trim()
    ) {
      return NextResponse.json(
        {
          message:
            "AilaLegal did not receive a valid analysis.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: analysis.trim(),
      message: analysis.trim(),
      document: {
        name: uploadedFile.name,
        size: uploadedFile.size,
        type: uploadedFile.type || "unknown",
        pages: pageCount,
        charactersAnalyzed: documentText.length,
        truncated: wasTruncated,
      },
    });
  } catch (error: unknown) {
    console.error(
      "AilaLegal Document Analysis Error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Document analysis failed.",
      },
      { status: 500 }
    );
  }
}