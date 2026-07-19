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

  // Initialize schemas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS portrait (
      id TEXT PRIMARY KEY,
      name TEXT,
      identity TEXT,
      values TEXT,
      principles TEXT,
      strengths TEXT,
      blind_spots TEXT,
      dreams TEXT,
      relationships TEXT,
      decision_patterns TEXT, -- JSON array
      growth TEXT             -- JSON array
    );

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
  `);

  return db;
}
