import React, { useState, useEffect } from 'react';
import type { ConstitutionRule, ContextState, Integration, Portrait, Journey, LibraryItem } from '@william/types';
import { CommandPalette } from './CommandPalette';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
  initialData: {
    username: string;
    portrait: Portrait;
    journeys: Journey[];
    library: LibraryItem[];
    rules: ConstitutionRule[];
    context: Partial<ContextState>;
    integrations: Integration[];
  };
  onReset: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'william' | 'user';
  text: string;
  time: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ initialData, onReset }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [deviceType, setDeviceType] = useState<'desktop' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'home' | 'portrait' | 'journeys' | 'library' | 'settings'>('home');
  const [mobileTab, setMobileTab] = useState<'chat' | 'journey' | 'portrait' | 'today'>('today');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Core Monorepo States
  const [portrait, setPortrait] = useState<Portrait>(initialData.portrait);
  const [journeys, setJourneys] = useState<Journey[]>(initialData.journeys);
  const [library, setLibrary] = useState<LibraryItem[]>(initialData.library);

  // Conversational logs
  const [desktopChatLogs, setDesktopChatLogs] = useState<ChatMessage[]>([
    { id: 'c1', sender: 'william', text: "Welcome back. I have been keeping your place. Today, let's focus on structural growth rather than raw motivation.", time: '08:00 AM' }
  ]);
  const [mobileChatLogs, setMobileChatLogs] = useState<ChatMessage[]>([
    { id: 'mc1', sender: 'william', text: "Walk beside me. I'm here when you need to capture a thought or seek direction.", time: '02:15 PM' }
  ]);

  // Input bindings
  const [chatInput, setChatInput] = useState('');
  const [mobileChatInput, setMobileChatInput] = useState('');

  // Mobile Capturing state overlays
  const [mobileCaptureType, setMobileCaptureType] = useState<null | 'speak' | 'write' | 'capture'>(null);
  const [captureInputText, setCaptureInputText] = useState('');
  const [simWavePulse, setSimWavePulse] = useState(false);

  // Mobile Focus Tasks Checklist
  const [mobileTasks, setMobileTasks] = useState([
    { id: 'mt1', text: 'Build Atlas', completed: false },
    { id: 'mt2', text: 'Train', completed: false },
    { id: 'mt3', text: 'Call Mum', completed: false }
  ]);
  const [newMobileTaskText, setNewMobileTaskText] = useState('');

  // Selected sub-tabs / expanded details
  const [selectedJourneyId, setSelectedJourneyId] = useState<string>('j1');
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<LibraryItem | null>(null);

  // Study workspace interactive reflection dialog overlay
  const [isReflecting, setIsReflecting] = useState(false);
  const [reflectionStep, setReflectionStep] = useState(0);
  const [eveningSurprise, setEveningSurprise] = useState('');
  const [eveningBurden, setEveningBurden] = useState('');
  const [eveningAlign, setEveningAlign] = useState('');
  const [eveningRemember, setEveningRemember] = useState('');

  // Simulator controls
  const [simTimeOfDay, setSimTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('evening');
  const [simPeriod, setSimPeriod] = useState<'day1' | 'firstweek' | 'longterm'>('longterm');

  // Highlight effect trigger
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);

  const triggerHighlight = (cat: string) => {
    setHighlightedCategory(cat);
    setTimeout(() => setHighlightedCategory(null), 3000);
  };

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
        return;
      }

      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'd') {
        setDeviceType('desktop');
      } else if (key === 'm') {
        setDeviceType('mobile');
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handlePaletteAction = (actionKey: string) => {
    switch (actionKey) {
      case 'go-home':
        setActiveTab('home');
        break;
      case 'go-memory':
        setActiveTab('portrait');
        break;
      case 'go-settings':
        setActiveTab('settings');
        break;
      case 'toggle-theme':
        toggleTheme();
        break;
      case 'reset':
        onReset();
        break;
      default:
        break;
    }
  };

  // Desktop Study chat send
  const handleSendDesktopChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatInput('');

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: `duser_${Date.now()}`, sender: 'user', text: userText, time };
    setDesktopChatLogs(prev => [...prev, userMsg]);

    // Simulate William response
    setTimeout(() => {
      let reply = "I understand. Let's document this lesson in your Portrait Growth timeline.";
      if (userText.toLowerCase().includes('help') || userText.toLowerCase().includes('struggle')) {
        reply = "Acknowledged. Let's place this in your Blind Spots so we can strategy around systems instead of raw willpower.";
        setPortrait((prev: Portrait) => ({
          ...prev,
          blind_spots: prev.blind_spots ? `${prev.blind_spots} | Discussed: ${userText}` : `Discussed: ${userText}`
        }));
        triggerHighlight('blind_spots');
      } else if (userText.toLowerCase().includes('goal') || userText.toLowerCase().includes('build')) {
        reply = "Atlas systems are expanding. I've updated your Dreams roadmap.";
        setPortrait((prev: Portrait) => ({
          ...prev,
          dreams: prev.dreams ? `${prev.dreams} | ${userText}` : userText
        }));
        triggerHighlight('dreams');
      }

      setDesktopChatLogs(prev => [...prev, {
        id: `dwilliam_${Date.now()}`,
        sender: 'william',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  // Mobile Chat send
  const handleSendMobileChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileChatInput.trim()) return;

    const userText = mobileChatInput.trim();
    setMobileChatInput('');

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMobileChatLogs(prev => [...prev, { id: `muser_${Date.now()}`, sender: 'user', text: userText, time }]);

    setTimeout(() => {
      setMobileChatLogs(prev => [...prev, {
        id: `mwilliam_${Date.now()}`,
        sender: 'william',
        text: "Captured as a mobile presence update. Enjoy your day.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1000);
  };

  // Submit evening reflection from study
  const handleReflectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const summary = `Reflection surprise: ${eveningSurprise}. Burden: ${eveningBurden}. Alignment: ${eveningAlign}. Remember: ${eveningRemember}.`;
    
    // Add growth biography entry
    setPortrait((prev: Portrait) => ({
      ...prev,
      growth: [...prev.growth, `Evening reflection: ${summary}`],
      decision_patterns: [...prev.decision_patterns, `Reflected on aligning actions to patient identity.`]
    }));
    triggerHighlight('growth');
    triggerHighlight('decision_patterns');

    // Reset reflection
    setIsReflecting(false);
    setReflectionStep(0);
    setEveningSurprise('');
    setEveningBurden('');
    setEveningAlign('');
    setEveningRemember('');
  };

  // Add mobile task checklist
  const handleAddMobileTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMobileTaskText.trim()) return;

    setMobileTasks(prev => [
      ...prev,
      { id: `mt_${Date.now()}`, text: newMobileTaskText.trim(), completed: false }
    ]);
    setNewMobileTaskText('');
  };

  // Toggle mobile task completed
  const handleToggleMobileTask = (id: string) => {
    setMobileTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Mobile speech waveforms simulation
  useEffect(() => {
    let interval: number;
    if (mobileCaptureType === 'speak') {
      setSimWavePulse(true);
      interval = window.setInterval(() => {
        setSimWavePulse(prev => !prev);
      }, 500);
    }
    return () => clearInterval(interval);
  }, [mobileCaptureType]);

  // Handle mobile thought upload
  const handleMobileCaptureSave = () => {
    if (!captureInputText.trim()) return;
    const capturedText = captureInputText.trim();
    setCaptureInputText('');

    const typeLabel = mobileCaptureType === 'speak' ? 'Speech log' : mobileCaptureType === 'capture' ? 'Camera snap' : 'Note capture';
    const tag = mobileCaptureType === 'speak' ? 'audio' : mobileCaptureType === 'capture' ? 'image' : 'note';

    // Add Library item
    const newItem: LibraryItem = {
      id: `l_${Date.now()}`,
      type: 'note',
      title: `${typeLabel} - ${new Date().toLocaleDateString()}`,
      content: capturedText,
      dateAdded: 'Today',
      tags: [tag, 'mobile']
    };
    setLibrary((prev: LibraryItem[]) => [...prev, newItem]);

    // Update Portrait
    setPortrait((prev: Portrait) => ({
      ...prev,
      growth: [...prev.growth, `Captured ${tag} presence: "${capturedText.substring(0, 50)}..."`]
    }));
    triggerHighlight('growth');

    // Add journey milestone or timeline
    setJourneys((prev: Journey[]) => prev.map((j: Journey) => {
      if (j.id === 'j1') {
        return {
          ...j,
          timeline: [{ date: 'Today', text: `${typeLabel}: ${capturedText}` }, ...j.timeline]
        };
      }
      return j;
    }));

    setMobileCaptureType(null);
  };

  return (
    <div className="zen-container" style={{ justifyContent: 'flex-start', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* Ambient glass glow */}
      <div 
        className="breathing-glow-mesh"
        style={{ 
          width: '600px', 
          height: '600px',
          background: 'var(--glow-color)'
        }}
      />

      <CommandPalette 
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onAction={handlePaletteAction}
      />

      {/* TOP DESKTOP HEADER BAR (ONLY IF NOT SIMULATING NATIVE FULLSCREEN MOBILE) */}
      <nav className="zen-nav">
        <span className="zen-nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📚</span>
          <span style={{ fontWeight: 400, opacity: 0.6 }}>William /</span>
          <span style={{ fontWeight: 600 }}>{portrait.name || initialData.username}</span>
        </span>

        {deviceType === 'desktop' && (
          <div className="zen-nav-links">
            {(['home', 'portrait', 'journeys', 'library', 'settings'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setIsReflecting(false);
                }}
                className={`zen-nav-link ${activeTab === tab ? 'active' : ''}`}
                style={{ background: 'none', border: 'none', textTransform: 'capitalize' }}
              >
                {tab === 'home' ? 'Study' : tab}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* RENDER DUAL LAYOUT: DESKTOP OR MOBILE FRAME */}
      <div className="zen-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <AnimatePresence mode="wait">
          
          {/* ==================== 1. DESKTOP VIEW ==================== */}
          {deviceType === 'desktop' && (
            <motion.div
              key="desktop-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}
            >
              
              {/* Tab: Study (Home) */}
              {activeTab === 'home' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                  
                  {/* Literary Room Welcome */}
                  {!isReflecting && (
                    <div 
                      style={{ 
                        padding: '40px', 
                        border: '1px solid var(--border-hairline)', 
                        borderRadius: '16px', 
                        background: 'var(--bg-surface)',
                        boxShadow: 'var(--shadow-subtle)',
                        lineHeight: 1.8,
                        fontFamily: 'serif'
                      }}
                    >
                      <h3 style={{ fontSize: '1.625rem', fontWeight: 300, color: 'var(--text-primary)', marginBottom: '20px' }}>
                        Good {simTimeOfDay === 'morning' ? 'Morning' : simTimeOfDay === 'afternoon' ? 'Afternoon' : 'Evening'}, {portrait.name || 'Friend'}.
                      </h3>
                      
                      {simPeriod === 'longterm' && (
                        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                          You've grown in patience this month. Your work on {portrait.dreams || 'Atlas'} is beginning to compound. 
                          You seem mentally exhausted.
                        </p>
                      )}
                      {simPeriod === 'firstweek' && (
                        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                          We are gathering observations. One thoughtful inquiry a day will establish our baseline. 
                          Do not force productivity; seek to understand constraints.
                        </p>
                      )}
                      {simPeriod === 'day1' && (
                        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                          Welcome to your study. I have been keeping your place, waiting to continue the conversation about your life.
                        </p>
                      )}

                      <p style={{ fontSize: '1.125rem', color: 'var(--text-primary)', marginTop: '24px', fontWeight: 500 }}>
                        Would you like to reflect, continue yesterday's conversation, or simply talk?
                      </p>

                      <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                        <button className="zen-btn" onClick={() => setIsReflecting(true)}>
                          🧠 Reflect
                        </button>
                        <button className="zen-btn-outline" onClick={() => {
                          const chatSection = document.getElementById('strategic-chat');
                          chatSection?.scrollIntoView({ behavior: 'smooth' });
                        }}>
                          💬 Continue Yesterday's Conversation
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Evening reflection interactive block */}
                  {isReflecting && (
                    <motion.div
                      initial={{ scale: 0.98, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      style={{ 
                        padding: '32px', 
                        border: '1px solid var(--border-hairline)', 
                        borderRadius: '16px', 
                        background: 'var(--bg-surface)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '24px' 
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="zen-caption" style={{ textTransform: 'uppercase' }}>Evening Strategy Reflection</span>
                        <button className="zen-btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setIsReflecting(false)}>
                          Close
                        </button>
                      </div>

                      <form onSubmit={handleReflectionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {reflectionStep === 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>What surprised you today?</span>
                            <input 
                              type="text" 
                              className="zen-input" 
                              value={eveningSurprise} 
                              onChange={(e) => setEveningSurprise(e.target.value)} 
                              placeholder="e.g. Atlas architecture compiled on first attempt"
                              autoFocus 
                            />
                            <button type="button" className="zen-btn" style={{ marginTop: '12px' }} onClick={() => setReflectionStep(1)} disabled={!eveningSurprise.trim()}>
                              Next Question
                            </button>
                          </div>
                        )}

                        {reflectionStep === 1 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>What burden felt lighter?</span>
                            <input 
                              type="text" 
                              className="zen-input" 
                              value={eveningBurden} 
                              onChange={(e) => setEveningBurden(e.target.value)} 
                              placeholder="e.g. Delegating deployment steps"
                              autoFocus 
                            />
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                              <button type="button" className="zen-btn-outline" onClick={() => setReflectionStep(0)}>Back</button>
                              <button type="button" className="zen-btn" onClick={() => setReflectionStep(2)} disabled={!eveningBurden.trim()}>Next Question</button>
                            </div>
                          </div>
                        )}

                        {reflectionStep === 2 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Did your actions resemble the person you're becoming?</span>
                            <input 
                              type="text" 
                              className="zen-input" 
                              value={eveningAlign} 
                              onChange={(e) => setEveningAlign(e.target.value)} 
                              placeholder="e.g. Yes, maintained calm deep-work session"
                              autoFocus 
                            />
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                              <button type="button" className="zen-btn-outline" onClick={() => setReflectionStep(1)}>Back</button>
                              <button type="button" className="zen-btn" onClick={() => setReflectionStep(3)} disabled={!eveningAlign.trim()}>Next Question</button>
                            </div>
                          </div>
                        )}

                        {reflectionStep === 3 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <span style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>What deserves remembering?</span>
                            <input 
                              type="text" 
                              className="zen-input" 
                              value={eveningRemember} 
                              onChange={(e) => setEveningRemember(e.target.value)} 
                              placeholder="e.g. Quality of focus shapes the entire week"
                              autoFocus 
                            />
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                              <button type="button" className="zen-btn-outline" onClick={() => setReflectionStep(2)}>Back</button>
                              <button type="submit" className="zen-btn" disabled={!eveningRemember.trim()}>Submit Reflection</button>
                            </div>
                          </div>
                        )}
                      </form>
                    </motion.div>
                  )}

                  {/* Strategic Chat Interface (the Heart of William) */}
                  <div id="strategic-chat" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="zen-caption">Strategic Dialogue</span>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 400 }}>Conversations</h4>
                    </div>

                    <div 
                      style={{ 
                        border: '1px solid var(--border-hairline)', 
                        borderRadius: '12px', 
                        background: 'var(--bg-surface)',
                        display: 'flex',
                        flexDirection: 'column',
                        height: '420px',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Log feed */}
                      <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {desktopChatLogs.map((msg) => {
                          const isWilliam = msg.sender === 'william';
                          return (
                            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isWilliam ? 'flex-start' : 'flex-end' }}>
                              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                {isWilliam ? 'William' : 'You'} • {msg.time}
                              </span>
                              <div 
                                style={{ 
                                  color: 'var(--text-primary)', 
                                  maxWidth: '80%',
                                  lineHeight: 1.5,
                                  background: isWilliam ? 'var(--focus-glow)' : 'transparent',
                                  padding: isWilliam ? '12px 16px' : '0',
                                  borderRadius: '8px',
                                  fontFamily: isWilliam ? 'var(--font-sans)' : 'var(--font-cursive)',
                                  fontSize: isWilliam ? '0.9375rem' : '1.25rem'
                                }}
                              >
                                {msg.text}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Textbox input */}
                      <form onSubmit={handleSendDesktopChat} style={{ borderTop: '1px solid var(--border-hairline)', padding: '16px 20px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <input
                          type="text"
                          className="zen-input"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Simply talk, explore systems, or log advice..."
                          style={{ border: 'none', borderBottom: 'none', flex: 1 }}
                        />
                        <button className="zen-btn" type="submit" disabled={!chatInput.trim()}>
                          Send
                        </button>
                      </form>
                    </div>
                  </div>

                </div>
              )}

              {/* Tab: Portrait Biography */}
              {activeTab === 'portrait' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="zen-caption">A biography writing itself</span>
                    <h2 className="zen-title">The Living Portrait</h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                    
                    {/* Identity Card */}
                    <div style={{ padding: '24px', background: 'var(--bg-surface)', border: highlightedCategory === 'identity' ? '1px solid var(--accent-color)' : '1px solid var(--border-hairline)', borderRadius: '12px', transition: 'all 0.3s ease' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase' }}>Identity</span>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 300, marginTop: '8px', fontFamily: 'var(--font-cursive)' }}>
                        "{portrait.identity}"
                      </h4>
                    </div>

                    {/* Values Card */}
                    <div style={{ padding: '24px', background: 'var(--bg-surface)', border: highlightedCategory === 'values' ? '1px solid var(--accent-color)' : '1px solid var(--border-hairline)', borderRadius: '12px', transition: 'all 0.3s ease' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase' }}>Values</span>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        {portrait.values}
                      </p>
                    </div>

                    {/* Principles Card */}
                    <div style={{ padding: '24px', background: 'var(--bg-surface)', border: highlightedCategory === 'principles' ? '1px solid var(--accent-color)' : '1px solid var(--border-hairline)', borderRadius: '12px', transition: 'all 0.3s ease' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase' }}>Principles</span>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px', fontStyle: 'italic' }}>
                        "{portrait.principles}"
                      </p>
                    </div>

                    {/* Strengths Card */}
                    <div style={{ padding: '24px', background: 'var(--bg-surface)', border: highlightedCategory === 'strengths' ? '1px solid var(--accent-color)' : '1px solid var(--border-hairline)', borderRadius: '12px', transition: 'all 0.3s ease' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase' }}>Strengths</span>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        {portrait.strengths}
                      </p>
                    </div>

                    {/* Blind Spots Card */}
                    <div style={{ padding: '24px', background: 'var(--bg-surface)', border: highlightedCategory === 'blind_spots' ? '1px solid var(--accent-color)' : '1px solid var(--border-hairline)', borderRadius: '12px', transition: 'all 0.3s ease' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase' }}>Blind Spots & Fears</span>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        {portrait.blind_spots}
                      </p>
                    </div>

                    {/* Dreams Card */}
                    <div style={{ padding: '24px', background: 'var(--bg-surface)', border: highlightedCategory === 'dreams' ? '1px solid var(--accent-color)' : '1px solid var(--border-hairline)', borderRadius: '12px', transition: 'all 0.3s ease' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase' }}>Dreams & Builds</span>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        {portrait.dreams}
                      </p>
                    </div>

                    {/* Relationships Card */}
                    <div style={{ padding: '24px', background: 'var(--bg-surface)', border: highlightedCategory === 'relationships' ? '1px solid var(--accent-color)' : '1px solid var(--border-hairline)', borderRadius: '12px', transition: 'all 0.3s ease' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase' }}>Relationships</span>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                        {portrait.relationships}
                      </p>
                    </div>

                    {/* Decision Patterns Card */}
                    <div style={{ padding: '24px', background: 'var(--bg-surface)', border: highlightedCategory === 'decision_patterns' ? '1px solid var(--accent-color)' : '1px solid var(--border-hairline)', borderRadius: '12px', transition: 'all 0.3s ease', gridColumn: '1 / -1' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase' }}>Decision Patterns</span>
                      <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {portrait.decision_patterns.map((item, idx) => (
                          <li key={idx} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Biography Growth entries */}
                    <div style={{ padding: '24px', background: 'var(--bg-surface)', border: highlightedCategory === 'growth' ? '1px solid var(--accent-color)' : '1px solid var(--border-hairline)', borderRadius: '12px', transition: 'all 0.3s ease', gridColumn: '1 / -1' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase' }}>Growth Milestones Log</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                        {portrait.growth.map((logItem, idx) => (
                          <div key={idx} style={{ fontSize: '0.875rem', borderLeft: '2px solid var(--border-hairline)', paddingLeft: '12px', color: 'var(--text-secondary)' }}>
                            {logItem}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Tab: Journeys */}
              {activeTab === 'journeys' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="zen-caption">Commitments & Pathways</span>
                    <h2 className="zen-title">Your Journeys</h2>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                    {journeys.map((j) => (
                      <button
                        key={j.id}
                        onClick={() => setSelectedJourneyId(j.id)}
                        className={`zen-btn-outline ${selectedJourneyId === j.id ? 'selected' : ''}`}
                        style={{
                          padding: '8px 18px',
                          borderRadius: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          borderColor: selectedJourneyId === j.id ? 'var(--text-primary)' : 'var(--border-hairline)'
                        }}
                      >
                        <span>{j.icon}</span>
                        <span>{j.title}</span>
                      </button>
                    ))}
                  </div>

                  {/* Journey Expanded Detail */}
                  {(() => {
                    const activeJourney = journeys.find(j => j.id === selectedJourneyId);
                    if (!activeJourney) return null;

                    return (
                      <div 
                        style={{ 
                          padding: '32px', 
                          border: '1px solid var(--border-hairline)', 
                          borderRadius: '16px', 
                          background: 'var(--bg-surface)', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '24px' 
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ fontSize: '1.5rem', fontWeight: 300, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>{activeJourney.icon}</span>
                            <span>{activeJourney.title}</span>
                          </h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className="zen-caption">Progress:</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{activeJourney.progress}%</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ width: '100%', height: '4px', background: 'var(--border-hairline)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${activeJourney.progress}%`, height: '100%', background: 'var(--text-primary)' }} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                          <div>
                            <span className="zen-caption">Current State</span>
                            <p style={{ fontSize: '0.9375rem', marginTop: '6px', color: 'var(--text-secondary)' }}>{activeJourney.currentState}</p>
                          </div>
                          <div>
                            <span className="zen-caption">Vision</span>
                            <p style={{ fontSize: '0.9375rem', marginTop: '6px', color: 'var(--text-secondary)' }}>{activeJourney.vision}</p>
                          </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border-hairline)' }} />

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                          <div>
                            <span className="zen-caption">Milestones</span>
                            <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {activeJourney.milestones.map((m, idx) => (
                                <li key={idx} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>• {m}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="zen-caption">Lessons Learnt</span>
                            <ul style={{ listStyle: 'none', padding: 0, marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {activeJourney.lessons.map((l, idx) => (
                                <li key={idx} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>• {l}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border-hairline)' }} />

                        <div>
                          <span className="zen-caption">Journey Timeline log</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                            {activeJourney.timeline.map((item, idx) => (
                              <div key={idx} style={{ display: 'flex', gap: '16px', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-muted)', width: '60px', flexShrink: 0 }}>{item.date}</span>
                                <span style={{ color: 'var(--text-secondary)' }}>{item.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Tab: Library */}
              {activeTab === 'library' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="zen-caption">Acquired wisdom, notes & quotes</span>
                    <h2 className="zen-title">The Library</h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    {library.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedLibraryItem(item)}
                        style={{
                          padding: '20px',
                          background: 'var(--bg-surface)',
                          border: '1px solid var(--border-hairline)',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          boxShadow: 'var(--shadow-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.625rem' }}>
                            {item.type}
                          </span>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{item.dateAdded}</span>
                        </div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                          {item.title}
                        </h4>
                        {item.author && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>By {item.author}</span>}
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          "{item.content}"
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Detail Overlay Modal */}
                  {selectedLibraryItem && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}>
                      <div 
                        style={{ 
                          width: '90%', 
                          maxWidth: '480px', 
                          background: 'var(--bg-surface)', 
                          border: '1px solid var(--border-hairline)', 
                          borderRadius: '16px', 
                          padding: '32px',
                          boxShadow: 'var(--shadow-subtle)' 
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignSelf: 'stretch', marginBottom: '16px' }}>
                          <span className="zen-caption" style={{ textTransform: 'uppercase' }}>{selectedLibraryItem.type}</span>
                          <button className="zen-btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setSelectedLibraryItem(null)}>
                            Close
                          </button>
                        </div>
                        <h3 style={{ fontSize: '1.375rem', fontWeight: 400, marginBottom: '4px' }}>{selectedLibraryItem.title}</h3>
                        {selectedLibraryItem.author && <h5 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>By {selectedLibraryItem.author}</h5>}
                        <p style={{ fontSize: '1rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.6, padding: '16px 0', borderTop: '1px solid var(--border-hairline)', borderBottom: '1px solid var(--border-hairline)', marginBottom: '16px' }}>
                          "{selectedLibraryItem.content}"
                        </p>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {selectedLibraryItem.tags.map(t => (
                            <span key={t} style={{ fontSize: '0.6875rem', background: 'var(--focus-glow)', border: '1px solid var(--border-hairline)', padding: '2px 8px', borderRadius: '12px' }}>
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Tab: Settings */}
              {activeTab === 'settings' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className="zen-caption">Configurations</span>
                    <h2 className="zen-title">Settings</h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 500 }}>Dark Theme</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Toggle matte carbon layout.</div>
                      </div>
                      <label className="ios-switch" style={{ width: '42px', height: '24px' }}>
                        <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                        <span className="ios-slider-toggle" style={{ borderRadius: '24px' }}></span>
                      </label>
                    </div>
                    <div style={{ marginTop: '12px' }}>
                      <button className="zen-btn-outline" onClick={onReset} style={{ color: '#ef4444', borderColor: '#fca5a5', width: '100%' }}>
                        Reset Companion Study
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}

          {/* ==================== 2. MOBILE VIEW (COMPANION FRAME) ==================== */}
          {deviceType === 'mobile' && (
            <motion.div
              key="mobile-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                width: '320px',
                height: '620px',
                border: '12px solid #27272a',
                borderRadius: '40px',
                background: '#09090b',
                color: '#f4f4f5',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
              }}
            >
              
              {/* Phone Status bar mock */}
              <div style={{ height: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px', fontSize: '0.6875rem', opacity: 0.6, borderBottom: '1px solid #18181b' }}>
                <span>02:30 PM</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span>📶</span>
                  <span>🔋 94%</span>
                </div>
              </div>

              {/* Phone Content Screen */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '70px' }}>
                
                {/* 1. Mobile Screen: Today (Home) */}
                {mobileTab === 'today' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                      <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#a1a1aa' }}>Good afternoon.</span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 300 }}>What's on your mind?</h3>
                    </div>

                    {/* 3 Giant Action Capture Buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setMobileCaptureType('speak')} 
                        style={{ flex: 1, height: '72px', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#ffffff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <span style={{ fontSize: '1.375rem' }}>🎤</span>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 500 }}>Speak</span>
                      </button>
                      <button 
                        onClick={() => setMobileCaptureType('write')} 
                        style={{ flex: 1, height: '72px', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#ffffff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <span style={{ fontSize: '1.375rem' }}>⌨️</span>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 500 }}>Write</span>
                      </button>
                      <button 
                        onClick={() => setMobileCaptureType('capture')} 
                        style={{ flex: 1, height: '72px', background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', color: '#ffffff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        <span style={{ fontSize: '1.375rem' }}>📷</span>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 500 }}>Capture</span>
                      </button>
                    </div>

                    {/* Today's Focus Checklist */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                      <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#a1a1aa' }}>Today's Focus</span>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {mobileTasks.map(task => (
                          <div 
                            key={task.id} 
                            onClick={() => handleToggleMobileTask(task.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.875rem', cursor: 'pointer', opacity: task.completed ? 0.4 : 1 }}
                          >
                            <div style={{ width: '16px', height: '16px', border: '1px solid #27272a', borderRadius: '4px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', fontSize: '10px', background: task.completed ? '#ffffff' : 'transparent', color: '#09090b' }}>
                              {task.completed && '✓'}
                            </div>
                            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>{task.text}</span>
                          </div>
                        ))}
                      </div>

                      {/* Add Focus task */}
                      <form onSubmit={handleAddMobileTask} style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                        <input
                          type="text"
                          value={newMobileTaskText}
                          onChange={(e) => setNewMobileTaskText(e.target.value)}
                          placeholder="Add focus item..."
                          style={{ background: 'transparent', border: 'none', borderBottom: '1px solid #27272a', color: '#ffffff', fontSize: '0.8125rem', padding: '4px 0', flex: 1, outline: 'none' }}
                        />
                        <button type="submit" style={{ background: '#ffffff', color: '#09090b', border: 'none', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                          Add
                        </button>
                      </form>
                    </div>

                  </div>
                )}

                {/* 2. Mobile Screen: Chat with William */}
                {mobileTab === 'chat' && (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '12px' }}>
                    <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#a1a1aa' }}>Conversation with William</span>
                    
                    {/* Log window */}
                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '360px', paddingRight: '4px' }}>
                      {mobileChatLogs.map(msg => (
                        <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'william' ? 'flex-start' : 'flex-end' }}>
                          <span style={{ fontSize: '0.625rem', color: '#71717a' }}>{msg.sender === 'william' ? 'William' : 'You'}</span>
                          <div 
                            style={{ 
                              lineHeight: 1.4, 
                              color: '#f4f4f5', 
                              background: msg.sender === 'william' ? '#18181b' : 'transparent',
                              padding: msg.sender === 'william' ? '8px 12px' : '0',
                              borderRadius: '8px',
                              fontFamily: msg.sender === 'william' ? 'var(--font-sans)' : 'var(--font-cursive)',
                              fontSize: msg.sender === 'william' ? '0.8125rem' : '1.125rem'
                            }}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input box */}
                    <form onSubmit={handleSendMobileChat} style={{ display: 'flex', gap: '6px', borderTop: '1px solid #18181b', paddingTop: '10px' }}>
                      <input
                        type="text"
                        placeholder="Say anything..."
                        value={mobileChatInput}
                        onChange={(e) => setMobileChatInput(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: '#ffffff', fontSize: '0.8125rem', outline: 'none', flex: 1 }}
                      />
                      <button type="submit" style={{ background: '#ffffff', color: '#09090b', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem' }}>
                        Send
                      </button>
                    </form>
                  </div>
                )}

                {/* 3. Mobile Screen: Journey tracks */}
                {mobileTab === 'journey' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#a1a1aa' }}>Active Journeys</span>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {journeys.map(j => (
                        <div key={j.id} style={{ padding: '12px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.25rem' }}>{j.icon}</span>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{j.title}</span>
                              <span style={{ fontSize: '0.625rem', color: '#a1a1aa' }}>{j.currentState.substring(0, 30)}...</span>
                            </div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{j.progress}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Mobile Screen: Portrait */}
                {mobileTab === 'portrait' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: '#a1a1aa' }}>Biography Draft</span>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ padding: '12px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.625rem', color: '#71717a', textTransform: 'uppercase' }}>Identity</span>
                        <p style={{ fontFamily: 'var(--font-cursive)', marginTop: '4px', fontSize: '1rem' }}>"{portrait.identity}"</p>
                      </div>
                      <div style={{ padding: '12px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.625rem', color: '#71717a', textTransform: 'uppercase' }}>Principles</span>
                        <p style={{ fontSize: '0.8125rem', marginTop: '4px' }}>{portrait.principles}</p>
                      </div>
                      <div style={{ padding: '12px', background: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.625rem', color: '#71717a', textTransform: 'uppercase' }}>Struggles & Burdens</span>
                        <p style={{ fontSize: '0.8125rem', marginTop: '4px', fontStyle: 'italic' }}>{portrait.blind_spots}</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Mobile Overlay capture views */}
              {mobileCaptureType !== null && (
                <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(9,9,11,0.95)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#71717a', textAlign: 'center' }}>
                    {mobileCaptureType === 'speak' ? 'Speech Capture' : mobileCaptureType === 'capture' ? 'Camera Capture' : 'Quick Capture'}
                  </span>

                  {mobileCaptureType === 'speak' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      {/* Simulating pulsing voice waveform */}
                      <div style={{ display: 'flex', gap: '4px', height: '40px', alignItems: 'center' }}>
                        {[...Array(6)].map((_, i) => (
                          <motion.div 
                            key={i}
                            animate={{ height: simWavePulse ? [10, 36, 10] : [10, 15, 10] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                            style={{ width: '4px', background: '#ffffff', borderRadius: '2px' }}
                          />
                        ))}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>William is listening...</span>
                    </div>
                  )}

                  {mobileCaptureType === 'capture' && (
                    <div style={{ width: '100%', height: '140px', border: '1px dashed #27272a', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#18181b' }}>
                      <span style={{ fontSize: '1.75rem' }}>📷</span>
                      <span style={{ fontSize: '0.6875rem', color: '#a1a1aa' }}>Pulsing camera frame overlay</span>
                    </div>
                  )}

                  <textarea
                    rows={3}
                    style={{ background: 'transparent', border: '1px solid #27272a', borderRadius: '8px', color: '#ffffff', padding: '10px', outline: 'none', resize: 'none', fontSize: '0.8125rem' }}
                    placeholder={
                      mobileCaptureType === 'speak' 
                        ? "Transcribed thought will appear here..." 
                        : mobileCaptureType === 'capture'
                        ? "Describe this photo captured..."
                        : "Write down your immediate thought or feeling..."
                    }
                    value={captureInputText}
                    onChange={(e) => setCaptureInputText(e.target.value)}
                  />

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => { setMobileCaptureType(null); setCaptureInputText(''); }} style={{ flex: 1, padding: '8px 0', background: 'transparent', border: '1px solid #27272a', borderRadius: '6px', color: '#ffffff', cursor: 'pointer', fontSize: '0.75rem' }}>
                      Cancel
                    </button>
                    <button onClick={handleMobileCaptureSave} disabled={!captureInputText.trim()} style={{ flex: 1, padding: '8px 0', background: '#ffffff', border: 'none', borderRadius: '6px', color: '#09090b', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                      Store
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Navigation Mock */}
              <div style={{ position: 'absolute', bottom: 0, insetInline: 0, height: 50, background: '#18181b', borderTop: '1px solid #27272a', display: 'flex', zIndex: 10 }}>
                <button onClick={() => setMobileTab('chat')} style={{ flex: 1, background: 'transparent', border: 'none', color: mobileTab === 'chat' ? '#ffffff' : '#71717a', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '1rem' }}>💬</span>
                  <span style={{ fontSize: '0.5625rem' }}>William</span>
                </button>
                <button onClick={() => setMobileTab('journey')} style={{ flex: 1, background: 'transparent', border: 'none', color: mobileTab === 'journey' ? '#ffffff' : '#71717a', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '1rem' }}>🧭</span>
                  <span style={{ fontSize: '0.5625rem' }}>Journey</span>
                </button>
                <button onClick={() => setMobileTab('portrait')} style={{ flex: 1, background: 'transparent', border: 'none', color: mobileTab === 'portrait' ? '#ffffff' : '#71717a', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '1rem' }}>📖</span>
                  <span style={{ fontSize: '0.5625rem' }}>Portrait</span>
                </button>
                <button onClick={() => setMobileTab('today')} style={{ flex: 1, background: 'transparent', border: 'none', color: mobileTab === 'today' ? '#ffffff' : '#71717a', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                  <span style={{ fontSize: '1rem' }}>⚡</span>
                  <span style={{ fontSize: '0.5625rem' }}>Today</span>
                </button>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Floating Simulation Panel widget (Demonstrator widget) */}
      <div 
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 500,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-hairline)',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: 'var(--shadow-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxWidth: '300px',
          backdropFilter: 'blur(10px)'
        }}
      >
        <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          Simulation Dashboard
        </span>

        {/* Device toggle */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Choose Interface Perspective:</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => setDeviceType('desktop')}
              style={{
                flex: 1,
                fontSize: '0.6875rem',
                padding: '6px 0',
                borderRadius: '4px',
                border: '1px solid var(--border-hairline)',
                background: deviceType === 'desktop' ? 'var(--text-primary)' : 'transparent',
                color: deviceType === 'desktop' ? 'var(--bg-surface)' : 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              🖥️ Desktop Study
            </button>
            <button
              onClick={() => setDeviceType('mobile')}
              style={{
                flex: 1,
                fontSize: '0.6875rem',
                padding: '6px 0',
                borderRadius: '4px',
                border: '1px solid var(--border-hairline)',
                background: deviceType === 'mobile' ? 'var(--text-primary)' : 'transparent',
                color: deviceType === 'mobile' ? 'var(--bg-surface)' : 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              📱 Mobile Walk
            </button>
          </div>
        </div>

        {/* Time of Day Control */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Simulate Time of Day:</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['morning', 'afternoon', 'evening'] as const).map(t => (
              <button
                key={t}
                onClick={() => setSimTimeOfDay(t)}
                style={{
                  flex: 1,
                  fontSize: '0.625rem',
                  padding: '4px 0',
                  borderRadius: '4px',
                  border: '1px solid var(--border-hairline)',
                  background: simTimeOfDay === t ? 'var(--text-primary)' : 'transparent',
                  color: simTimeOfDay === t ? 'var(--bg-surface)' : 'var(--text-primary)',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Period control */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)' }}>Choose Chronological Stage:</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['day1', 'firstweek', 'longterm'] as const).map(p => (
              <button
                key={p}
                onClick={() => setSimPeriod(p)}
                style={{
                  flex: 1,
                  fontSize: '0.625rem',
                  padding: '4px 0',
                  borderRadius: '4px',
                  border: '1px solid var(--border-hairline)',
                  background: simPeriod === p ? 'var(--text-primary)' : 'transparent',
                  color: simPeriod === p ? 'var(--bg-surface)' : 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                {p === 'day1' ? 'Day 1' : p === 'firstweek' ? 'Week 1' : '6 Months'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-hairline)', paddingTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Shortcut keys:</span>
          <span>[D] Desktop • [M] Mobile</span>
        </div>
      </div>

    </div>
  );
};
