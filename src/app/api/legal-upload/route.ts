import { NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DOCUMENT_LENGTH = 30000;

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const formData = await req.formData();
    const uploadedFile = formData.get("file");

    if (!(uploadedFile instanceof File)) {
      return NextResponse.json({ message: "No document uploaded." }, { status: 400 });
    }

    if (uploadedFile.size === 0) {
      return NextResponse.json({ message: "The uploaded document is empty." }, { status: 400 });
    }

    if (uploadedFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "The document is too large. Please upload a file smaller than 10 MB." },
        { status: 400 }
      );
    }

    const fileName = uploadedFile.name.toLowerCase();
    const fileExtension = fileName.split('.').pop() || "unknown";
    const isPdf = fileExtension === "pdf";
    const isText = fileExtension === "txt";

    if (!isPdf && !isText) {
      return NextResponse.json(
        { message: "This file type is not supported. Please upload a PDF or TXT document." },
        { status: 400 }
      );
    }

    let extractedText = "";

    if (isPdf) {
      const buffer = await uploadedFile.arrayBuffer();
      const pdf = await getDocumentProxy(new Uint8Array(buffer));
      const { text } = await extractText(pdf, { mergePages: true });
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
        { message: "AilaLegal could not extract readable text." },
        { status: 422 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ message: "AilaLegal Intelligence is not configured." }, { status: 500 });
    }

    const documentText = cleanText.slice(0, MAX_DOCUMENT_LENGTH);

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        temperature: 0.15,
        messages: [
          {
            role: "system",
            content: "You are AilaLegal AI. Analyze legal documents objectively. Sections: OVERVIEW, KEY TERMS, CLAUSES, RISKS, OBLIGATIONS, DATES, TERMINATION, FINANCIALS, QUESTIONS, SUMMARY. Do not use markdown tables.",
          },
          {
            role: "user",
            content: `Name: ${uploadedFile.name}\nContent:\n${documentText}`,
          },
        ],
      }),
    });

    const data = await aiResponse.json();
    const analysis = data?.choices?.[0]?.message?.content;

    if (!analysis) {
      return NextResponse.json({ message: "Analysis failed." }, { status: 502 });
    }

    let legalDocumentId: string | null = null;

    if (userId) {
      const saved = await prisma.legalDocument.create({
        data: {
          userId,
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
          mimeType: uploadedFile.type || "application/octet-stream",
          fileType: fileExtension,
          content: documentText,
          summary: analysis.slice(0, 500),
        },
      });
      legalDocumentId = saved.id;
    }

    return NextResponse.json({
      success: true,
      analysis,
      legalDocumentId,
    });
  } catch (error) {
    console.error("AilaLegal Error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}