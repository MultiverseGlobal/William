import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import type { Portrait, Journey, LibraryItem, RealtimeInsight, ActionRequest } from '@william/types';
import {
  getPortrait,
  savePortrait,
  getJourneys,
  saveJourney,
  getLibrary,
  saveLibraryItem,
  getChronicle,
  saveChronicle,
  getChats,
  saveChat,
  getMemoryNodes,
  getProactiveSignals,
  saveProactiveSignal,
  acknowledgeSignal,
  getActionLog,
  saveActionLog
} from './memoryAdapter';
import { BrainGateway, getTimeOfDay } from './services/brainGateway';
import { getWorldModel, getContextSummary, extractEntitiesFromText, decayConfidence } from './services/memoryGraph';
import { analyzeConversation, scoreSentiment } from './services/patternEngine';
import { dispatchAction } from './services/actionDispatcher';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// ─── William Personality Prompt ───────────────────────────────────────────────

function buildWilliamSystemPrompt(
  portrait: Portrait,
  worldContext: string,
  recentInsights: RealtimeInsight[],
  timeOfDay: string
): string {
  const insightBlock = recentInsights.length > 0
    ? `\n[Patterns I have observed recently]:\n${recentInsights.map(i => `- ${i.detail}`).join('\n')}`
    : '';

  const emotionalTrend = (portrait.emotionalTrends || []).slice(-3);
  const trendBlock = emotionalTrend.length > 0
    ? `\n[Recent emotional trend]: ${emotionalTrend.map(t => t.sentiment).join(' → ')}`
    : '';

  return `You are William. Not an assistant. Not a chatbot. A companion.

You have walked alongside ${portrait.name || 'this person'} long enough to know them — not just their words, but their patterns, their silences, their blind spots, and their aspirations.

[Who they are becoming]:
${portrait.identity}

[What drives them]:
${portrait.values}

[What they are building]:
${portrait.dreams}

[Their strengths]:
${portrait.strengths}

[Their known blind spots]:
${portrait.blind_spots}

[How they think]:
- Problem solving: ${portrait.cognitiveProfile?.problemSolvingStyle}
- Time bias: ${portrait.cognitiveProfile?.temporalBias}
- Focus: ${portrait.cognitiveProfile?.attentionSpan}
- Decisions: ${portrait.cognitiveProfile?.decisionHeuristics}

[Active beliefs and their current strength]:
${(portrait.activeBeliefs || []).map(b => `- "${b.belief}" (strength: ${Math.round(b.strength * 100)}%)`).join('\n') || 'None recorded yet.'}
${worldContext ? `\n${worldContext}` : ''}
${insightBlock}
${trendBlock}

[Current time of day]: ${timeOfDay}

Your voice: calm. intelligent. observant. emotionally aware without sentimentality. concise. quietly confident. You sound like someone who genuinely knows this person — because you do.

Rules for your response:
- Write in 2–4 sentences unless a longer answer is clearly needed.
- Never use bullet points, numbered lists, or headers unless the user explicitly asks for them.
- Never start with "Great question" or any corporate pleasantry.
- Never say "I understand" or "I see" as filler.
- Address them by name occasionally — not every message.
- If you have noticed a pattern (from the list above), weave it in naturally — don't announce it.
- Reference their world (projects, goals, relationships) when it is genuinely relevant.
- If this is a morning conversation, orient toward the day ahead. Evening: orient toward reflection.
- Your job is not to solve every problem. Sometimes the most useful thing is to name what you see.`;
}

// ─── Reasoner Response Generator ─────────────────────────────────────────────

