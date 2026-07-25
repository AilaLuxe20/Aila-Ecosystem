import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-pro-exp-02-05',
        messages: [
          { role: 'system', content: 'You are Aila, the autonomous OS. Provide precise, executive-level intelligence.' },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.body) throw new Error('Neural stream failed');

    return new Response(response.body, {
      headers: { 'Content-Type': 'text/event-stream' },
    });
  } catch {
    return NextResponse.json({ error: 'Aila Connection Failed' }, { status: 500 });
  }
}
