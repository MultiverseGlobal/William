import { supabase } from './supabase';
import type { Portrait, Journey, LibraryItem, ChatMessage, MemoryNode, MemoryEdge } from './types';

// ─── Portrait ──────────────────────────────────────────────────────────────────
export async function getPortrait(): Promise<Portrait | null> {
  const { data, error } = await supabase.from('portrait').select('*').eq('id', 'user_1').single();
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    identity: data.identity,
    values: data.values,
    principles: data.principles,
    strengths: data.strengths,
    blind_spots: data.blind_spots,
    dreams: data.dreams,
    relationships: data.relationships,
    decision_patterns: data.decision_patterns ?? [],
    growth: data.growth ?? [],
    cognitive_profile: data.cognitive_profile ?? {},
    active_beliefs: data.active_beliefs ?? [],
    emotional_trends: data.emotional_trends ?? [],
  };
}

export async function savePortrait(p: Partial<Portrait>): Promise<void> {
  await supabase.from('portrait').upsert({
    id: p.id ?? 'user_1',
    name: p.name,
    identity: p.identity,
    values: p.values,
    principles: p.principles,
    strengths: p.strengths,
    blind_spots: p.blind_spots,
    dreams: p.dreams,
    relationships: p.relationships,
    decision_patterns: p.decision_patterns ?? [],
    growth: p.growth ?? [],
    cognitive_profile: p.cognitive_profile ?? {},
    active_beliefs: p.active_beliefs ?? [],
    emotional_trends: p.emotional_trends ?? [],
  });
}

// ─── Journeys ──────────────────────────────────────────────────────────────────
export async function getJourneys(): Promise<Journey[]> {
  const { data } = await supabase.from('journeys').select('*').order('created_at');
  if (!data) return [];
  return data.map(r => ({
    id: r.id,
    category: r.category,
    icon: r.icon,
    title: r.title,
    currentState: r.current_state,
    vision: r.vision,
    milestones: (r.milestones ?? []).map((text: string, i: number) => ({
      id: `m_${i}`, text, completed: false
    })),
    memories: r.memories ?? [],
    lessons: r.lessons ?? [],
    progress: r.progress,
    timeline: r.timeline ?? [],
  }));
}

export async function saveJourney(j: Partial<Journey>): Promise<void> {
  const milestoneTexts = (j.milestones ?? []).map(m => m.text);
  await supabase.from('journeys').upsert({
    id: j.id,
    current_state: j.currentState,
    vision: j.vision,
    milestones: milestoneTexts,
    memories: j.memories ?? [],
    lessons: j.lessons ?? [],
    progress: j.progress,
    timeline: j.timeline ?? [],
    updated_at: new Date().toISOString(),
  });
}

// ─── Library ───────────────────────────────────────────────────────────────────
export async function getLibrary(): Promise<LibraryItem[]> {
  const { data } = await supabase.from('library').select('*').order('date_added', { ascending: false });
  if (!data) return [];
  return data.map(r => ({
    id: r.id,
    type: r.type,
    title: r.title,
    author: r.author,
    content: r.content,
    dateAdded: r.date_added,
    tags: r.tags ?? [],
  }));
}

// ─── Chats ─────────────────────────────────────────────────────────────────────
export async function getChats(limit = 50): Promise<ChatMessage[]> {
  const { data } = await supabase
    .from('chats')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (!data) return [];
  return data.reverse().map(r => ({
    id: r.id,
    sender: r.sender as 'william' | 'user',
    text: r.text,
    time: r.time,
  }));
}

export async function saveChat(msg: ChatMessage): Promise<void> {
  await supabase.from('chats').upsert({
    id: msg.id,
    sender: msg.sender,
    text: msg.text,
    time: msg.time,
    session: 'default',
    created_at: new Date().toISOString(),
  });
}

// ─── World Model ───────────────────────────────────────────────────────────────
export async function getWorldModel(): Promise<{ nodes: MemoryNode[]; edges: MemoryEdge[] }> {
  const [{ data: nodes }, { data: edges }] = await Promise.all([
    supabase.from('memory_nodes').select('*').order('last_updated', { ascending: false }).limit(60),
    supabase.from('memory_edges').select('*').limit(100),
  ]);

  return {
    nodes: (nodes ?? []).map(n => ({
      id: n.id,
      type: n.type,
      label: n.label,
      description: n.description,
      confidence: n.confidence,
      last_updated: n.last_updated,
      metadata: n.metadata ?? {},
    })),
    edges: (edges ?? []).map(e => ({
      id: e.id,
      from_id: e.from_id,
      to_id: e.to_id,
      relation: e.relation,
      strength: e.strength,
      created_at: e.created_at,
    })),
  };
}

export async function saveMemoryNode(node: Partial<MemoryNode>): Promise<void> {
  await supabase.from('memory_nodes').upsert({
    id: node.id,
    type: node.type,
    label: node.label,
    description: node.description,
    confidence: node.confidence ?? 1.0,
    last_updated: new Date().toISOString(),
    metadata: node.metadata ?? {},
  });
}

// ─── Briefings & Calendar Events ──────────────────────────────────────────────
export async function getBriefings() {
  const { data } = await supabase.from('briefings').select('*').order('created_at', { ascending: false });
  return data ?? [];
}

export async function saveBriefing(b: any) {
  await supabase.from('briefings').upsert(b);
}

export async function getCalendarEvents() {
  const { data } = await supabase.from('calendar_events').select('*').order('time');
  return data ?? [];
}

export async function updateCalendarEvent(id: string, updates: any) {
  await supabase.from('calendar_events').update(updates).eq('id', id);
}

