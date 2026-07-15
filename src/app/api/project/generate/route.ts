import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { prompt } = await req.json();

  if (!prompt?.trim()) {
    return NextResponse.json(
      {
        error: "Prompt is required.",
      },
      {
        status: 400,
      }
    );
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
        model:
          process.env.OPENROUTER_MODEL ??
          "openai/gpt-4.1-mini",

        response_format: {
          type: "json_object",
        },

        messages: [
          {
            role: "system",

            content: `You are Aila Intelligence.

Generate a software project as JSON only.

Return this exact structure:

{
  "name": "...",
  "description": "...",
  "framework": "Next.js 16",
  "files": [
    {
      "path": "app/page.tsx",
      "content": "..."
    }
  ]
}

Do not return markdown.

Do not return explanations.

Return valid JSON only.`,
          },

          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.2,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          data?.error?.message ??
          "Generation failed.",
      },
      {
        status: response.status,
      }
    );
  }

  const content =
    data.choices?.[0]?.message?.content;

  try {
    return NextResponse.json(
      JSON.parse(content)
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "AI returned invalid JSON.",
        raw: content,
      },
      {
        status: 500,
      }
    );
  }
}
