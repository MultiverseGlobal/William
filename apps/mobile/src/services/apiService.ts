// Route to local Next.js API in development. 
// For physical devices, use your local IP instead of localhost (e.g. http://192.168.1.X:3000)
// If using Android emulator, use http://10.0.2.2:3000
import { Platform } from 'react-native';
import EventSource from 'react-native-sse';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return 'https://pseudonyms.vercel.app/api';
};

const WEB_API_URL = getBaseUrl();

export interface ChatResponse {
  reply: string;
  time: string;
}

export async function sendChatMessage(message: string): Promise<ChatResponse> {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  try {
    const res = await fetch(`${WEB_API_URL}/reasoner`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: message }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.reply) {
        return {
          reply: json.reply,
          time: timeStr,
        };
      }
    } else {
      console.log('Web API returned an error status:', res.status);
    }
  } catch (err) {
    console.log('Error hitting Web API /chat:', err);
  }

  return {
    reply: "I am having trouble connecting to the Web Brain API.",
    time: timeStr,
  };
}

export function streamOrionChat(
  messages: any[], 
  onChunk: (text: string) => void,
  onToolCall: (toolCall: any) => void,
  onComplete: () => void,
  onError: () => void
) {
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !anonKey) {
    console.error("Missing Supabase configuration");
    onError();
    return null;
  }

  const url = `${supabaseUrl}/functions/v1/orion-chat`;
  
  const es = new EventSource(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${anonKey}`,
      'apikey': anonKey
    },
    body: JSON.stringify({ messages })
  });

  es.addEventListener('message', (event) => {
    if (event.data) {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'text-delta' && data.textDelta) {
          onChunk(data.textDelta);
        } else if (data.type === 'tool-call') {
          onToolCall(data);
        }
      } catch (e) {
        // Vercel AI SDK text streams might not be JSON if using streamText directly without data protocol, 
        // but `toDataStreamResponse` sends `0:"text"` format.
        // For `toDataStreamResponse()`, it sends specific stream parts. Let's handle the Vercel AI SDK protocol format:
        const raw = event.data;
        if (raw.startsWith('0:')) {
          onChunk(JSON.parse(raw.substring(2)));
        } else if (raw.startsWith('9:')) {
          onToolCall(JSON.parse(raw.substring(2)));
        } else if (raw.startsWith('d:')) {
          onComplete();
          es.close();
        }
      }
    }
  });

  es.addEventListener('error', (event) => {
    console.error('SSE Error:', event);
    es.close();
    onError();
  });

  return es;
}
