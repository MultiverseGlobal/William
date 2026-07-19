import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getDatabase } from './db';
import type { Portrait, Journey, LibraryItem } from '@william/types';

const useSupabase = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
let supabase: SupabaseClient | null = null;

if (useSupabase) {
  console.log('Memory: Initializing Supabase cloud memory adapter.');
  supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
} else {
  console.log('Local Memory: Supabase variables not set. Falling back to SQLite file (william.db).');
}

// 1. Portrait Operations
export async function getPortrait(): Promise<Portrait | null> {
  if (useSupabase && supabase) {
    const { data, error } = await supabase.from('portrait').select('*').eq('id', 'user_1').single();
    if (error || !data) return null;
    return {
      name: data.name,
      identity: data.identity,
      values: data.values,
      principles: data.principles,
      strengths: data.strengths,
      blind_spots: data.blind_spots,
      dreams: data.dreams,
      relationships: data.relationships,
      decision_patterns: data.decision_patterns || [],
      growth: data.growth || [],
      cognitiveProfile: data.cognitive_profile || {
        problemSolvingStyle: 'System-builder (prefers architectural foundations over spontaneous routines)',
        temporalBias: 'Underestimates 3-month compound growth; overestimates 1-week execution limits',
        attentionSpan: 'High-intensity deep work blocks, susceptible to rapid burnout if rest is neglected',
        decisionHeuristics: 'Prefers writing structured code to resolve ambiguity rather than discussing specs'
      },
      activeBeliefs: data.active_beliefs || []
    };
  } else {
    const db = await getDatabase();
    const row = await db.get('SELECT * FROM portrait LIMIT 1');
    if (!row) return null;
    return {
      name: row.name,
      identity: row.identity,
      values: row.values,
      principles: row.principles,
      strengths: row.strengths,
      blind_spots: row.blind_spots,
      dreams: row.dreams,
      relationships: row.relationships,
      decision_patterns: JSON.parse(row.decision_patterns || '[]'),
      growth: JSON.parse(row.growth || '[]'),
      cognitiveProfile: JSON.parse(row.cognitive_profile || '{"problemSolvingStyle":"System-builder (prefers architectural foundations over spontaneous routines)","temporalBias":"Underestimates 3-month compound growth; overestimates 1-week execution limits","attentionSpan":"High-intensity deep work blocks, susceptible to rapid burnout if rest is neglected","decisionHeuristics":"Prefers writing structured code to resolve ambiguity rather than discussing specs"}'),
      activeBeliefs: JSON.parse(row.active_beliefs || '[]')
    };
  }
}

export async function savePortrait(p: Portrait): Promise<void> {
  if (useSupabase && supabase) {
    const { error } = await supabase.from('portrait').upsert({
      id: 'user_1',
      name: p.name,
      identity: p.identity,
      values: p.values,
      principles: p.principles,
      strengths: p.strengths,
      blind_spots: p.blind_spots,
      dreams: p.dreams,
      relationships: p.relationships,
      decision_patterns: p.decision_patterns,
      growth: p.growth,
      cognitive_profile: p.cognitiveProfile,
      active_beliefs: p.activeBeliefs
    });
    if (error) throw error;
  } else {
    const db = await getDatabase();
    await db.run(`
      INSERT INTO portrait (id, name, identity, "values", principles, strengths, blind_spots, dreams, relationships, decision_patterns, growth, cognitive_profile, active_beliefs)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        identity = excluded.identity,
        "values" = excluded."values",
        principles = excluded.principles,
        strengths = excluded.strengths,
        blind_spots = excluded.blind_spots,
        dreams = excluded.dreams,
        relationships = excluded.relationships,
        decision_patterns = excluded.decision_patterns,
        growth = excluded.growth,
        cognitive_profile = excluded.cognitive_profile,
        active_beliefs = excluded.active_beliefs
    `,
      'user_1',
      p.name,
      p.identity,
      p.values,
      p.principles,
      p.strengths,
      p.blind_spots,
      p.dreams,
      p.relationships,
      JSON.stringify(p.decision_patterns),
      JSON.stringify(p.growth),
      JSON.stringify(p.cognitiveProfile),
      JSON.stringify(p.activeBeliefs)
    );
  }
}

// 2. Journeys Operations
export async function getJourneys(): Promise<Journey[]> {
  if (useSupabase && supabase) {
    const { data, error } = await supabase.from('journeys').select('*');
    if (error || !data) return [];
    return data.map((j: any) => ({
      id: j.id,
      category: j.category,
      icon: j.icon,
      title: j.title,
      currentState: j.current_state,
      vision: j.vision,
      milestones: j.milestones || [],
      memories: j.memories || [],
      lessons: j.lessons || [],
      progress: j.progress || 0,
      timeline: j.timeline || []
    }));
  } else {
    const db = await getDatabase();
    const rows = await db.all('SELECT * FROM journeys');
    return rows.map((row: any) => ({
      id: row.id,
      category: row.category,
      icon: row.icon,
      title: row.title,
      currentState: row.currentState,
      vision: row.vision,
      milestones: JSON.parse(row.milestones || '[]'),
      memories: JSON.parse(row.memories || '[]'),
      lessons: JSON.parse(row.lessons || '[]'),
      progress: row.progress,
      timeline: JSON.parse(row.timeline || '[]')
    }));
  }
}

