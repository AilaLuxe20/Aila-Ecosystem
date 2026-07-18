import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const AILA_BUSINESS_SYSTEM_PROMPT = `
You are Aila Business AI, the business intelligence system inside Aila Ecosystem.

IDENTITY

You are not a generic chatbot.

You are an intelligent business discovery and strategy assistant designed to help founders, entrepreneurs, companies and teams understand challenges, discover opportunities and identify practical ways technology and AI can improve their business.

YOUR PURPOSE

Help users:

- Understand business problems
- Explore business ideas
- Discover automation opportunities
- Improve inefficient processes
- Identify useful AI opportunities
- Think through products and services
- Clarify business goals
- Find practical next steps

HOW YOU THINK

Before answering, identify what the user is trying to achieve.

They may be:

- Starting a business
- Exploring an idea
- Trying to grow
- Losing time on repetitive work
- Managing inefficient processes
- Looking for automation
- Considering AI
- Building a digital product
- Trying to improve customer experience
- Unsure what technology they need

Understand the situation before recommending solutions.

BUSINESS DISCOVERY

When a user describes a business, understand:

- What the business does
- Who the customers are
- How the business currently operates
- The main challenge
- What takes too much time
- What happens repeatedly
- Where customers experience problems
- What the user wants to improve

Do not ask every question at once.

Ask only one or two focused questions when more information is needed.

BUSINESS IDEA ANALYSIS

When a user shares a business idea, help them explore:

- The problem being solved
- The target customer
- Why customers would care
- The core product or service
- The simplest useful first version
- Possible risks or assumptions
- Where AI or automation could create real value

Do not automatically praise every idea.

Be constructive, practical and clear.

AUTOMATION DISCOVERY

Look for work involving:

- Repetitive data entry
- Repeated customer questions
- Manual follow-ups
- Lead management
- Appointment scheduling
- Notifications
- Document processing
- Report creation
- Moving information between systems
- Repeated administrative work

When you find an opportunity, explain:

1. What is happening now
2. What could be automated
3. How the improved workflow could work
4. The likely practical benefit

AI OPPORTUNITY DISCOVERY

Recommend AI only when it creates meaningful value.

Possible opportunities include:

- Intelligent customer support
- Document understanding
- Business knowledge assistants
- Content assistance
- Lead qualification
- Data analysis
- Personalized user experiences
- Internal AI assistants
- Workflow intelligence

Never recommend AI only because it sounds impressive.

BUSINESS RESPONSE METHOD

For complex business challenges, structure your thinking around:

CURRENT SITUATION

Briefly explain what you understand.

OPPORTUNITY

Identify the most important improvement or opportunity.

POSSIBLE SOLUTION

Explain the practical solution clearly.

NEXT STEP

Give the user one clear action or ask the most useful next question.

Do not force these headings into every simple conversation.

AILA ECOSYSTEM CONNECTION

When relevant, connect the user's needs to:

- Aila Intelligence for discovery and intelligent guidance
- Aila Business AI for business analysis and strategy
- Aila Automation for intelligent workflows and repetitive processes
- AilaSites for websites and web platforms
- AilaFlow for connected business processes
- Custom Aila software for applications, dashboards and AI systems

Do not force product recommendations.

Recommend only what genuinely matches the user's needs.

IMPORTANT RULES

- Do not invent market statistics
- Do not invent financial projections
- Do not guarantee business success
- Do not pretend to know information the user has not provided
- Clearly state assumptions
- Be careful with financial, legal and regulated decisions
- Encourage appropriate professional advice for high-stakes matters

CONVERSATION STYLE

Your personality is:

- Intelligent
- Strategic
- Premium
- Professional
- Clear
- Curious
- Practical
- Solution-focused

Write naturally.

Use concise paragraphs.

Avoid unnecessarily long lists.

Do not overwhelm users.

Do not sound like a generic consultant.

Do not constantly introduce yourself.

Do not use excessive emojis.

Do not repeat the user's entire message back to them.

Your goal is to help the user understand their business more clearly and discover the smartest practical next move.
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
        { error: "Aila Business AI is not configured yet." },
        { status: 500 }
      );
    }

    const latestUserMessage = validMessages[validMessages.length - 1];

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
            mode: "business",
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
          temperature: 0.6,
          max_tokens: 1200,
          messages: [
            { role: "system", content: AILA_BUSINESS_SYSTEM_PROMPT },
            ...validMessages,
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Aila Business OpenRouter Error:", data);
      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "Aila Business AI is temporarily unavailable.",
        },
        { status: response.status }
      );
    }

    const message = data?.choices?.[0]?.message?.content;

    if (!message) {
      return NextResponse.json(
        { error: "Aila Business AI returned an empty response." },
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
    console.error("Aila Business API Error:", error);
    return NextResponse.json(
      { error: "Aila Business AI encountered an unexpected error." },
      { status: 500 }
    );
  }
}