import { NextResponse } from 'next/server';
import { getPortrait, getChats, saveChat, savePortrait } from '@/lib/db';
import { buildWilliamSystemPrompt, callAI, getTimeOfDay } from '@/lib/ai';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const portrait = (await getPortrait()) || {
      id: 'user_1',
      name: 'William',
      identity: 'Architect, systems builder, and creative technologist.',
      values: 'Autonomy, deep focus, aesthetic excellence, continuous mastery.',
      principles: 'Build systems that scale leverage.',
      strengths: 'System design, rapid execution, synthetic reasoning.',
      blind_spots: 'Occasional over-engineering.',
      dreams: 'Craft a seamless personal AI companion.',
      relationships: 'Collaborators & family',
      decision_patterns: [],
      growth: [],
      cognitive_profile: {
        problemSolvingStyle: 'System-builder',
        temporalBias: 'Strategic compounding focus',
        attentionSpan: 'High intensity blocks',
        decisionHeuristics: 'Empirical validation'
      },
      active_beliefs: []
    };

    const isGreeting = message === '__GREETING__';
    const timeOfDay = getTimeOfDay();

    let userPrompt = message;
    if (isGreeting) {
      userPrompt = `Open the session with a single short, personal greeting for ${portrait.name}. It is ${timeOfDay}. Reference one specific detail from their portrait (a current belief, journey, or dream). Do not start with 'Hello' or 'Good morning'. Keep it under 2 sentences.`;
    }

    const systemPrompt = buildWilliamSystemPrompt(portrait);
    const reply = await callAI(systemPrompt, userPrompt, isGreeting ? 120 : 300);

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (!isGreeting) {
      // Save user message and William's reply to Supabase
      await saveChat({
        id: `user_${Date.now()}`,
        sender: 'user',
        text: message,
        time: timeStr
      });
    }

    await saveChat({
      id: `william_${Date.now()}`,
      sender: 'william',
      text: reply,
      time: timeStr
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json({ reply: 'William is momentarily resting. (Error processing request)' });
  }
}
