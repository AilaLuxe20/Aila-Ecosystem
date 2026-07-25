import { AilaMessage } from './types';

export async function streamAilaResponse(
  messages: AilaMessage[],
  productId: string
) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-pro-exp-02-05',
      messages: [
        { role: 'system', content: `You are Aila. Product Context: ${productId}` },
        ...messages,
      ],
      stream: true,
    }),
  });

  if (!response.ok) throw new Error('Aila Core communication failed.');
  return response.body;
}