export async function saveJourney(j: Journey): Promise<void> {
  if (useSupabase && supabase) {
    const { error } = await supabase.from('journeys').upsert({
      id: j.id,
      category: j.category,
      icon: j.icon,
      title: j.title,
      current_state: j.currentState,
      vision: j.vision,
      milestones: j.milestones,
      memories: j.memories,
      lessons: j.lessons,
      progress: j.progress,
      timeline: j.timeline
    });
    if (error) throw error;
  } else {
    const db = await getDatabase();
    await db.run(`
      INSERT INTO journeys (id, category, icon, title, currentState, vision, milestones, memories, lessons, progress, timeline)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        currentState = excluded.currentState,
        vision = excluded.vision,
        milestones = excluded.milestones,
        memories = excluded.memories,
        lessons = excluded.lessons,
        progress = excluded.progress,
        timeline = excluded.timeline
    `,
      j.id,
      j.category,
      j.icon,
      j.title,
      j.currentState,
      j.vision,
      JSON.stringify(j.milestones),
      JSON.stringify(j.memories),
      JSON.stringify(j.lessons),
      j.progress,
      JSON.stringify(j.timeline)
    );
  }
}

// 3. Library Operations
export async function getLibrary(): Promise<LibraryItem[]> {
  if (useSupabase && supabase) {
    const { data, error } = await supabase.from('library').select('*');
    if (error || !data) return [];
    return data.map((item: any) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      author: item.author || undefined,
      content: item.content,
      dateAdded: item.date_added,
      tags: item.tags || []
    }));
  } else {
    const db = await getDatabase();
    const rows = await db.all('SELECT * FROM library');
    return rows.map((row: any) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      author: row.author || undefined,
      content: row.content,
      dateAdded: row.dateAdded,
      tags: JSON.parse(row.tags || '[]')
    }));
  }
}

export async function saveLibraryItem(item: LibraryItem): Promise<void> {
  if (useSupabase && supabase) {
    const { error } = await supabase.from('library').upsert({
      id: item.id,
      type: item.type,
      title: item.title,
      author: item.author || null,
      content: item.content,
      date_added: item.dateAdded,
      tags: item.tags
    });
    if (error) throw error;
  } else {
    const db = await getDatabase();
    await db.run(`
      INSERT INTO library (id, type, title, author, content, dateAdded, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        content = excluded.content,
        tags = excluded.tags
    `,
      item.id,
      item.type,
      item.title,
      item.author || null,
      item.content,
      item.dateAdded,
      JSON.stringify(item.tags)
    );
  }
}

// 4. Chronicle / Timeline Operations
export async function getChronicle(): Promise<any[]> {
  if (useSupabase && supabase) {
    const { data, error } = await supabase.from('chronicle').select('*').order('id', { ascending: false });
    if (error || !data) return [];
    return data;
  } else {
    const db = await getDatabase();
    return await db.all('SELECT * FROM chronicle ORDER BY id DESC');
  }
}

export async function saveChronicle(entry: { id: string; time: string; category: string; text: string }): Promise<void> {
  if (useSupabase && supabase) {
    const { error } = await supabase.from('chronicle').insert(entry);
    if (error) throw error;
  } else {
    const db = await getDatabase();
    await db.run(
      'INSERT INTO chronicle (id, time, category, text) VALUES (?, ?, ?, ?)',
      entry.id,
      entry.time,
      entry.category,
      entry.text
    );
  }
}

// 5. Chats Operations
export async function getChats(session: string): Promise<any[]> {
  if (useSupabase && supabase) {
    const { data, error } = await supabase.from('chats').select('*').eq('session', session).order('id', { ascending: true });
    if (error || !data) return [];
    return data;
  } else {
    const db = await getDatabase();
    return await db.all('SELECT * FROM chats WHERE session = ? ORDER BY id ASC', session);
  }
}

export async function saveChat(chat: { id: string; sender: string; text: string; time: string; session: string }): Promise<void> {
  if (useSupabase && supabase) {
    const { error } = await supabase.from('chats').insert(chat);
    if (error) throw error;
  } else {
    const db = await getDatabase();
    await db.run(
      'INSERT INTO chats (id, sender, text, time, session) VALUES (?, ?, ?, ?, ?)',
      chat.id,
      chat.sender,
      chat.text,
      chat.time,
      chat.session
    );
  }
}
