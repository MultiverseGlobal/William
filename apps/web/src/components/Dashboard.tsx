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
  
  // Custom interactive execution workflow
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  
  // Goals loaded from onboarding configuration
  const [goals] = useState<string[]>(initialData.context.goals || []);
  const dominantObjective = goals[0] || 'Build high-growth engine';
  
  // Today's constraint
  const [constraint, setConstraint] = useState<string>('You have only 6 qualified prospects.');

  // Checklists for missions
  const [missions, setMissions] = useState<MissionTask[]>([
    { id: 'm1', text: 'Research 20 founders.', completed: false },
    { id: 'm2', text: 'Send 15 messages.', completed: false },
    { id: 'm3', text: 'Book 1 discovery call.', completed: false }
  ]);

  // History timeline
  const [historyLogs, setHistoryLogs] = useState<Array<{ id: string; time: string; text: string }>>([
    { id: 'h1', time: '08:00 AM', text: 'William auto briefing compiled.' },
    { id: 'h2', time: 'Yesterday', text: 'Completed initial workspace setup configuration.' }
  ]);

  // Constitution rules toggles
  const [rules, setRules] = useState<ConstitutionRule[]>(initialData.rules);

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

      // Skip sequential keyboard hooks if user is typing in a text area or input field
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      // Sequential key capture (e.g. press 'g' then 'h')
      keyBuffer += e.key.toLowerCase();
      window.clearTimeout(bufferTimeout);
      
      bufferTimeout = window.setTimeout(() => {
        keyBuffer = '';
      }, 800); // 800ms sequence gap

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

    // Transition focal tasks
    const firstUncompletedIdx = missions.findIndex(m => !m.completed);
    if (firstUncompletedIdx !== -1) {
      const updatedMissions = [...missions];
      updatedMissions[firstUncompletedIdx].completed = true;
      setMissions(updatedMissions);

      if (updatedMissions.every(m => m.completed)) {
        setIsExecuting(false);
        setConstraint('Objective missions fully met. Zero blockages remaining.');
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

  const activeFocusTask = missions.find(m => !m.completed);

  return (
    <div className="zen-container" style={{ justifyContent: 'flex-start' }}>
      
      {/* Universal Command Palette Modal */}
      <CommandPalette 
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onAction={handlePaletteAction}
      />

      {/* Top minimalistic navbar - Fades out in Focus Mode */}
      <motion.nav 
        className="zen-nav"
        animate={{ 
          opacity: isExecuting ? 0.15 : 1,
          filter: isExecuting ? 'blur(2px)' : 'blur(0px)',
          pointerEvents: isExecuting ? 'none' : 'auto' 
        }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <span className="zen-nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{initialData.profile.avatar}</span>
          <span style={{ fontWeight: 400, opacity: 0.8 }}>William /</span>
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

      {/* Main viewport area */}
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
                    <span className="zen-caption">Executive briefing</span>
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

                {/* All Tasks Completed State */}
                {missions.every(m => m.completed) ? (
                  <motion.div 
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '20px', 
                      padding: '32px 24px', 
                      border: '1px dashed var(--border-hairline)', 
                      borderRadius: '12px', 
                      background: 'var(--bg-surface)',
                      textAlign: 'center'
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>🏁</span>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 400 }}>Missions complete for today.</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '360px', margin: '0 auto', lineHeight: 1.5 }}>
                      William has captured your execution logs. Tomorrow's plan will morph dynamically based on these updates.
                    </p>
                    <button 
                      className="zen-btn-outline" 
                      onClick={() => setMissions(missions.map(m => ({ ...m, completed: false })))}
                      style={{ alignSelf: 'center', marginTop: '12px' }}
                    >
                      Reset Day
                    </button>
                  </motion.div>
                ) : !isExecuting ? (
                  
                  /* Brief Overview Mode */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Primary Objective */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                        dominant objective
                      </span>
                      <div style={{ fontSize: '1.375rem', fontWeight: 300, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                        {dominantObjective}
                      </div>
                    </div>

                    {/* Today's Constraint */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                        today's constraint
                      </span>
                      <div style={{ fontSize: '1.0625rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
                        {constraint}
                      </div>
                    </div>

                    {/* Missions Checkbox list */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                        today's mission
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

                    <div style={{ marginTop: '16px' }}>
                      <button className="zen-btn" style={{ padding: '14px 44px', width: '100%' }} onClick={() => setIsExecuting(true)}>
                        Begin Focus
                      </button>
                    </div>

                  </div>
                ) : (
                  
                  /* Focus Mode (Vision Pro Style) */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    
                    {/* Glowing focal card */}
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
                      {/* Subtle lighting top border */}
                      <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: '1px', background: 'linear-gradient(90deg, transparent, var(--text-muted), transparent)', opacity: 0.3 }} />

                      <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.05em', display: 'block', marginBottom: '14px' }}>
                        focal mission
                      </span>
                      <h1 style={{ fontSize: '1.625rem', fontWeight: 300, color: 'var(--text-primary)', margin: '0 auto', maxWidth: '380px', lineHeight: 1.4 }}>
                        "{activeFocusTask?.text}"
                      </h1>
                      <span className="zen-caption" style={{ display: 'block', marginTop: '28px', opacity: 0.7 }}>
                        Target: {dominantObjective}
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
                  
                  {/* Constellation component render */}
                  <GoalConstellation goals={goals} />

                  {/* Settings specs list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '12px' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.6875rem' }}>Operator Role</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{initialData.profile.role}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '12px' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.6875rem' }}>Target Build</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{initialData.profile.name}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '12px' }}>
                      <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.6875rem' }}>Connected Channels</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {initialData.integrations.filter(i => i.connected).map(i => (
                          <span key={i.provider} style={{ fontSize: '10px', background: 'var(--focus-glow)', border: '1px solid var(--border-hairline)', padding: '2px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                            {i.provider}
                          </span>
                        ))}
                        {initialData.integrations.filter(i => i.connected).length === 0 && (
                          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>None connected</span>
                        )}
                      </div>
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
