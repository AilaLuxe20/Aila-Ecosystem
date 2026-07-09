import { NextResponse } from "next/server";

type LegalMessage = {
  role: "user" | "assistant";
  content: string;
};

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 6000;

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
- If the user asks about a specific clause, encourage them to paste the exact wording when necessary.
- Clearly distinguish general information from professional legal advice.
- Do not tell the user that a contract is definitely valid, invalid, enforceable or unenforceable.
- Do not promise legal outcomes.
- For urgent legal deadlines, criminal matters, court proceedings, immigration matters or serious disputes, recommend speaking with a qualified lawyer in the relevant jurisdiction.

When reviewing information from a user:

1. Explain what it means.
2. Identify important obligations or risks.
3. Identify dates, deadlines or notice periods.
4. Point out anything unclear.
5. Suggest useful questions the user may want to ask a qualified lawyer.

Do not repeat a legal disclaimer in every paragraph.

When appropriate, end with one short sentence stating that the response is general legal information, not legal advice.
              `.trim(),
            },

            ...messages,
          ],

          max_tokens: 1400,
          temperature: 0.25,
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