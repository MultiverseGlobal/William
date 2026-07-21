'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PaperPlaneTilt } from '@phosphor-icons/react';
import type { Portrait, ChatMessage } from '@/lib/types';
import { CognitiveOrb } from './CognitiveOrb';

interface Props {
  portrait: Portrait | null;
  lastReply: string;
  messages: ChatMessage[];
  chatInput: string;
  setChatInput: (v: string) => void;
  onSend: () => void;
  isSending: boolean;
  onOpenFocus: () => void;
}

export function CompanionView({
  portrait,
  lastReply,
  messages,
  chatInput,
  setChatInput,
  onSend,
  isSending,
  onOpenFocus,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); }
  };

  const williamMessages = messages.filter(m => m.sender === 'william');
  const displayReply = lastReply || (williamMessages.at(-1)?.text ?? '');

  return (
    <div style={{ height: 'calc(100vh - var(--header-h))', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Central orb — clickable to open focus mode */}
      <div
        onClick={onOpenFocus}
        style={{
          flex: 1,
          position: 'relative',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0,
        }}
        title="Enter Focus Mode"
      >
        {/* Orb canvas */}
        <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, opacity: 0.8 }}>
          <CognitiveOrb worldModel={null} isCompact />
        </div>

        {/* Dialogue text — centered over orb */}
        {displayReply && (
          <motion.div
            key={displayReply}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: 480,
              padding: '0 32px',
              textAlign: 'center',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 18,
              fontStyle: 'italic',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              fontWeight: 400,
            }}>
              {displayReply}
            </p>
            {portrait?.name && (
              <p style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                William · {portrait.name}
              </p>
            )}
          </motion.div>
        )}

        {/* Hover hint */}
        <div style={{
          position: 'absolute',
          bottom: 80,
          fontSize: 11,
          color: 'var(--text-muted)',
          letterSpacing: '0.05em',
          zIndex: 2,
          opacity: 0.7,
        }}>
          Click to enter Focus Mode
        </div>
      </div>

      {/* Floating input bar */}
      <div className="floating-bar-wrapper" style={{ left: 'var(--sidebar-w)' }}>
        <div className="floating-bar" onClick={e => e.stopPropagation()}>
          <input
            ref={inputRef}
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tell William something…"
            disabled={isSending}
          />
          <button
            className="floating-bar-send"
            onClick={onSend}
            disabled={isSending || !chatInput.trim()}
            aria-label="Send"
          >
            <PaperPlaneTilt size={15} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}
