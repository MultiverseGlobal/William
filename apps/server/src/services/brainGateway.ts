import { Portrait } from '@william/types';

export interface BrainRequest {
  systemPrompt: string;
  userPrompt: string;
  providerPriority?: ('google' | 'anthropic' | 'openai')[];
  temperature?: number;
  maxTokens?: number;
}

export interface BrainResponse {
  text: string;
  providerUsed: string;
  latencyMs: number;
}

export class BrainGateway {
  static async execute(req: BrainRequest): Promise<BrainResponse> {
    const start = Date.now();
    const priority = req.providerPriority || ['google', 'anthropic', 'openai'];

    for (const provider of priority) {
      if (provider === 'google' && process.env.GEMINI_API_KEY) {
        try {
          const text = await this.callGemini(req);
          return { text, providerUsed: 'google', latencyMs: Date.now() - start };
        } catch (e) {
          console.warn('BrainGateway: Google provider failed, falling back...', e);
        }
      }
      
      if (provider === 'anthropic' && process.env.CLAUDE_API_KEY) {
        try {
          const text = await this.callClaude(req);
          return { text, providerUsed: 'anthropic', latencyMs: Date.now() - start };
        } catch (e) {
          console.warn('BrainGateway: Anthropic provider failed, falling back...', e);
        }
      }

      if (provider === 'openai' && process.env.OPENAI_API_KEY) {
        try {
          const text = await this.callOpenAI(req);
          return { text, providerUsed: 'openai', latencyMs: Date.now() - start };
        } catch (e) {
          console.warn('BrainGateway: OpenAI provider failed, falling back...', e);
        }
      }
    }

    // Absolute fallback if no keys configured or all calls fail
    return {
      text: "I am listening closely, sitting with your thoughts.",
      providerUsed: 'fallback',
      latencyMs: Date.now() - start
    };
  }

  private static async callGemini(req: BrainRequest): Promise<string> {
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    const prompt = `${req.systemPrompt}\n\nUser input:\n${req.userPrompt}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: req.maxTokens || 600,
          temperature: req.temperature ?? 0.7
        }
      })
    });

    if (!res.ok) throw new Error(`Gemini API returned status ${res.status}`);
    const json: any = await res.json();
    return json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private static async callClaude(req: BrainRequest): Promise<string> {
    const key = process.env.CLAUDE_API_KEY;
    const url = 'https://api.anthropic.com/v1/messages';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: req.maxTokens || 600,
        temperature: req.temperature ?? 0.7,
        system: req.systemPrompt,
        messages: [{ role: 'user', content: req.userPrompt }]
      })
    });

    if (!res.ok) throw new Error(`Claude API returned status ${res.status}`);
    const json: any = await res.json();
    return json.content?.[0]?.text || '';
  }

  private static async callOpenAI(req: BrainRequest): Promise<string> {
    const key = process.env.OPENAI_API_KEY;
    const url = 'https://api.openai.com/v1/chat/completions';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: req.maxTokens || 600,
        temperature: req.temperature ?? 0.7,
        messages: [
          { role: 'system', content: req.systemPrompt },
          { role: 'user', content: req.userPrompt }
        ]
      })
    });

    if (!res.ok) throw new Error(`OpenAI API returned status ${res.status}`);
    const json: any = await res.json();
    return json.choices?.[0]?.message?.content || '';
  }
}
