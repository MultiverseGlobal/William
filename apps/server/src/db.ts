import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) return db;

  const dbPath = path.resolve(__dirname, '../../william.db');
  
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Initialize core schemas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS portrait (
      id TEXT PRIMARY KEY,
      name TEXT,
      identity TEXT,
      "values" TEXT,
      principles TEXT,
      strengths TEXT,
      blind_spots TEXT,
      dreams TEXT,
      relationships TEXT,
      decision_patterns TEXT, -- JSON array
      growth TEXT,            -- JSON array
      cognitive_profile TEXT, -- JSON object
      active_beliefs TEXT     -- JSON array
    );
  `);

  // Self-healing migrations for existing database files
  const portraitColumns = [
    'cognitive_profile TEXT',
    'active_beliefs TEXT',
    'emotional_trends TEXT',
    'behavioral_patterns TEXT',
    'identity_evolution TEXT',
  ];
  for (const col of portraitColumns) {
    try { await db.exec(`ALTER TABLE portrait ADD COLUMN ${col};`); } catch (_) {}
  }

  await db.exec(`
    CREATE TABLE IF NOT EXISTS journeys (
      id TEXT PRIMARY KEY,
      category TEXT,
      icon TEXT,
      title TEXT,
      currentState TEXT,
      vision TEXT,
      milestones TEXT,        -- JSON array
      memories TEXT,          -- JSON array
      lessons TEXT,           -- JSON array
      progress INTEGER,
      timeline TEXT           -- JSON array of { date, text }
    );

    CREATE TABLE IF NOT EXISTS library (
      id TEXT PRIMARY KEY,
      type TEXT,
      title TEXT,
      author TEXT,
      content TEXT,
      dateAdded TEXT,
      tags TEXT               -- JSON array
    );

    CREATE TABLE IF NOT EXISTS chronicle (
      id TEXT PRIMARY KEY,
      time TEXT,
      category TEXT,
      text TEXT
    );

    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      sender TEXT,
      text TEXT,
      time TEXT,
      session TEXT
    );

    -- Knowledge Graph
    CREATE TABLE IF NOT EXISTS memory_nodes (
      id TEXT PRIMARY KEY,
      type TEXT,              -- MemoryNodeType
      label TEXT,
      description TEXT,
      confidence REAL DEFAULT 1.0,
      last_updated TEXT,
      metadata TEXT           -- JSON object
    );

    CREATE TABLE IF NOT EXISTS memory_edges (
      id TEXT PRIMARY KEY,
      from_id TEXT,
      to_id TEXT,
      relation TEXT,          -- MemoryRelation
      strength REAL DEFAULT 1.0,
      created_at TEXT
    );

    -- Proactive System
    CREATE TABLE IF NOT EXISTS proactive_signals (
      id TEXT PRIMARY KEY,
      type TEXT,              -- ProactiveSignalType
      trigger_time TEXT,
      message TEXT,
      acknowledged INTEGER DEFAULT 0,
      created_at TEXT
    );

    -- Action Layer
    CREATE TABLE IF NOT EXISTS action_log (
      id TEXT PRIMARY KEY,
      action_type TEXT,       -- ActionType
      payload TEXT,           -- JSON
      status TEXT DEFAULT 'pending',
      created_at TEXT,
      executed_at TEXT,
      error TEXT
    );
  `);

  return db;
}
