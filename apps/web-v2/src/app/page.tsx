'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, sendChat } from '@/lib/api';
import type { Portrait, Journey, LibraryItem, ChatMessage, WorldModel } from '@/lib/types';

// Components
import { AppHeader } from '@/components/AppHeader';
import { AppSidebar } from '@/components/AppSidebar';
import { CompanionView } from '@/components/CompanionView';
import { PortraitView } from '@/components/PortraitView';
import { JourneysView } from '@/components/JourneysView';
import { LibraryView } from '@/components/LibraryView';
import { WorldView } from '@/components/WorldView';
import { SettingsView } from '@/components/SettingsView';
import { FocusMode } from '@/components/FocusMode';

export type NavTab = 'companion' | 'portrait' | 'journeys' | 'library' | 'world' | 'settings';

interface AppData {
  portrait: Portrait | null;
  journeys: Journey[];
  library: LibraryItem[];
  recentChats: ChatMessage[];
}

export default function Home() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeTab, setActiveTab] = useState<NavTab>('companion');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [data, setData] = useState<AppData>({ portrait: null, journeys: [], library: [], recentChats: [] });
  const [worldModel, setWorldModel] = useState<WorldModel | null>(null);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [lastReply, setLastReply] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load initial data
  useEffect(() => {
    apiFetch<AppData>('/api/data').then(d => {
      if (d) {
        setData(d);
        setMessages(d.recentChats);
        // Trigger greeting
        sendChat('__GREETING__').then(reply => setLastReply(reply));
      }
      setLoading(false);
    });
  }, []);

  // Load world model when needed
  const loadWorldModel = useCallback(() => {
    if (!worldModel) {
      apiFetch<WorldModel>('/api/world-model').then(d => d && setWorldModel(d));
    }
  }, [worldModel]);

  const handleSendChat = useCallback(async () => {
    if (!chatInput.trim() || isSending) return;
    const text = chatInput.trim();
    setChatInput('');
    setIsSending(true);

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text, time: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);

    const reply = await sendChat(text);
    const willMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'william', text: reply, time: new Date().toISOString() };
    setMessages(prev => [...prev, willMsg]);
    setLastReply(reply);
    setIsSending(false);
  }, [chatInput, isSending]);

  const handleOpenFocus = useCallback(() => {
    loadWorldModel();
    setIsFocusMode(true);
  }, [loadWorldModel]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-page)', color: 'var(--text-muted)', fontSize: 13 }}>
        Loading William…
      </div>
    );
  }

  return (
    <>
      {/* Focus Mode overlay */}
      <AnimatePresence>
        {isFocusMode && (
          <FocusMode
            portrait={data.portrait}
            worldModel={worldModel}
            messages={messages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSend={handleSendChat}
            isSending={isSending}
            onClose={() => setIsFocusMode(false)}
            onRefreshWorld={() => apiFetch<WorldModel>('/api/world-model').then(d => d && setWorldModel(d))}
          />
        )}
      </AnimatePresence>

      {/* Main App Shell */}
      <div className="app-shell">
        <AppHeader
          theme={theme}
          onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          onOpenFocus={handleOpenFocus}
        />

        <div className="app-body">
          <AppSidebar activeTab={activeTab} onNav={setActiveTab} />

          <main className="app-main">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                style={{ minHeight: '100%' }}
              >
                {activeTab === 'companion' && (
                  <CompanionView
                    portrait={data.portrait}
                    lastReply={lastReply}
                    messages={messages}
                    chatInput={chatInput}
                    setChatInput={setChatInput}
                    onSend={handleSendChat}
                    isSending={isSending}
                    onOpenFocus={handleOpenFocus}
                  />
                )}
                {activeTab === 'portrait' && <PortraitView portrait={data.portrait} />}
                {activeTab === 'journeys' && (
                  <JourneysView
                    journeys={data.journeys}
                    onUpdate={journeys => setData(d => ({ ...d, journeys }))}
                  />
                )}
                {activeTab === 'library' && <LibraryView items={data.library} />}
                {activeTab === 'world' && (
                  <WorldView
                    worldModel={worldModel}
                    onLoad={loadWorldModel}
                    onOpenFocus={handleOpenFocus}
                  />
                )}
                {activeTab === 'settings' && (
                  <SettingsView portrait={data.portrait} theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
                )}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </>
  );
}
