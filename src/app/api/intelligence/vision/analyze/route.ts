import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENROUTER_API_KEY" },
        { status: 500 }
      );
    }

    const form = await req.formData();

    const image = form.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "No image uploaded." },
        { status: 400 }
      );
    }

    const bytes = await image.arrayBuffer();

    const base64 = Buffer.from(bytes).toString("base64");

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

          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Analyze this image in detail.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url:
                      `data:${image.type};base64,${base64}`,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        data,
        {
          status: response.status,
        }
      );
    }

    return NextResponse.json({
      success: true,
      analysis:
        data.choices?.[0]?.message?.content ??
        "No response.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Vision failed.",
      },
      {
        status: 500,
      }
    );
  }
}
