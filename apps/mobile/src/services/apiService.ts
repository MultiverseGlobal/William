const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface ChatResponse {
  reply: string;
  time: string;
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://william.pseudonyms.ai',
        'X-Title': 'William AI Chief of Staff',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: `You are William, an executive AI Chief of Staff for Pseudonyms.
Answer concisely in 2-3 sentences max. Direct, observant, highly intelligent. No polite filler, no corporate buzzwords.`,
          },
          { role: 'user', content: message },
        ],
        max_tokens: 250,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      const replyText = json?.choices?.[0]?.message?.content;
      if (replyText) {
        return {
          reply: replyText,
          time: timeStr,
        };
      }
    }
  } catch (err) {
    console.log('Direct OpenRouter mobile fetch error:', err);
  }

  return {
    reply: "I am listening closely. OpenRouter connection active.",
    time: timeStr,
  };
}