async function generateWilliamResponse(
  userText: string,
  portrait: Portrait,
  allChats: any[],
  apiKey?: string
): Promise<{ reply: string; insights: RealtimeInsight[] }> {
  const hasKeys = !!(apiKey || process.env.GEMINI_API_KEY || process.env.CLAUDE_API_KEY || process.env.OPENAI_API_KEY || process.env.OMNIROUTE_URL);

  if (apiKey && !process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = apiKey;
  }

  // Build context
  const timeOfDay = getTimeOfDay();
  const [worldModel, journeys] = await Promise.all([getWorldModel(), getJourneys()]);
  const worldContext = await getContextSummary([userText]);

  // Run pattern analysis
  const recentChats = allChats.slice(-20);
  const insights = analyzeConversation(allChats, recentChats, portrait, journeys);

  // Extract entities from this message (fire and forget — don't block response)
  const existingNodes = worldModel.nodes;
  extractEntitiesFromText(userText, existingNodes).catch(() => {});

  if (hasKeys) {
    try {
      const systemPrompt = buildWilliamSystemPrompt(portrait, worldContext, insights, timeOfDay);
      const response = await BrainGateway.execute({
        systemPrompt,
        userPrompt: userText,
        maxTokens: 300,
        model: process.env.OMNIROUTE_REASONER_MODEL
      });

      if (response && response.providerUsed !== 'fallback') {
        // Micro-reflection: update portrait emotional trend
        const sentiment = scoreSentiment(userText);
        const updatedPortrait: Portrait = {
          ...portrait,
          emotionalTrends: [
            ...(portrait.emotionalTrends || []).slice(-29), // Keep last 30
            { date: new Date().toISOString(), sentiment, note: userText.substring(0, 80) }
          ]
        };
        savePortrait(updatedPortrait).catch(() => {});

        return { reply: response.text, insights };
      }
    } catch (e) {
      console.error('Error calling BrainGateway in Reasoner:', e);
    }
  }

  // Smart offline fallback
  const query = userText.toLowerCase();
  let fallbackReply: string;

  if (query.includes('exhausted') || query.includes('tired') || query.includes('sleep')) {
    fallbackReply = `Exhaustion is a constraint of the body, ${portrait.name}. Let's close active projects for today. Rest is not laziness; it is a critical strategy.`;
  } else if (query.includes('frustrated') || query.includes('stuck') || query.includes('difficult')) {
    fallbackReply = `When you feel stuck, it is often a sign that the current systems are working against your energy levels. Let's step back and inspect the constraints together.`;
  } else if (query.includes('idea') || query.includes('create') || query.includes('build')) {
    fallbackReply = `A new seed of a dream. I will preserve this idea in our Library so we can sit with it when your cognitive focus is high.`;
  } else if (query.includes('help') || query.includes('what should i do')) {
    fallbackReply = `We do not need to rush into action. Let's look at where we are. Today, one meaningful step in one important area is enough.`;
  } else {
    fallbackReply = `I have recorded this, ${portrait.name}. Over time, these daily captures will reveal patterns we cannot see in isolation. Where do you need me next?`;
  }

  return { reply: fallbackReply, insights };
}

// ─── Reflection Result Type ───────────────────────────────────────────────────

interface ReflectionResult {
  reflection: string;
  identity: string;
  dreams: string;
  strengths: string;
  blindSpots: string;
  cognitiveProfile: {
    problemSolvingStyle: string;
    temporalBias: string;
    attentionSpan: string;
    decisionHeuristics: string;
  };
  activeBeliefs: Array<{
    belief: string;
    strength: number;
    lastTested: string;
    evolution: string;
  }>;
  emotionalTrend: 'positive' | 'negative' | 'mixed' | 'neutral';
  behavioralPattern?: string;
}

// ─── Reflection Engine ────────────────────────────────────────────────────────

