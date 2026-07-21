'use client';

import type { LibraryItem } from '@/lib/types';
import { BookOpen, Lightbulb, Notepad, File } from '@phosphor-icons/react';

const TYPE_ICON: Record<string, React.ElementType> = {
  lesson: BookOpen,
  idea:   Lightbulb,
  note:   Notepad,
};

const TYPE_COLOR: Record<string, string> = {
  lesson: '#6366f1',
  idea:   '#f59e0b',
  note:   '#10b981',
};

interface Props { items: LibraryItem[]; }

export function LibraryView({ items }: Props) {
  return (
    <div className="page-content">
      <h1 className="page-title">Library</h1>
      <p className="page-subtitle">Everything William has preserved — lessons, ideas, notes.</p>

      {items.length === 0 && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Your library is empty.</p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {items.map(item => {
          const Icon = TYPE_ICON[item.type] ?? File;
          const color = TYPE_COLOR[item.type] ?? '#71717a';
          return (
            <div key={item.id} className="card" style={{ cursor: 'default' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                  background: `${color}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color,
                }}>
                  <Icon size={16} weight="duotone" />
                </div>
                <span className="badge">{item.type}</span>
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{item.title}</h3>
              <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14 }}>{item.content}</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {item.tags.map(tag => (
                  <span key={tag} className="badge" style={{ fontSize: 10 }}>{tag}</span>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 12 }}>{item.dateAdded}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
