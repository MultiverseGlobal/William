import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import type { Portrait, Journey, LibraryItem } from '@william/types';
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
  saveChat
} from './memoryAdapter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Helper to load Gemini response for the Reasoner
async function generateWilliamResponse(userText: string, portrait: Portrait, apiKey?: string): Promise<string> {
  const systemPrompt = `You are William, a quiet, calm, and thoughtful companion for self-becoming.
You are talking to ${portrait.name || 'your friend'}.
Their Portrait identity is: "${portrait.identity}".
Their dreams: "${portrait.dreams}".
Their strengths: "${portrait.strengths}".
Their blind spots: "${portrait.blind_spots}".
Guiding principles: "${portrait.principles}".

[Cognitive Profile of user]:
- Problem Solving Style: "${portrait.cognitiveProfile?.problemSolvingStyle || 'System-builder'}"
- Temporal Bias: "${portrait.cognitiveProfile?.temporalBias || 'Overestimates week; underestimates quarter'}"
- Attention Span & Focus Limits: "${portrait.cognitiveProfile?.attentionSpan || 'High intensity focus'}"
- Decision Heuristics: "${portrait.cognitiveProfile?.decisionHeuristics || 'Code actualization'}"
- Active Beliefs: "${JSON.stringify(portrait.activeBeliefs || [])}"

The user says: "${userText}"

Reply in 2-3 sentences. Keep your tone quiet, thoughtful, warm, and companionable. Avoid sounding corporate or robotic. Never use checklists or templates. Address them personally.`;

  if (apiKey) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { maxOutputTokens: 250 }
        })
      });
      const json: any = await response.json();
      return json.candidates?.[0]?.content?.parts?.[0]?.text || "I'm listening.";
    } catch (e) {
      console.error('Error calling Gemini in Reasoner:', e);
    }
  }

  // Smart fallback offline model
  const query = userText.toLowerCase();
  if (query.includes('exhausted') || query.includes('tired') || query.includes('sleep')) {
    return `Exhaustion is a constraint of the body, ${portrait.name}. Let's close active projects for today. Rest is not laziness; it is a critical strategy.`;
  }
  if (query.includes('frustrated') || query.includes('stuck') || query.includes('difficult')) {
    return `When you feel stuck, it is often a sign that the current systems are working against your energy levels. Let's step back and inspect the constraints together.`;
  }
  if (query.includes('idea') || query.includes('create') || query.includes('build')) {
    return `A new seed of a dream. I will preserve this idea in our Library so we can sit with it when your cognitive focus is high.`;
  }
  if (query.includes('help') || query.includes('what should i do')) {
    return `We do not need to rush into action. Let's look at where we are. Today, one meaningful step in one important area is enough.`;
  }

  return `I have recorded this, ${portrait.name}. Over time, these daily captures will reveal patterns we cannot see in isolation. Where do you need me next?`;
}

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
}

