import { NextResponse } from "next/server";
import { getDocument, hasDocument } from "@/app/lib/documentContext";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        {
          error: "Message is required",
        },
        {
          status: 400,
        }
      );
    }

    const documentAvailable = hasDocument();

    let reply = "";

    if (!documentAvailable) {
      reply = `Hello! I'm AilaLegal AI.

I can help you understand contracts, explain legal concepts, identify risks, and answer general legal questions.

If you upload a legal document first, I can also answer questions based on that document.

How can I help you today?`;
    } else {
      const document = getDocument();

      const preview =
        document.text.length > 1500
          ? document.text.substring(0, 1500)
          : document.text;

      reply = `I found an uploaded document:

📄 ${document.fileName}

Here is a preview of the extracted content:

${preview}

You asked:

"${message}"

The document is now available for analysis. In the next step, this request will be sent to the AI model so I can answer your question using the contents of the uploaded document instead of giving generic responses.`;
    }

    return NextResponse.json({
      reply,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Chat failed",
      },
      {
        status: 500,
      }
    );
  }
}