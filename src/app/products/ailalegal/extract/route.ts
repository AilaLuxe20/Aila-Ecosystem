import { NextResponse } from "next/server";
import { extractText } from "unpdf";
import { saveDocument } from "@/app/lib/documentContext";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "No PDF file uploaded",
        },
        {
          status: 400,
        }
      );
    }

    const buffer = await file.arrayBuffer();

    const { text, totalPages } = await extractText(
      new Uint8Array(buffer),
      {
        mergePages: true,
      }
    );

    // Save the uploaded document into AilaLegal's shared context
    saveDocument(file.name, text);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      pages: totalPages,
      text,
    });

  } catch (error) {
    console.error("PDF EXTRACTION ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to extract document text",
      },
      {
        status: 500,
      }
    );
  }
}