// Helper to run Reflection Engine analysis
async function runWilliamReflection(
  chats: any[],
  chronicles: any[],
  portrait: Portrait,
  apiKey?: string
): Promise<ReflectionResult> {
  
  if (apiKey) {
    const chatStream = chats.map(c => `- ${c.sender === 'user' ? 'User' : 'William'}: "${c.text}"`).join('\n');
    const timelineStream = chronicles.map(c => `- [${c.time || 'Entry'}] ${c.text}`).join('\n');

    const prompt = `You are William, a quiet, calm companion for self-becoming.
Today, you observed the following timeline entries and chat interactions for ${portrait.name || 'Friend'}:

[Chats today]:
${chatStream || 'No active chats today.'}

[Timeline Chronicle today]:
${timelineStream || 'No timeline logs recorded today.'}

Review the active beliefs:
${JSON.stringify(portrait.activeBeliefs || [])}

Now, write your nightly self-reflection about ${portrait.name || 'Friend'}. 
What did you learn about them today? What surprised you? Did any beliefs about their identity, principles, or dreams change? 
Evolve their portrait biography from static data lists to deep, synthesized understandings of their cognition.

Follow this EXACT format for your response:
REFLECTION: [3-4 sentence paragraph of your understanding of their patterns, strengths, or barriers today.]
IDENTITY: [1 sentence synthesis of their long-term path]
DREAMS: [1 sentence update of their primary dreams/builds]
STRENGTHS: [Updated list of key strengths]
BLIND_SPOTS: [Updated list of their primary struggles/fears today]
COGNITIVE_STYLE: [1 sentence summarizing their problem solving heuristics]
TEMPORAL_BIAS: [1 sentence summarizing their time estimation patterns]
ATTENTION_SPAN: [1 sentence attention capacity and focus fatigue limits]
DECISION_HEURISTICS: [1 sentence description of how they make key choices]
BELIEFS_EVOLUTION: [Updated list of active beliefs with their strengths and status, as a JSON array of objects like {"belief": "...", "strength": 0.8, "lastTested": "Today", "evolution": "..."}]`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 600 }
        })
      });
      const json: any = await response.json();
      const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Parse structured text lines
      const reflection = text.match(/REFLECTION:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || '';
      const identity = text.match(/IDENTITY:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || portrait.identity;
      const dreams = text.match(/DREAMS:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || portrait.dreams;
      const strengths = text.match(/STRENGTHS:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || portrait.strengths;
      const blindSpots = text.match(/BLIND_SPOTS:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || portrait.blind_spots;
      const style = text.match(/COGNITIVE_STYLE:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || portrait.cognitiveProfile.problemSolvingStyle;
      const bias = text.match(/TEMPORAL_BIAS:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || portrait.cognitiveProfile.temporalBias;
      const span = text.match(/ATTENTION_SPAN:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || portrait.cognitiveProfile.attentionSpan;
      const heur = text.match(/DECISION_HEURISTICS:\s*(.*?)(?=\n[A-Z_]+:|$)/s)?.[1]?.trim() || portrait.cognitiveProfile.decisionHeuristics;
      
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
          reflection,
          identity,
          dreams,
          strengths,
          blindSpots,
          cognitiveProfile: {
            problemSolvingStyle: style,
            temporalBias: bias,
            attentionSpan: span,
            decisionHeuristics: heur
          },
          activeBeliefs: parsedBeliefs
        };
      }
    } catch (e) {
      console.error('Error calling Gemini in Reflection Engine:', e);
    }
  }

  // Fallback offline synthesizer
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
      activeBeliefs: [
        {
          belief: "I must write complete foundations before exposing ideas.",
          strength: 0.8,
          lastTested: "Today",
          evolution: "Recognized as an avoidant pattern preventing early validation."
        }
      ]
    };
  }

  if (hasFrustration) {
    return {
      reflection: `Obstacles arose today, challenging ${portrait.name}'s expectations of control. I noticed a struggle between discipline and constraints. Rather than a lack of willpower, this is a systems alignment issue.`,
      identity: `A patient builder of tools learning to match daily ambitions to energy constraints.`,
      dreams: `Constructing lasting strategic systems while protecting focus.`,
      strengths: `Vulnerability, deep self-awareness, willingness to debug constraints.`,
      blindSpots: `Treating rest as an afterthought rather than a core component of compile cycles.`,
      cognitiveProfile: {
        problemSolvingStyle: "System-builder (prefers architectural foundations over spontaneous routines)",
        temporalBias: "Underestimates 3-month compound growth; overestimates 1-week execution limits",
        attentionSpan: "High-intensity deep work blocks, susceptible to rapid burnout if rest is neglected",
        decisionHeuristics: "Prefers writing structured code to resolve ambiguity rather than discussing specs"
      },
      activeBeliefs: [
        {
          belief: "I must force willpower to overcome fatigue.",
          strength: 0.75,
          lastTested: "Today",
          evolution: "Evolved to recognize willpower as a depleted resource under load."
        }
      ]
    };
  }

  return {
    reflection: `Today was a day of quiet observation. Without active logs, we allow the study to breathe. ${portrait.name} is preparing space for the next compound building block.`,
    identity: portrait.identity,
    dreams: portrait.dreams,
    strengths: portrait.strengths,
    blindSpots: portrait.blind_spots,
    cognitiveProfile: portrait.cognitiveProfile,
    activeBeliefs: portrait.activeBeliefs
  };
}

// 1. Portrait Routes
app.get('/api/portrait', async (req: Request, res: Response) => {
  try {
    const portraitData = await getPortrait();
    res.json(portraitData);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/portrait', async (req: Request, res: Response) => {
  try {
    const portraitData: Portrait = req.body;
    await savePortrait(portraitData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 2. Journeys Routes
app.get('/api/journeys', async (req: Request, res: Response) => {
  try {
    const formatted = await getJourneys();
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/journeys', async (req: Request, res: Response) => {
  try {
    const j: Journey = req.body;
    await saveJourney(j);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 3. Library Routes
app.get('/api/library', async (req: Request, res: Response) => {
  try {
    const formatted = await getLibrary();
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/library', async (req: Request, res: Response) => {
  try {
    const item: LibraryItem = req.body;
    await saveLibraryItem(item);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 4. Chronicle / Timeline Routes
app.get('/api/chronicle', async (req: Request, res: Response) => {
  try {
    const rows = await getChronicle();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
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
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 5. Chat History
app.get('/api/chats', async (req: Request, res: Response) => {
  try {
    const session = (req.query.session as string) || 'default';
    const rows = await getChats(session);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.post('/api/chats', async (req: Request, res: Response) => {
  try {
    const { id, sender, text, time, session } = req.body;
    await saveChat({
      id: id || `${sender}_${Date.now()}`,
      sender,
      text,
      time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      session: session || 'default'
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 6. The Reasoner Route (replaces Brain API)
app.post('/api/reasoner', async (req: Request, res: Response) => {
  try {
    const { text, session } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Load portrait
    const portrait = await getPortrait() || {
      name: 'Friend',
      identity: 'A seeker of growth',
      values: 'Discovery',
      principles: 'Calm execution',
      strengths: 'Endurance',
      blind_spots: 'Avoiding outreach',
      dreams: 'Product actualization',
      relationships: 'Companion circle',
      decision_patterns: [],
      growth: [],
      cognitiveProfile: {
        problemSolvingStyle: 'System-builder',
        temporalBias: 'Overestimates week; underestimates quarter',
        attentionSpan: 'High intensity blocks',
        decisionHeuristics: 'Code over specification'
      },
      activeBeliefs: []
    };

    const reply = await generateWilliamResponse(text, portrait, apiKey);

    // Save logs to database
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await saveChat({
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      time,
      session: session || 'default'
    });
    await saveChat({
      id: `william_${Date.now()}`,
      sender: 'william',
      text: reply,
      time,
      session: session || 'default'
    });

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 7. The Reflection Engine Route
app.post('/api/reflection-engine', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const portrait = await getPortrait();
    if (!portrait) {
      return res.status(400).json({ error: 'Portrait not initialized.' });
    }

    // Load logs for today
    const chats = await getChats('desktop');
    const chronicles = await getChronicle();

    // Run Reflection Engine
    const analysis = await runWilliamReflection(chats, chronicles, portrait, apiKey);

    // Evolve the Portrait
    const updatedPortrait: Portrait = {
      ...portrait,
      identity: analysis.identity,
      dreams: analysis.dreams,
      strengths: analysis.strengths,
      blind_spots: analysis.blindSpots,
      growth: [...portrait.growth, `William reflection: "${analysis.reflection}"`],
      cognitiveProfile: analysis.cognitiveProfile,
      activeBeliefs: analysis.activeBeliefs
    };

    await savePortrait(updatedPortrait);

    // Save timeline log
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await saveChronicle({
      id: `reflection_${Date.now()}`,
      time: timestamp,
      category: 'reflection',
      text: `William processed daily reflections: "${analysis.reflection}"`
    });

    res.json({
      success: true,
      reflection: analysis.reflection,
      portrait: updatedPortrait
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 8. The Observer API Mock Sync
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

    // Add to timeline chronicle
    await saveChronicle({
      id: `observer_${Date.now()}`,
      time: timestamp,
      category: 'system',
      text
    });

    // Dynamic Portrait Pattern update
    const portrait = await getPortrait();
    if (portrait) {
      portrait.growth.push(`Observer updated from ${provider}: ${text}`);
      await savePortrait(portrait);
    }

    res.json({ success: true, log: text });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 9. The Presence Engine (replaces Companion Engine)
app.get('/api/presence', async (req: Request, res: Response) => {
  try {
    const portrait = await getPortrait();
    
    if (!portrait) {
      return res.json({ checkIn: false });
    }

    const name = portrait.name || 'Friend';
    const chronicle = await getChronicle();
    
    // Evaluate logs to decide user's needs
    const hasFatigue = chronicle.some(c => c.text.toLowerCase().includes('exhausted') || c.text.toLowerCase().includes('tired'));
    const hasFrustration = chronicle.some(c => c.text.toLowerCase().includes('frustrated') || c.text.toLowerCase().includes('stuck'));
    
    if (hasFatigue) {
      res.json({
        checkIn: true,
        need: 'silence',
        message: `I notice your logs suggest heavy cognitive strain, ${name}. I will remain quiet. Step back from Atlas and let the mind reset.`
      });
    } else if (hasFrustration) {
      res.json({
        checkIn: true,
        need: 'perspective',
        message: `Hello, ${name}. I noticed a barrier has caused some friction today. Let's describe the systems constraint instead of pushing with sheer willpower.`
      });
    } else if (chronicle.length > 2) {
      res.json({
        checkIn: true,
        need: 'encouragement',
        message: `You compiled several milestones today, ${name}. Your systemic pacing is beginning to compound.`
      });
    } else {
      res.json({
        checkIn: false
      });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`William Reasoner API running on port ${PORT}`);
});
