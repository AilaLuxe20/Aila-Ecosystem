import { NextResponse } from "next/server";
import {
  extractText,
  getDocumentProxy,
} from "unpdf";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const allowedFileTypes = [
  "application/pdf",
  "text/plain",
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json(
        {
          message: "No document uploaded.",
        },
        {
          status: 400,
        }
      );
    }

    if (uploadedFile.size === 0) {
      return NextResponse.json(
        {
          message: "The uploaded document is empty.",
        },
        {
          status: 400,
        }
      );
    }

    if (uploadedFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          message:
            "The document is too large. Please upload a file smaller than 10 MB.",
        },
        {
          status: 400,
        }
      );
    }

    const fileName =
      uploadedFile.name.toLowerCase();

    const isPdf = fileName.endsWith(".pdf");

    const isTextFile =
      fileName.endsWith(".txt");

    if (
      !isPdf &&
      !isTextFile &&
      !allowedFileTypes.includes(
        uploadedFile.type
      )
    ) {
      return NextResponse.json(
        {
          message:
            "This file type is not supported yet. Please upload a PDF or TXT document.",
        },
        {
          status: 400,
        }
      );
    }

    let extractedText = "";

    if (isPdf) {
      const buffer =
        await uploadedFile.arrayBuffer();

      const pdf = await getDocumentProxy(
        new Uint8Array(buffer)
      );

      const { text } = await extractText(
        pdf,
        {
          mergePages: true,
        }
      );

      extractedText = text;
    } else {
      extractedText =
        await uploadedFile.text();
    }

    const cleanText =
      extractedText.trim();

    if (!cleanText) {
      return NextResponse.json(
        {
          message:
            "AilaLegal could not find readable text in this document. The file may contain scanned images and require OCR.",
        },
        {
          status: 422,
        }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      console.error(
        "Missing OPENROUTER_API_KEY"
      );

      return NextResponse.json(
        {
          message:
            "AilaLegal Intelligence is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const documentText =
      cleanText.slice(0, 14000);

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

          messages: [
            {
              role: "system",

              content: `
You are AilaLegal AI, the legal document intelligence system inside the Aila Ecosystem.

Your role is to help users understand legal documents clearly and responsibly.

You provide general legal information and document analysis only. You do not provide legal advice and you do not replace a qualified lawyer.

Analyze the uploaded document carefully.

Return the analysis using EXACTLY this structure:

DOCUMENT OVERVIEW

Write a concise explanation of what the document appears to be, its purpose, and the main parties or roles involved.

KEY TERMS

List the most important commercial, legal, financial, operational, or procedural terms in the document.

IMPORTANT CLAUSES

Identify the most important clauses and explain what each one means in clear language.

POTENTIAL RISKS

Identify provisions that may create risk, unusual obligations, penalties, restrictions, unclear responsibilities, or one-sided terms.

OBLIGATIONS

Explain the main responsibilities and obligations placed on each relevant party.

DATES AND DEADLINES

List important dates, notice periods, renewal terms, payment deadlines, termination periods, or other time-sensitive requirements. If none are found, say so clearly.

REVIEW POINTS

List the specific areas a person should examine carefully or discuss with a qualified legal professional before relying on or signing the document.

PLAIN LANGUAGE SUMMARY

Finish with a short plain-language explanation of what the document means overall.

Rules:

- Be precise and professional.
- Use clear language.
- Do not invent information.
- If something is not stated in the document, say that it is not stated.
- Separate every section clearly.
- Use bullet points where useful.
- Do not use markdown tables.
- Do not claim that a document is legally valid or invalid.
- Do not tell the user what legal decision to make.
              `.trim(),
            },

            {
              role: "user",

              content: `
DOCUMENT NAME:
${uploadedFile.name}

DOCUMENT CONTENT:
${documentText}
              `.trim(),
            },
          ],

          max_tokens: 2200,
          temperature: 0.2,
        }),
      }
    );

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      console.error(
        "AilaLegal OpenRouter Error:",
        data
      );

      const providerMessage =
        typeof data?.error?.message ===
        "string"
          ? data.error.message
          : "";

      return NextResponse.json(
        {
          message:
            providerMessage ||
            "AilaLegal could not analyze the document right now.",
        },
        {
          status: aiResponse.status,
        }
      );
    }

    const analysis =
      data?.choices?.[0]?.message?.content;

    if (
      typeof analysis !== "string" ||
      !analysis.trim()
    ) {
      console.error(
        "AilaLegal Empty AI Response:",
        data
      );

      return NextResponse.json(
        {
          message:
            "AilaLegal completed the request but did not receive a valid analysis.",
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: analysis.trim(),
        document: {
          name: uploadedFile.name,
          size: uploadedFile.size,
          type:
            uploadedFile.type ||
            "unknown",
        },
      },
      {
        status: 200,
      }
    );
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
      {
        status: 500,
      }
    );
  }
}