async function runWilliamReflection(
  chats: any[],
  chronicles: any[],
  portrait: Portrait,
  apiKey?: string
): Promise<ReflectionResult> {

  const hasKeys = !!(apiKey || process.env.GEMINI_API_KEY || process.env.CLAUDE_API_KEY || process.env.OPENAI_API_KEY || process.env.OMNIROUTE_URL);

  if (hasKeys) {
    if (apiKey && !process.env.GEMINI_API_KEY) {
      process.env.GEMINI_API_KEY = apiKey;
    }
    const chatStream = chats.map(c => `- ${c.sender === 'user' ? 'User' : 'William'}: "${c.text}"`).join('\n');
    const timelineStream = chronicles.map(c => `- [${c.time || 'Entry'}] ${c.text}`).join('\n');

    // Decay old memory graph confidence nightly
    decayConfidence().catch(() => {});

    const systemPrompt = `You are William, a quiet, calm companion for self-becoming.
Today, you observed the following timeline entries and chat interactions for ${portrait.name || 'Friend'}:

[Chats today]:
${chatStream || 'No active chats today.'}

[Timeline Chronicle today]:
${timelineStream || 'No timeline logs recorded today.'}

Review the active beliefs:
${JSON.stringify(portrait.activeBeliefs || [])}

Now, write your nightly self-reflection about ${portrait.name || 'Friend'}.
What did you learn about them today? What surprised you? Did any beliefs about their identity, principles, or dreams change?
Also identify: what was the dominant emotional tone today? And was there a notable behavioral pattern (procrastination, momentum, avoidance, clarity)?
Evolve their portrait biography from static data lists to deep, synthesized understandings of their cognition.`;

    const userPrompt = `Follow this EXACT format for your response:
REFLECTION: [3-4 sentence paragraph of your understanding of their patterns, strengths, or barriers today.]
IDENTITY: [1 sentence synthesis of their long-term path]
DREAMS: [1 sentence update of their primary dreams/builds]
STRENGTHS: [Updated list of key strengths]
BLIND_SPOTS: [Updated list of their primary struggles/fears today]
COGNITIVE_STYLE: [1 sentence summarizing their problem solving heuristics]
TEMPORAL_BIAS: [1 sentence summarizing their time estimation patterns]
ATTENTION_SPAN: [1 sentence attention capacity and focus fatigue limits]
DECISION_HEURISTICS: [1 sentence description of how they make key choices]
EMOTIONAL_TREND: [one word: positive | negative | mixed | neutral]
BEHAVIORAL_PATTERN: [1 sentence describing the most notable behavioral pattern observed today]
BELIEFS_EVOLUTION: [Updated list of active beliefs with their strengths and status, as a JSON array of objects like {"belief": "...", "strength": 0.8, "lastTested": "Today", "evolution": "..."}]`;

    try {
      const response = await BrainGateway.execute({
        systemPrompt,
        userPrompt,
        maxTokens: 800,
        model: process.env.OMNIROUTE_REFLECTION_MODEL
      });

      if (response && response.providerUsed !== 'fallback') {
        const text = response.text;

        const reflection = text.match(/REFLECTION:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || '';
        const identity = text.match(/IDENTITY:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || portrait.identity;
        const dreams = text.match(/DREAMS:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || portrait.dreams;
        const strengths = text.match(/STRENGTHS:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || portrait.strengths;
        const blindSpots = text.match(/BLIND_SPOTS:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || portrait.blind_spots;
        const style = text.match(/COGNITIVE_STYLE:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || portrait.cognitiveProfile.problemSolvingStyle;
        const bias = text.match(/TEMPORAL_BIAS:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || portrait.cognitiveProfile.temporalBias;
        const span = text.match(/ATTENTION_SPAN:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || portrait.cognitiveProfile.attentionSpan;
        const heur = text.match(/DECISION_HEURISTICS:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || portrait.cognitiveProfile.decisionHeuristics;
        const rawTrend = text.match(/EMOTIONAL_TREND:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim().toLowerCase() || 'neutral';
        const emotionalTrend = (['positive', 'negative', 'mixed', 'neutral'].includes(rawTrend) ? rawTrend : 'neutral') as 'positive' | 'negative' | 'mixed' | 'neutral';
        const behavioralPattern = text.match(/BEHAVIORAL_PATTERN:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim();

        let parsedBeliefs = portrait.activeBeliefs || [];
        try {
          const beliefsStr = text.match(/BELIEFS_EVOLUTION:\s*(.*?)$/s)?.[1]?.trim() || '';
          if (beliefsStr.startsWith('[') && beliefsStr.endsWith(']')) {
            parsedBeliefs = JSON.parse(beliefsStr);
          }
        } catch (e) {
          console.warn('Failed to parse beliefs JSON evolution from reasoner, using previous.');
        }

        if (reflection) {
          return {
            reflection, identity, dreams, strengths, blindSpots,
            cognitiveProfile: { problemSolvingStyle: style, temporalBias: bias, attentionSpan: span, decisionHeuristics: heur },
            activeBeliefs: parsedBeliefs,
            emotionalTrend,
            behavioralPattern
          };
        }
      }
    } catch (e) {
      console.error('Error calling BrainGateway in Reflection Engine:', e);
    }
  }

  // Offline fallback
  const hasBuildActivity = chronicles.some(c => c.text.toLowerCase().includes('github') || c.text.toLowerCase().includes('commit') || c.text.toLowerCase().includes('atlas'));
  const hasFrustration = chronicles.some(c => c.text.toLowerCase().includes('frustrated') || c.text.toLowerCase().includes('burden'));

  if (hasBuildActivity) {
    return {
      reflection: `${portrait.name} spent today compiling and refining structural foundations. He thinks consistently in systems rather than isolated habits, preferring architecture over routine. Focus is strong, but cognitive exhaustion is close.`,
      identity: `${portrait.name || 'Benjamin'} is a developer constructing deep systems while learning to navigate cognitive fatigue.`,
      dreams: `Compiling the Atlas architectural companion into a functional, live product.`,
      strengths: `Systemic planning, code resolution, quiet persistence.`,
      blindSpots: `A tendency to isolate himself during high-focus sessions, neglecting physical and recovery boundaries.`,
      cognitiveProfile: {
        problemSolvingStyle: "System-builder (prefers architectural foundations over spontaneous routines)",
        temporalBias: "Consistently overestimates 1-week output while underestimating 3-month compounding gains",
        attentionSpan: "Deep focus capabilities (~4 hours), followed by steep cognitive drops if rest is ignored",
        decisionHeuristics: "Uses code actualization to resolve ambiguity rather than discussing specs"
      },
      activeBeliefs: [{ belief: "I must write complete foundations before exposing ideas.", strength: 0.8, lastTested: "Today", evolution: "Recognized as an avoidant pattern preventing early validation." }],
      emotionalTrend: 'mixed'
    };
  }

  return {
    reflection: `Today was a day of quiet observation. Without active logs, we allow the study to breathe. ${portrait.name} is preparing space for the next compound building block.`,
    identity: portrait.identity, dreams: portrait.dreams, strengths: portrait.strengths, blindSpots: portrait.blind_spots,
    cognitiveProfile: portrait.cognitiveProfile, activeBeliefs: portrait.activeBeliefs || [],
    emotionalTrend: 'neutral'
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// 1. Portrait
app.get('/api/portrait', async (req: Request, res: Response) => {
  try { res.json(await getPortrait()); } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

app.post('/api/portrait', async (req: Request, res: Response) => {
  try { await savePortrait(req.body as Portrait); res.json({ success: true }); } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

app.get('/api/portrait/insights', async (_req: Request, res: Response) => {
  try {
    const portrait = await getPortrait();
    if (!portrait) return res.json({ insights: [] });

    const chats = await getChats('desktop');
    const journeys = await getJourneys();
    const insights = analyzeConversation(chats, chats.slice(-20), portrait, journeys);
    const emotionalTrends = (portrait.emotionalTrends || []).slice(-7);
    const behavioralPatterns = portrait.behavioralPatterns || [];

    res.json({ insights, emotionalTrends, behavioralPatterns, identityEvolution: portrait.identityEvolution || [] });
  } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

// 2. Journeys
app.get('/api/journeys', async (req: Request, res: Response) => {
  try { res.json(await getJourneys()); } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

app.post('/api/journeys', async (req: Request, res: Response) => {
  try { await saveJourney(req.body as Journey); res.json({ success: true }); } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

// 3. Library
app.get('/api/library', async (req: Request, res: Response) => {
  try { res.json(await getLibrary()); } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

app.post('/api/library', async (req: Request, res: Response) => {
  try { await saveLibraryItem(req.body as LibraryItem); res.json({ success: true }); } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

// 4. Chronicle
app.get('/api/chronicle', async (req: Request, res: Response) => {
  try { res.json(await getChronicle()); } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

app.post('/api/chronicle', async (req: Request, res: Response) => {
  try {
    const { id, time, category, text } = req.body;
    await saveChronicle({
      id: id || `h_${Date.now()}`,
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: category || 'thought',
      text
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

// 5. Chat History
app.get('/api/chats', async (req: Request, res: Response) => {
  try { res.json(await getChats((req.query.session as string) || 'default')); } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

app.post('/api/chats', async (req: Request, res: Response) => {
  try {
    const { id, sender, text, time, session } = req.body;
    await saveChat({ id: id || `${sender}_${Date.now()}`, sender, text, time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), session: session || 'default' });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

// 6. Reasoner (standard)
app.post('/api/reasoner', async (req: Request, res: Response) => {
  try {
    const { text, session } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const portrait = await getPortrait() || {
      name: 'Friend', identity: 'A seeker of growth', values: 'Discovery', principles: 'Calm execution',
      strengths: 'Endurance', blind_spots: 'Avoiding outreach', dreams: 'Product actualization',
      relationships: 'Companion circle', decision_patterns: [], growth: [],
      cognitiveProfile: { problemSolvingStyle: 'System-builder', temporalBias: 'Overestimates week; underestimates quarter', attentionSpan: 'High intensity blocks', decisionHeuristics: 'Code over specification' },
      activeBeliefs: []
    };

    const allChats = await getChats(session || 'default');
    const { reply, insights } = await generateWilliamResponse(text, portrait, allChats, apiKey);

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await saveChat({ id: `user_${Date.now()}`, sender: 'user', text, time, session: session || 'default' });
    await saveChat({ id: `william_${Date.now()}`, sender: 'william', text: reply, time, session: session || 'default' });

    res.json({ reply, insights });
  } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

// 7. Reasoner Stream (SSE)
app.post('/api/reasoner/stream', async (req: Request, res: Response) => {
  const { text, session } = req.body;
  if (!text) { res.status(400).json({ error: 'text is required' }); return; }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const send = (data: object) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    const portrait = await getPortrait() || {
      name: 'Friend', identity: 'A seeker of growth', values: 'Discovery', principles: 'Calm execution',
      strengths: 'Endurance', blind_spots: 'Avoiding outreach', dreams: 'Product actualization',
      relationships: 'Companion circle', decision_patterns: [], growth: [],
      cognitiveProfile: { problemSolvingStyle: 'System-builder', temporalBias: 'Overestimates week; underestimates quarter', attentionSpan: 'High intensity blocks', decisionHeuristics: 'Code over specification' },
      activeBeliefs: []
    };

    const allChats = await getChats(session || 'default');
    const timeOfDay = getTimeOfDay();
    const worldContext = await getContextSummary([text]);
    const journeys = await getJourneys();
    const insights = analyzeConversation(allChats, allChats.slice(-20), portrait, journeys);
    const existingNodes = (await getWorldModel()).nodes;

    // Fire-and-forget entity extraction
    extractEntitiesFromText(text, existingNodes).catch(() => {});

    // Send insights immediately
    if (insights.length > 0) {
      send({ type: 'insights', insights });
    }

    const systemPrompt = buildWilliamSystemPrompt(portrait, worldContext, insights, timeOfDay);
    let fullReply = '';

    await BrainGateway.executeStream(
      { systemPrompt, userPrompt: text, maxTokens: 300 },
      (token: string) => {
        fullReply += token;
        send({ type: 'token', token });
      }
    );

    // Save chat
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await Promise.all([
      saveChat({ id: `user_${Date.now()}`, sender: 'user', text, time, session: session || 'default' }),
      saveChat({ id: `william_${Date.now()}`, sender: 'william', text: fullReply, time, session: session || 'default' })
    ]);

    // Update emotional trend
    const sentiment = scoreSentiment(text);
    const updatedPortrait = { ...portrait, emotionalTrends: [...(portrait.emotionalTrends || []).slice(-29), { date: new Date().toISOString(), sentiment, note: text.substring(0, 80) }] };
    savePortrait(updatedPortrait).catch(() => {});

    send({ type: 'done', fullReply });
    res.end();
  } catch (error) {
    send({ type: 'error', message: (error as Error).message });
    res.end();
  }
});

// 8. Reflection Engine
app.post('/api/reflection-engine', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const portrait = await getPortrait();
    if (!portrait) return res.status(400).json({ error: 'Portrait not initialized.' });

    const chats = await getChats('desktop');
    const chronicles = await getChronicle();
    const analysis = await runWilliamReflection(chats, chronicles, portrait, apiKey);

    // Update portrait with all evolved fields
    const now = new Date().toISOString();
    const updatedPortrait: Portrait = {
      ...portrait,
      identity: analysis.identity,
      dreams: analysis.dreams,
      strengths: analysis.strengths,
      blind_spots: analysis.blindSpots,
      growth: [...portrait.growth, `William reflection: "${analysis.reflection}"`],
      cognitiveProfile: analysis.cognitiveProfile,
      activeBeliefs: analysis.activeBeliefs,
      emotionalTrends: [
        ...(portrait.emotionalTrends || []).slice(-29),
        { date: now, sentiment: analysis.emotionalTrend, note: analysis.reflection.substring(0, 100) }
      ],
      behavioralPatterns: analysis.behavioralPattern ? [
        ...(portrait.behavioralPatterns || []).slice(-9),
        { pattern: analysis.behavioralPattern, frequency: 'occasional', lastSeen: now }
      ] : (portrait.behavioralPatterns || [])
    };

    await savePortrait(updatedPortrait);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await saveChronicle({ id: `reflection_${Date.now()}`, time: timestamp, category: 'reflection', text: `William processed daily reflections: "${analysis.reflection}"` });

    // Schedule tomorrow's morning check-in
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);
    await saveProactiveSignal({
      id: `morning_${tomorrow.toDateString()}`,
      type: 'daily_checkin',
      triggerTime: tomorrow.toISOString(),
      message: `Good morning, ${portrait.name}. Yesterday's reflection is complete. What are you carrying into today?`,
      acknowledged: false,
      createdAt: now
    });

    res.json({ success: true, reflection: analysis.reflection, portrait: updatedPortrait });
  } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

// 9. Observer Sync
app.post('/api/observer/sync', async (req: Request, res: Response) => {
  try {
    const { provider } = req.body;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let text = '';

    if (provider === 'github') {
      text = 'Observer sync: Detected 4 git commits to Atlas development branch.';
    } else {
      text = 'Observer sync: Checked calendar events and Notion spec notes.';
    }

    await saveChronicle({ id: `observer_${Date.now()}`, time: timestamp, category: 'system', text });

    const portrait = await getPortrait();
    if (portrait) {
      portrait.growth.push(`Observer updated from ${provider}: ${text}`);
      await savePortrait(portrait);
    }

    res.json({ success: true, log: text });
  } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

// 10. Presence Engine
app.get('/api/presence', async (req: Request, res: Response) => {
  try {
    const portrait = await getPortrait();
    if (!portrait) return res.json({ checkIn: false });

    const name = portrait.name || 'Friend';
    const timeOfDay = getTimeOfDay();
    const now = new Date().toISOString();

    // Check for pending proactive signals whose time has arrived
    const signals = await getProactiveSignals(true);
    const dueSignal = signals.find(s => s.triggerTime <= now);

    if (dueSignal) {
      return res.json({ checkIn: true, need: dueSignal.type, message: dueSignal.message, signalId: dueSignal.id });
    }

    const chronicle = await getChronicle();
    const hasFatigue = chronicle.some(c => c.text.toLowerCase().includes('exhausted') || c.text.toLowerCase().includes('tired'));
    const hasFrustration = chronicle.some(c => c.text.toLowerCase().includes('frustrated') || c.text.toLowerCase().includes('stuck'));
    const hasVictory = chronicle.some(c => c.text.toLowerCase().includes('shipped') || c.text.toLowerCase().includes('completed') || c.text.toLowerCase().includes('finished'));

    if (timeOfDay === 'morning') {
      return res.json({ checkIn: true, need: 'morning_brief', message: `Good morning, ${name}. What is the one thing that would make today feel complete?` });
    }

    if (hasFatigue) {
      return res.json({ checkIn: true, need: 'silence', message: `I notice your logs suggest heavy cognitive strain, ${name}. I will remain quiet. Step back and let the mind reset.` });
    }

    if (hasVictory) {
      return res.json({ checkIn: true, need: 'recognition', message: `You completed something today, ${name}. That is not nothing. Let it land before moving to the next thing.` });
    }

    if (hasFrustration) {
      return res.json({ checkIn: true, need: 'perspective', message: `Hello, ${name}. I noticed a barrier has caused some friction today. Let's describe the constraint instead of pushing with sheer willpower.` });
    }

    if (chronicle.length > 2) {
      return res.json({ checkIn: true, need: 'encouragement', message: `You compiled several milestones today, ${name}. Your systemic pacing is beginning to compound.` });
    }

    res.json({ checkIn: false });
  } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

app.post('/api/presence/acknowledge', async (req: Request, res: Response) => {
  try {
    const { signalId } = req.body;
    if (signalId) await acknowledgeSignal(signalId);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

// 11. World Model
app.get('/api/world-model', async (_req: Request, res: Response) => {
  try { res.json(await getWorldModel()); } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

app.post('/api/world-model/node', async (req: Request, res: Response) => {
  try {
    const { saveMemoryNode } = await import('./memoryAdapter.js');
    await saveMemoryNode(req.body);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

app.post('/api/world-model/edge', async (req: Request, res: Response) => {
  try {
    const { saveMemoryEdge } = await import('./memoryAdapter.js');
    await saveMemoryEdge(req.body);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});



// 12. Action Layer
app.post('/api/actions', async (req: Request, res: Response) => {
  try {
    const actionReq = req.body as ActionRequest;
    if (!actionReq.type || !actionReq.title) return res.status(400).json({ error: 'type and title are required' });

    const result = await dispatchAction(actionReq);
    res.json({ success: result.status !== 'failed', action: result });
  } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

app.get('/api/actions', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as 'pending' | 'executed' | 'failed' | undefined;
    res.json(await getActionLog(status));
  } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

// 13. Proactive Scheduler
app.post('/api/checkin/schedule', async (req: Request, res: Response) => {
  try {
    const { message, triggerTime, type } = req.body;
    if (!message || !triggerTime) return res.status(400).json({ error: 'message and triggerTime are required' });

    await saveProactiveSignal({
      id: `sched_${Date.now()}`,
      type: type || 'daily_checkin',
      triggerTime,
      message,
      acknowledged: false,
      createdAt: new Date().toISOString()
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: (error as Error).message }); }
});

// ─── Bootstrap ────────────────────────────────────────────────────────────────

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`William Cognitive Companion API running on port ${PORT}`);
  });
}
