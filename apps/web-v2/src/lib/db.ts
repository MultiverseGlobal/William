import Database from 'better-sqlite3';
import path from 'path';
import type { Portrait, Journey, LibraryItem, ChatMessage, MemoryNode, MemoryEdge } from './types';

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  const dbPath = path.resolve(process.cwd(), '../william.db');
  _db = new Database(dbPath);
  _db.pragma('journal_mode = WAL');
  return _db;
}

// ─── Portrait ──────────────────────────────────────────────────────────────────
export function getPortrait(): Portrait | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM portrait LIMIT 1').get() as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    id: row.id as string,
    name: row.name as string,
    identity: row.identity as string,
    values: row.values as string,
    principles: row.principles as string,
    strengths: row.strengths as string,
    blind_spots: row.blind_spots as string,
    dreams: row.dreams as string,
    relationships: row.relationships as string,
    decision_patterns: parseJson(row.decision_patterns as string, []),
    growth: parseJson(row.growth as string, []),
    cognitive_profile: parseJson(row.cognitive_profile as string, {}),
    active_beliefs: parseJson(row.active_beliefs as string, []),
    emotional_trends: parseJson(row.emotional_trends as string, []),
  };
}

export function savePortrait(p: Partial<Portrait>): void {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM portrait LIMIT 1').get();
  if (existing) {
    db.prepare(`UPDATE portrait SET
      name=?, identity=?, "values"=?, principles=?, strengths=?, blind_spots=?,
      dreams=?, relationships=?, decision_patterns=?, growth=?, cognitive_profile=?,
      active_beliefs=?, emotional_trends=?
      WHERE id=?`).run(
      p.name, p.identity, p.values, p.principles, p.strengths, p.blind_spots,
      p.dreams, p.relationships,
      JSON.stringify(p.decision_patterns ?? []),
      JSON.stringify(p.growth ?? []),
      JSON.stringify(p.cognitive_profile ?? {}),
      JSON.stringify(p.active_beliefs ?? []),
      JSON.stringify(p.emotional_trends ?? []),
      p.id
    );
  }
}

// ─── Journeys ──────────────────────────────────────────────────────────────────
export function getJourneys(): Journey[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM journeys').all() as Record<string, unknown>[];
  return rows.map(r => ({
    id: r.id as string,
    category: r.category as string,
    icon: r.icon as string,
    title: r.title as string,
    currentState: r.currentState as string,
    vision: r.vision as string,
    milestones: (parseJson(r.milestones as string, []) as string[]).map((text, i) => ({
      id: `m_${i}`, text, completed: false
    })),
    memories: parseJson(r.memories as string, []),
    lessons: parseJson(r.lessons as string, []),
    progress: r.progress as number,
    timeline: parseJson(r.timeline as string, []),
  }));
}

export function saveJourney(j: Partial<Journey>): void {
  const db = getDb();
  const milestoneTexts = (j.milestones ?? []).map(m => m.text);
  db.prepare(`UPDATE journeys SET
    currentState=?, vision=?, milestones=?, memories=?, lessons=?, progress=?, timeline=?
    WHERE id=?`).run(
    j.currentState, j.vision,
    JSON.stringify(milestoneTexts),
    JSON.stringify(j.memories ?? []),
    JSON.stringify(j.lessons ?? []),
    j.progress,
    JSON.stringify(j.timeline ?? []),
    j.id
  );
}

// ─── Library ───────────────────────────────────────────────────────────────────
export function getLibrary(): LibraryItem[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM library ORDER BY dateAdded DESC').all() as Record<string, unknown>[];
  return rows.map(r => ({
    id: r.id as string,
    type: r.type as string,
    title: r.title as string,
    author: r.author as string,
    content: r.content as string,
    dateAdded: r.dateAdded as string,
    tags: parseJson(r.tags as string, []),
  }));
}

// ─── Chats ─────────────────────────────────────────────────────────────────────
export function getChats(limit = 50): ChatMessage[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM chats ORDER BY time DESC LIMIT ?').all(limit) as Record<string, unknown>[];
  return rows.reverse().map(r => ({
    id: r.id as string,
    sender: r.sender as 'william' | 'user',
    text: r.text as string,
    time: r.time as string,
  }));
}

export function saveChat(msg: ChatMessage): void {
  const db = getDb();
  db.prepare('INSERT OR REPLACE INTO chats (id, sender, text, time, session) VALUES (?, ?, ?, ?, ?)')
    .run(msg.id, msg.sender, msg.text, msg.time, 'default');
}

// ─── World Model ───────────────────────────────────────────────────────────────
export function getWorldModel(): { nodes: MemoryNode[]; edges: MemoryEdge[] } {
  const db = getDb();
  const nodes = db.prepare('SELECT * FROM memory_nodes ORDER BY last_updated DESC LIMIT 60').all() as Record<string, unknown>[];
  const edges = db.prepare('SELECT * FROM memory_edges').all() as Record<string, unknown>[];
  return {
    nodes: nodes.map(n => ({
      id: n.id as string,
      type: n.type as string,
      label: n.label as string,
      description: n.description as string,
      confidence: n.confidence as number,
      last_updated: n.last_updated as string,
      metadata: parseJson(n.metadata as string, {}),
    })),
    edges: edges.map(e => ({
      id: e.id as string,
      from_id: e.from_id as string,
      to_id: e.to_id as string,
      relation: e.relation as string,
      strength: e.strength as number,
      created_at: e.created_at as string,
    })),
  };
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}
