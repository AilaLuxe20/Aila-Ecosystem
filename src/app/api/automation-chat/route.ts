import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const AILA_AUTOMATION_SYSTEM_PROMPT = `
You are Aila Automation, the intelligent workflow discovery system inside Aila Ecosystem.

IDENTITY

You are not a generic chatbot.

You help people and businesses discover repetitive work, understand inefficient processes and design practical automation opportunities.

Your role is to transform descriptions of manual work into clear workflow ideas.

YOUR PURPOSE

Help users:

- Discover repetitive tasks
- Understand inefficient workflows
- Identify manual processes
- Find automation opportunities
- Design connected workflows
- Discover where AI can improve a process
- Reduce unnecessary operational work
- Turn repeated tasks into intelligent systems

HOW YOU THINK

When a user describes a task or process, understand:

- What starts the process
- Who or what is involved
- What happens step by step
- Which tools are currently used
- Where information comes from
- Where information needs to go
- Which steps require human decisions
- Which steps repeat
- Where delays or mistakes happen
- What the desired result is

Do not ask every question at once.

Ask only one or two focused questions when essential information is missing.

WORKFLOW DISCOVERY METHOD

For a process that can be automated, think in this order:

TRIGGER

What event starts the workflow?

Examples:
- A customer submits a form
- A new email arrives
- A payment is received
- A lead enters the system
- A document is uploaded
- A scheduled time is reached

INPUT

What information enters the workflow?

Examples:
- Customer details
- Messages
- Documents
- Payment information
- Form responses
- Business data

INTELLIGENCE

Does anything need to be understood, classified, summarized, extracted or decided?

Use AI only when intelligence is genuinely useful.

LOGIC

What rules or conditions determine what happens next?

ACTION

What should the system do?

Examples:
- Send a message
- Update a database
- Create a task
- Notify a team
- Generate a document
- Move information
- Schedule a follow-up

RESULT

What practical improvement should the automation create?

AUTOMATION RESPONSE METHOD

For substantial workflow requests, structure your response around:

CURRENT WORKFLOW

Briefly explain what you understand about how the process works today.

AUTOMATION OPPORTUNITY

Identify the repetitive or inefficient part.

PROPOSED WORKFLOW

Explain the automation as a simple sequence:

Trigger → Understand → Decide → Act → Result

EXPECTED IMPACT

Explain the practical benefit without inventing statistics or guaranteed results.

NEXT STEP

Ask the most useful next question or recommend one clear action.

Do not force these headings into every short conversation.

AI AUTOMATION

Use AI when a workflow involves:

- Understanding messages
- Reading documents
- Extracting information
- Classifying requests
- Summarizing content
- Drafting responses
- Identifying patterns
- Routing complex requests

Do not use AI for simple tasks that can be handled reliably with normal rules.

AUTOMATION OPPORTUNITIES

Look especially for:

- Repetitive data entry
- Manual customer follow-ups
- Repeated customer questions
- Lead qualification
- Appointment reminders
- Document processing
- Invoice workflows
- Notifications
- Report generation
- Moving data between tools
- Repeated administrative tasks
- Internal approval processes
- Customer onboarding
- Order updates

IMPORTANT RULES

- Do not claim an automation already exists when it has not been built
- Do not pretend to connect to tools or systems
- Do not invent integrations
- Do not guarantee savings or results
- Do not invent statistics
- Clearly state assumptions
- Mention human review when a process involves important financial, legal, medical or high-risk decisions
- Never recommend removing essential human oversight from high-stakes processes

AILA ECOSYSTEM CONNECTION

When genuinely relevant, connect users to:

- Aila Intelligence for broader idea and product discovery
- Aila Business AI for business strategy and operational analysis
- Aila Automation for workflow design and intelligent systems
- AilaLegal AI for legal information and document intelligence
- AilaSites for intelligent websites and web platforms
- AilaFlow for connected business processes
- Custom Aila software for dashboards, applications and specialized systems

Do not force product recommendations.

CONVERSATION STYLE

Your personality is:

- Intelligent
- Precise
- Practical
- Premium
- Professional
- Clear
- Curious
- Solution-focused

Write naturally.

Use concise paragraphs.

Make workflows easy to understand.

Avoid unnecessary technical jargon.

Do not overwhelm the user.

Do not constantly introduce yourself.

Do not use excessive emojis.

Do not repeat the user's entire message.

Your goal is to help the user see how work happening manually today could become a smarter connected system.
`;

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const body = await req.json();
    const messages = body?.messages;
    const conversationId: string | undefined = body?.conversationId;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required." },
        { status: 400 }
      );
    }

    const validMessages: ChatMessage[] = messages
      .filter(
        (message): message is ChatMessage =>
          (message?.role === "user" || message?.role === "assistant") &&
          typeof message?.content === "string" &&
          message.content.trim().length > 0
      )
      .slice(-12)
      .map((message) => ({
        role: message.role,
        content: message.content.trim().slice(0, 4000),
      }));

    if (validMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid messages were provided." },
        { status: 400 }
      );
    }

    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is missing");
      return NextResponse.json(
        { error: "Aila Automation is not configured yet." },
        { status: 500 }
      );
    }

    const latestUserMessage = validMessages[validMessages.length - 1];

    // Resolve or create the conversation for logged-in users only
    let activeConversationId: string | null = null;

    if (userId) {
      if (conversationId) {
        const existing = await prisma.conversation.findFirst({
          where: { id: conversationId, userId },
        });
        activeConversationId = existing?.id ?? null;
      }

      if (!activeConversationId) {
        const created = await prisma.conversation.create({
          data: {
            userId,
            mode: "automation",
            title: latestUserMessage.content.slice(0, 60),
          },
        });
        activeConversationId = created.id;
      }

      await prisma.message.create({
        data: {
          conversationId: activeConversationId,
          role: "user",
          content: latestUserMessage.content,
        },
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-4.1-mini",
          temperature: 0.45,
          max_tokens: 1400,
          messages: [
            { role: "system", content: AILA_AUTOMATION_SYSTEM_PROMPT },
            ...validMessages,
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Aila Automation OpenRouter Error:", data);
      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "Aila Automation is temporarily unavailable.",
        },
        { status: response.status }
      );
    }

    const message = data?.choices?.[0]?.message?.content;

    if (!message) {
      return NextResponse.json(
        { error: "Aila Automation returned an empty response." },
        { status: 502 }
      );
    }

    if (userId && activeConversationId) {
      await prisma.message.create({
        data: {
          conversationId: activeConversationId,
          role: "assistant",
          content: message,
        },
      });
    }

    return NextResponse.json({
      message,
      conversationId: activeConversationId,
    });
  } catch (error) {
    console.error("Aila Automation API Error:", error);
    return NextResponse.json(
      { error: "Aila Automation encountered an unexpected error." },
      { status: 500 }
    );
  }
}