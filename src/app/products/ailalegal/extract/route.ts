import { NextResponse } from "next/server";
import { extractText } from "unpdf";
import { saveDocument } from "@/app/lib/documentContext";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // 1. Authenticate the user
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No PDF file uploaded" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const { text, totalPages } = await extractText(new Uint8Array(buffer), {
      mergePages: true,
    });

    // 2. Correctly provide 3 arguments: userId (as sessionId), fileName, and text
    saveDocument(userId, file.name, text);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      pages: totalPages,
    });

  } catch (error) {
    console.error("PDF EXTRACTION ERROR:", error);
    return NextResponse.json(
      { error: "Failed to extract document text" },
      { status: 500 }
    );
  }
}