import React, { useState, useEffect } from 'react';
import type { ConstitutionRule, ContextState, Integration } from '@william/types';
import { CommandPalette } from './CommandPalette';
import { GoalConstellation } from './GoalConstellation';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
  initialData: {
    username: string;
    profile: { name: string; role: string; avatar: string };
    rules: ConstitutionRule[];
    context: Partial<ContextState>;
    integrations: Integration[];
  };
  onReset: () => void;
}

interface MissionTask {
  id: string;
  text: string;
  completed: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ initialData, onReset }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState<'home' | 'timeline' | 'memory' | 'settings'>('home');
  
  // Chief of Staff states
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  
  // Goals loaded from onboarding
  const dominantObjective = initialData.context.goals?.[0] || 'Acquire first 3 clients';
  
  // The daily authoritative directive
  const defaultDirective = "Today's directive: Founder outreach is your focus. The gym moves to 7:30 PM. Notifications are silenced until 2 PM. No feature work until you've contacted 15 founders.";
  const [directive, setDirective] = useState<string>(defaultDirective);

  // Checklists for missions
  const [missions, setMissions] = useState<MissionTask[]>([
    { id: 'm1', text: 'Research 20 founders.', completed: false },
    { id: 'm2', text: 'Send 15 messages.', completed: false },
    { id: 'm3', text: 'Book 1 discovery call.', completed: false }
  ]);

  // Evening Reflection states
  const [reflectionAnswer, setReflectionAnswer] = useState<'yes' | 'no' | 'partly' | null>(null);
  const [reflectionWhy, setReflectionWhy] = useState('');
  const [showReflectionCard, setShowReflectionCard] = useState(false);

  // History timeline logs
  const [historyLogs, setHistoryLogs] = useState<Array<{ id: string; time: string; text: string }>>([
    { id: 'h1', time: '08:00 AM', text: 'William auto briefing compiled.' },
    { id: 'h2', time: 'Yesterday', text: 'Completed initial workspace setup configuration.' }
  ]);

  // Constitution rules toggles
  const [rules, setRules] = useState<ConstitutionRule[]>(initialData.rules);

  // Calculate completion percentage to scale the breathing ambient glow
  const completedCount = missions.filter(m => m.completed).length;
  const totalCount = missions.length;
  const completionRatio = totalCount > 0 ? completedCount / totalCount : 0;
  
  // Glow size goes from 280px (0% complete) to 700px (100% complete)
  const glowSize = 280 + completionRatio * 420;

  // Keyboard shortcut listener for Ctrl+K / Cmd+K and sequential navigation keys
  useEffect(() => {
    let keyBuffer = '';
    let bufferTimeout: number;

    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Toggle Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
        return;
      }

      // Skip sequential keyboard hooks if user is typing
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      keyBuffer += e.key.toLowerCase();
      window.clearTimeout(bufferTimeout);
      
      bufferTimeout = window.setTimeout(() => {
        keyBuffer = '';
      }, 800); // 800ms gap

      if (keyBuffer === 'gh') {
        setActiveTab('home');
        keyBuffer = '';
      } else if (keyBuffer === 'gt') {
        setActiveTab('timeline');
        keyBuffer = '';
      } else if (keyBuffer === 'gm') {
        setActiveTab('memory');
        keyBuffer = '';
      } else if (keyBuffer === 'gs') {
        setActiveTab('settings');
        keyBuffer = '';
      } else if (keyBuffer === 'tt') {
        toggleTheme();
        keyBuffer = '';
      } else if (keyBuffer === 'rs') {
        onReset();
        keyBuffer = '';
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeys);
      window.clearTimeout(bufferTimeout);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleToggleMission = (id: string) => {
    setMissions(missions.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const handleToggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, is_active: !r.is_active } : r));
  };

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    const query = commandInput.trim();
    setCommandInput('');

    // Prepend log record
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: `h_${Date.now()}`,
      time: timestamp,
      text: `Action: Completed next focal task with update "${query}"`
    };
    setHistoryLogs([newLog, ...historyLogs]);

    // Complete current focal task
    const firstUncompletedIdx = missions.findIndex(m => !m.completed);
    if (firstUncompletedIdx !== -1) {
      const updatedMissions = [...missions];
      updatedMissions[firstUncompletedIdx].completed = true;
      setMissions(updatedMissions);

      if (updatedMissions.every(m => m.completed)) {
        setIsExecuting(false);
        setShowReflectionCard(true);
      }
    }
  };

  const handlePaletteAction = (actionKey: string) => {
    switch (actionKey) {
      case 'go-home':
        setActiveTab('home');
        setIsExecuting(false);
        break;
      case 'go-timeline':
        setActiveTab('timeline');
        break;
      case 'go-memory':
        setActiveTab('memory');
        break;
      case 'go-settings':
        setActiveTab('settings');
        break;
      case 'toggle-theme':
        toggleTheme();
        break;
      case 'complete-task':
        if (isExecuting) {
          const firstUncompletedIdx = missions.findIndex(m => !m.completed);
          if (firstUncompletedIdx !== -1) {
            const updatedMissions = [...missions];
            updatedMissions[firstUncompletedIdx].completed = true;
            setMissions(updatedMissions);
            if (updatedMissions.every(m => m.completed)) {
              setIsExecuting(false);
              setShowReflectionCard(true);
            }
          }
        } else {
          setIsExecuting(true);
        }
        break;
      case 'reset':
        onReset();
        break;
      default:
        break;
    }
  };

  const handleSubmitReflection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflectionAnswer || !reflectionWhy.trim()) return;

    const timestamp = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
    const newLog = {
      id: `ref_${Date.now()}`,
      time: timestamp,
      text: `Reflection: Day moved mission forward? ${reflectionAnswer.toUpperCase()}. "${reflectionWhy}"`
    };

    setHistoryLogs([newLog, ...historyLogs]);
    setReflectionAnswer(null);
    setReflectionWhy('');
    setShowReflectionCard(false);

    // Reset daily tasks
    setMissions(missions.map(m => ({ ...m, completed: false })));

    // Generate dynamic next-day directive
    const directives = [
      "Tomorrow's directive: Outreach targets met. Shift focus to product engineering on Atlas. Review developer specifications at 8:00 AM.",
      "Tomorrow's directive: Constraints are tightening. Reach out to 5 additional founders. Gym moves to 6:00 PM. Silence tools early.",
      "Tomorrow's directive: Clear calendar blocks detected. Consolidate MGE spec writing. Silence notifications until 3:00 PM."
    ];
    const randomIndex = Math.floor(Math.random() * directives.length);
    setDirective(directives[randomIndex]);
  };

  const activeFocusTask = missions.find(m => !m.completed);

  return (
    <div className="zen-container" style={{ justifyContent: 'flex-start' }}>
      
      {/* Ambient Breathing Glow behind elements */}
      <div 
        className="breathing-glow-mesh"
        style={{ 
          width: `${glowSize}px`, 
          height: `${glowSize}px`
        }}
      />

      {/* Command Palette */}
      <CommandPalette 
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onAction={handlePaletteAction}
      />

      {/* Top Navbar */}
      <motion.nav 
        className="zen-nav"
        animate={{ 
          opacity: isExecuting ? 0.1 : 1,
          filter: isExecuting ? 'blur(2px)' : 'blur(0px)',
          pointerEvents: isExecuting ? 'none' : 'auto' 
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <span className="zen-nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🦾</span>
          <span style={{ fontWeight: 400, opacity: 0.6 }}>William /</span>
          <span style={{ fontWeight: 600 }}>{initialData.profile.name}</span>
        </span>

        <div className="zen-nav-links">
          {(['home', 'timeline', 'memory', 'settings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`zen-nav-link ${activeTab === tab ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', textTransform: 'capitalize' }}
            >
              {tab}
            </button>
          ))}
        </div>
      </motion.nav>

      {/* Viewport Frame */}
      <div className="zen-content">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + (isExecuting ? '-exec' : '-idle')}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            
            {/* Tab 1: Home Dashboard Terminal */}
            {activeTab === 'home' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Header block */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <h2 className="zen-title">Good morning.</h2>
                  </div>
                  {!isExecuting && (
                    <button 
                      onClick={() => setIsPaletteOpen(true)}
                      style={{
                        background: 'var(--focus-glow)',
                        border: '1px solid var(--border-hairline)',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      ⌘K
                    </button>
                  )}
                </div>

                {/* Evening Reflection Overlay card */}
                {showReflectionCard ? (
                  <motion.div 
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '24px', 
                      padding: '32px 24px', 
                      border: '1px solid var(--border-hairline)', 
                      borderRadius: '12px', 
                      background: 'var(--bg-surface)',
                      boxShadow: 'var(--shadow-subtle)'
                    }}
                  >
                    <div style={{ textAlign: 'center' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                        evening reflection
                      </span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 300, marginTop: '8px' }}>
                        Did today move the mission forward?
                      </h3>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                      {(['yes', 'partly', 'no'] as const).map(ans => (
                        <button
                          key={ans}
                          type="button"
                          className={`zen-btn-outline ${reflectionAnswer === ans ? 'selected' : ''}`}
                          onClick={() => setReflectionAnswer(ans)}
                          style={{
                            padding: '8px 24px',
                            textTransform: 'capitalize',
                            borderColor: reflectionAnswer === ans ? 'var(--accent-color)' : 'var(--border-hairline)'
                          }}
                        >
                          {ans}
                        </button>
                      ))}
                    </div>

                    {reflectionAnswer && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                      >
                        <span className="zen-caption">Why? (One paragraph description)</span>
                        <textarea
                          className="zen-textarea"
                          rows={2}
                          value={reflectionWhy}
                          onChange={(e) => setReflectionWhy(e.target.value)}
                          placeholder="Outreach session booked a call, moved MGE pitch forward."
                        />
                      </motion.div>
                    )}

                    <button 
                      className="zen-btn"
                      disabled={!reflectionAnswer || !reflectionWhy.trim()}
                      onClick={handleSubmitReflection}
                    >
                      Submit Reflection
                    </button>
                  </motion.div>
                ) : !isExecuting ? (
                  
                  /* Brief Overview Mode */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Primary Mission */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                        Mission
                      </span>
                      <div style={{ fontSize: '1.375rem', fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {dominantObjective}
                      </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-hairline)' }} />

                    {/* Authoritarian Daily Directive */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 20px', background: 'var(--focus-glow)', borderRadius: '8px', border: '1px solid var(--border-hairline)' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        directive
                      </span>
                      <div style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {directive}
                      </div>
                    </div>

                    {/* Today's Tasks */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                        Today
                      </span>
                      
                      <div className="zen-checklist">
                        {missions.map(m => (
                          <div 
                            key={m.id} 
                            className={`zen-checklist-item ${m.completed ? 'completed' : ''}`}
                            onClick={() => handleToggleMission(m.id)}
                          >
                            <div className="zen-checkbox">
                              {m.completed && '✓'}
                            </div>
                            <span className="zen-checklist-text">{m.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <hr style={{ border: 'none', borderTop: '1px solid var(--border-hairline)' }} />

                    <div style={{ marginTop: '4px' }}>
                      <button className="zen-btn" style={{ padding: '14px 44px', width: '100%' }} onClick={() => setIsExecuting(true)}>
                        Begin
                      </button>
                    </div>

                  </div>
                ) : (
                  
                  /* Focus Mode (Vision Pro Style) */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Focal card */}
                    <div 
                      style={{ 
                        padding: '48px 24px', 
                        border: '1px solid var(--border-hairline)', 
                        borderRadius: '16px', 
                        background: 'var(--bg-surface)', 
                        textAlign: 'center', 
                        boxShadow: 'var(--shadow-subtle)',
                        backdropFilter: 'blur(20px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                        position: 'relative'
                      }}
                    >
                      <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: '14px' }}>
                        focal mission
                      </span>
                      <h1 style={{ fontSize: '1.625rem', fontWeight: 300, color: 'var(--text-primary)', margin: '0 auto', maxWidth: '380px', lineHeight: 1.4 }}>
                        "{activeFocusTask?.text}"
                      </h1>
                      <span className="zen-caption" style={{ display: 'block', marginTop: '28px', opacity: 0.7 }}>
                        Mission: {dominantObjective}
                      </span>
                    </div>

                    {/* Conversational update box */}
                    <form onSubmit={handleSendCommand} className="zen-console">
                      <textarea
                        className="zen-console-textarea"
                        placeholder="Report update or type 'Done' to complete focal mission..."
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendCommand(e);
                          }
                        }}
                      />
                      <div className="zen-console-footer">
                        <div className="zen-console-pill">
                          <div className="zen-console-dot"></div>
                          <span>Focus Engine active</span>
                        </div>

                        <button 
                          type="submit"
                          className="zen-btn"
                          style={{ padding: '6px 16px', borderRadius: '16px', fontSize: '0.75rem' }}
                          disabled={!commandInput.trim()}
                        >
                          Submit
                        </button>
                      </div>
                    </form>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button className="zen-btn-outline" style={{ flex: 1 }} onClick={() => setIsExecuting(false)}>
                        Overview
                      </button>
                      <button 
                        className="zen-btn" 
                        style={{ flex: 1, background: 'var(--border-hairline)', color: 'var(--text-primary)' }} 
                        onClick={() => {
                          if (activeFocusTask) handleToggleMission(activeFocusTask.id);
                        }}
                      >
                        Skip Task
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Timeline feed */}
            {activeTab === 'timeline' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="zen-caption">Execution History</span>
                  <h2 className="zen-title">Timeline</h2>
                </div>

                <div className="zen-timeline-flow">
                  {historyLogs.map((log, idx) => (
                    <motion.div 
                      key={log.id} 
                      className={`zen-timeline-node ${idx === 0 ? 'active' : ''}`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <div className="zen-timeline-dot"></div>
                      <span className="zen-timeline-time">{log.time}</span>
                      <span className="zen-timeline-title">{log.text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Memory details */}
            {activeTab === 'memory' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="zen-caption">Model context assumptions</span>
                  <h2 className="zen-title">Memory Map</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Constellation View */}
                  <GoalConstellation goals={initialData.context.goals || []} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '12px' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.6875rem' }}>Operator Identity</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{initialData.profile.role}</span>
                    </div>

                    <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '12px' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.6875rem' }}>Target Build</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{initialData.profile.name}</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Tab 4: Settings config */}
            {activeTab === 'settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="zen-caption">Configurations</span>
                  <h2 className="zen-title">Settings</h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Theme */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 500 }}>Dark Theme</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Toggle deep carbon interface.</div>
                    </div>
                    <label className="ios-switch" style={{ width: '42px', height: '24px' }}>
                      <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                      <span className="ios-slider-toggle" style={{ borderRadius: '24px' }}></span>
                    </label>
                  </div>

                  {/* Rules list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 500 }}>Constitution Filters</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active guidelines governing decisions.</div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
                      {rules.map(r => (
                        <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{r.rule_text}</span>
                          <label className="ios-switch" style={{ width: '38px', height: '20px' }}>
                            <input type="checkbox" checked={r.is_active} onChange={() => handleToggleRule(r.id)} />
                            <span className="ios-slider-toggle" style={{ borderRadius: '20px' }}></span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reset */}
                  <div style={{ marginTop: '12px' }}>
                    <button 
                      className="zen-btn-outline" 
                      onClick={onReset}
                      style={{ color: '#ef4444', borderColor: '#fca5a5', width: '100%' }}
                    >
                      Reset Workspace Setup
                    </button>
                  </div>

                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
