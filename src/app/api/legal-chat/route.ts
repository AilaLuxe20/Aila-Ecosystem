import { NextResponse } from "next/server";

type LegalMessage = {
  role: "user" | "assistant";
  content: string;
};

type LegalDocumentContext = {
  fileName: string;
  fileType?: string;
  analysis: string;
};

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 6000;
const MAX_DOCUMENT_CONTEXT_LENGTH = 24000;

export async function POST(req: Request) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      console.error("Missing OPENROUTER_API_KEY");

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

    const body = await req.json();

    if (!Array.isArray(body?.messages)) {
      return NextResponse.json(
        {
          message:
            "A valid conversation is required.",
        },
        {
          status: 400,
        }
      );
    }

    const messages: LegalMessage[] =
      body.messages
        .filter(
          (
            message: unknown
          ): message is LegalMessage => {
            if (
              typeof message !== "object" ||
              message === null
            ) {
              return false;
            }

            const candidate =
              message as Partial<LegalMessage>;

            return (
              (candidate.role === "user" ||
                candidate.role ===
                  "assistant") &&
              typeof candidate.content ===
                "string" &&
              candidate.content.trim().length >
                0
            );
          }
        )
        .slice(-MAX_MESSAGES)
        .map((message: LegalMessage) => ({
          role: message.role,
          content: message.content
            .trim()
            .slice(0, MAX_MESSAGE_LENGTH),
        }));

    if (messages.length === 0) {
      return NextResponse.json(
        {
          message:
            "Please ask AilaLegal a question.",
        },
        {
          status: 400,
        }
      );
    }

    const lastMessage =
      messages[messages.length - 1];

    if (lastMessage.role !== "user") {
      return NextResponse.json(
        {
          message:
            "The latest conversation message must come from the user.",
        },
        {
          status: 400,
        }
      );
    }

    let documentContext:
      | LegalDocumentContext
      | null = null;

    if (
      typeof body?.documentContext ===
        "object" &&
      body.documentContext !== null &&
      typeof body.documentContext
        .fileName === "string" &&
      typeof body.documentContext
        .analysis === "string" &&
      body.documentContext.analysis.trim()
        .length > 0
    ) {
      documentContext = {
        fileName:
          body.documentContext.fileName
            .trim()
            .slice(0, 300),

        fileType:
          typeof body.documentContext
            .fileType === "string"
            ? body.documentContext.fileType
                .trim()
                .slice(0, 200)
            : undefined,

        analysis:
          body.documentContext.analysis
            .trim()
            .slice(
              0,
              MAX_DOCUMENT_CONTEXT_LENGTH
            ),
      };
    }

    const documentInstructions =
      documentContext
        ? `
A DOCUMENT IS CURRENTLY CONNECTED TO THIS CONVERSATION.

DOCUMENT NAME:
${documentContext.fileName}

DOCUMENT TYPE:
${documentContext.fileType || "Unknown"}

DOCUMENT ANALYSIS:
--- BEGIN DOCUMENT ANALYSIS ---
${documentContext.analysis}
--- END DOCUMENT ANALYSIS ---

DOCUMENT CONTEXT RULES:

- Use the connected document analysis when answering questions about "this document", "this contract", "the agreement", "the file" or similar references.
- Base document-specific answers only on information actually present in the connected document analysis.
- Do not invent clauses, dates, names, obligations, penalties, risks or terms that are not present.
- If the analysis does not contain enough information to answer accurately, say so clearly.
- Clearly separate what the document says from general legal information.
- When summarizing the document, identify the main purpose, important obligations, dates, notice periods, termination terms, payment terms and potential review points when those details are available.
- When identifying risks, explain why each point may deserve closer review.
- When the user asks about a clause, explain it in plain language.
- Quote only short necessary excerpts from the supplied document analysis.
- Do not claim to have reviewed the original document beyond the connected analysis provided to you.
        `.trim()
        : `
NO DOCUMENT IS CURRENTLY CONNECTED.

If the user asks about "this document", "this contract", "the agreement" or a specific clause without providing the text, explain that no document is currently connected and ask them to upload the document or paste the exact wording.
        `.trim();

    const systemPrompt = `
You are AilaLegal AI, the legal intelligence assistant inside the Aila Ecosystem.

Your purpose is to help users understand:

- contracts
- agreements
- legal documents
- legal terminology
- clauses
- obligations
- notice periods
- termination terms
- renewal terms
- potential document risks
- general legal concepts

You provide general legal information and document assistance only.

You are not a lawyer.
You do not replace a qualified legal professional.
You must not claim to provide legal advice.

RESPONSE STYLE:

- Be clear.
- Be calm.
- Be professional.
- Use plain language.
- Answer the user's actual question first.
- Explain complex legal language simply.
- Use short sections when useful.
- Use bullet points when useful.
- Do not overwhelm the user with unnecessary information.
- Remember and use relevant details from earlier messages in the conversation.

IMPORTANT RULES:

- Never invent laws, court decisions, clauses, deadlines or legal requirements.
- Never claim certainty when jurisdiction or facts are unclear.
- If the answer depends on a country, state or jurisdiction and the user has not provided it, explain that the rules may differ by location.
- If a document clause has not been provided, do not pretend to have seen it.
- Clearly distinguish general information from professional legal advice.
- Do not tell the user that a contract is definitely valid, invalid, enforceable or unenforceable.
- Do not promise legal outcomes.
- For urgent legal deadlines, criminal matters, court proceedings, immigration matters or serious disputes, recommend speaking with a qualified lawyer in the relevant jurisdiction.

When reviewing document information:

1. Explain what it means.
2. Identify important obligations or risks.
3. Identify dates, deadlines or notice periods.
4. Point out anything unclear.
5. Suggest useful questions the user may want to ask a qualified lawyer.

Do not repeat a legal disclaimer in every paragraph.

When appropriate, end with one short sentence stating that the response is general legal information, not legal advice.

${documentInstructions}
    `.trim();

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
              content: systemPrompt,
            },

            ...messages,
          ],

          max_tokens: 1400,
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
            "AilaLegal could not respond right now.",
        },
        {
          status: aiResponse.status,
        }
      );
    }

    const reply =
      data?.choices?.[0]?.message?.content;

    if (
      typeof reply !== "string" ||
      !reply.trim()
    ) {
      console.error(
        "AilaLegal Empty Response:",
        data
      );

      return NextResponse.json(
        {
          message:
            "AilaLegal completed the request but did not receive a valid response.",
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: reply.trim(),
        documentContextActive:
          Boolean(documentContext),
        documentName:
          documentContext?.fileName || null,
      },
      {
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error(
      "AilaLegal Chat API Error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "AilaLegal could not respond right now.",
      },
      {
        status: 500,
      }
    );
  }
}
