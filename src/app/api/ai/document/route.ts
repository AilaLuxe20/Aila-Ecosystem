import { NextResponse } from "next/server";
import { processDocument, extractPdf } from "@/core/ai/documentEngine";
import { analyzeDocument } from "@/core/ai/engine";

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

    // Check if this is a PDF extraction request (for backward compat with /products/ailalegal/extract)
    const extractOnly = formData.get("extractOnly") === "true";

    if (extractOnly) {
      const result = await extractPdf(uploadedFile);
      return NextResponse.json({
        success: true,
        fileName: uploadedFile.name,
        pages: result.totalPages,
        text: result.text,
      });
    }

    // Full document processing: extract + analyze
    const document = await processDocument(uploadedFile);

    const analysis = await analyzeDocument(
      document.text,
      document.fileName,
      "legal"
    );

    if (!analysis.success) {
      return NextResponse.json(
        { message: analysis.error || "Document analysis failed." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: analysis.reply,
      document: {
        name: document.fileName,
        size: document.size,
        type: document.type,
      },
    });
  } catch (error) {
    console.error("Aila Document API Error:", error);
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
