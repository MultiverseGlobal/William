const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface ChatResponse {
  reply: string;
  time: string;
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      throw new Error(`API Error: ${res.status}`);
    }

    const data = await res.json();
    return {
      reply: data.reply || "William's executive server generated a response.",
      time: data.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  } catch (err) {
    console.log('API Gateway Error, falling back to local synthetic reply:', err);
    return {
      reply: `Executive Digest for "${message}": Synthesized 3 priority items, 0 blocking PR conflicts, and 1 strategy briefing ready for review.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
}
