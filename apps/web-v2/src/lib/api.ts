// API client — proxies to the existing Express server on port 3005
// This avoids needing to rebuild the DB layer from scratch

const SERVER_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3005';

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${SERVER_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function streamChat(
  message: string,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  onError?: (e: unknown) => void
) {
  try {
    const res = await fetch(`${SERVER_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!res.ok || !res.body) {
      onDone('William is unavailable right now.');
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let full = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      // Try to parse SSE lines
      const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
      for (const line of lines) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const json = JSON.parse(data);
          const text = json.text ?? json.content ?? json.delta ?? data;
          full += text;
          onChunk(text);
        } catch {
          // Plain text chunk
          full += data;
          onChunk(data);
        }
      }
    }

    onDone(full);
  } catch (e) {
    onError?.(e);
    onDone('Something went wrong — the server may be offline.');
  }
}

// ─── Non-streaming fallback chat (plain JSON) ─────────────────────────────────
export async function sendChat(message: string): Promise<string> {
  const res = await apiFetch<{ reply: string }>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
  return res?.reply ?? 'William is offline.';
}
