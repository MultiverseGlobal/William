import React, { useState } from 'react';
import type { ConstitutionRule, ContextState, Integration } from '@william/types';

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
  
  // Decisive execution states
  const [isExecuting, setIsExecuting] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  
  // Goals & constraints loaded from onboarding
  const dominantObjective = initialData.context.goals?.[0] || 'Build high-growth engine';
  const otherGoals = initialData.context.goals?.slice(1) || [];
  
  // Pre-configured Today's constraint
  const [constraint, setConstraint] = useState<string>('You have only 6 qualified prospects.');

  // Checklists for missions
  const [missions, setMissions] = useState<MissionTask[]>([
    { id: 'm1', text: 'Research 20 founders.', completed: false },
    { id: 'm2', text: 'Send 15 messages.', completed: false },
    { id: 'm3', text: 'Book 1 discovery call.', completed: false }
  ]);

  // History timeline
  const [historyLogs, setHistoryLogs] = useState<Array<{ id: string; time: string; text: string; category?: string }>>([
    { id: 'h1', time: '08:00 AM', text: 'William auto briefing compiled.', category: 'brief' },
    { id: 'h2', time: 'Yesterday', text: 'Completed initial workspace setup configuration.', category: 'system' }
  ]);

  // Constitution rules toggles
  const [rules, setRules] = useState<ConstitutionRule[]>(initialData.rules);

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

    // Custom text triggers to simulate a competent chief of staff responding
    const firstUncompletedIndex = missions.findIndex(m => !m.completed);
    
    // Add transaction log
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: `h_${Date.now()}`,
      time: timestamp,
      text: `Report: "${query}"`
    };

    setHistoryLogs([newLog, ...historyLogs]);

    if (firstUncompletedIndex !== -1) {
      // Complete current task automatically on any feedback
      const updatedMissions = [...missions];
      updatedMissions[firstUncompletedIndex].completed = true;
      setMissions(updatedMissions);

      // Check if all are now completed
      const allDone = updatedMissions.every(m => m.completed);
      if (allDone) {
        setIsExecuting(false);
        // Update constraint
        setConstraint('Objective missions fully met. Zero blockages remaining.');
      }
    }
  };

  const activeFocusTask = missions.find(m => !m.completed);

  return (
    <div className="zen-container" style={{ justifyContent: 'flex-start' }}>
      
      {/* Top minimalistic navbar */}
      <nav className="zen-nav">
        <span className="zen-nav-logo">
          {initialData.profile.avatar} {initialData.profile.name}
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
      </nav>

      {/* Main viewport */}
      <div className="zen-content zen-animate-enter" style={{ gap: '32px' }}>
        
        {/* Tab 1: Home Dashboard Terminal */}
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
            
            {/* Greetings header */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="zen-caption">Chief of staff feed</span>
              <h2 className="zen-title">Good morning.</h2>
            </div>

            {/* If all missions are completed */}
            {missions.every(m => m.completed) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px', border: '1px dashed var(--border-hairline)', borderRadius: '8px', background: 'var(--bg-surface)' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 400 }}>Missions complete for today.</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                  William has captured your updates. Take time to rest and review your constraints. Tomorrow's objectives will sync automatically.
                </p>
                <button 
                  className="zen-btn-outline" 
                  onClick={() => setMissions(missions.map(m => ({ ...m, completed: false })))}
                  style={{ alignSelf: 'flex-start' }}
                >
                  Reset Missions
                </button>
              </div>
            ) : !isExecuting ? (
              /* Morning Briefing Mode */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Objective */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    dominant objective
                  </span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 300, color: 'var(--text-primary)' }}>
                    {dominantObjective}
                  </div>
                </div>

                {/* Constraint */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    today's constraint
                  </span>
                  <div style={{ fontSize: '1.125rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
                    {constraint}
                  </div>
                </div>

                {/* Missions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
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

                {/* Action button */}
                <div style={{ marginTop: '12px' }}>
                  <button className="zen-btn" style={{ padding: '14px 44px', width: '100%' }} onClick={() => setIsExecuting(true)}>
                    Begin
                  </button>
                </div>

              </div>
            ) : (
              /* Execution Mode (Single focal card + console) */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                
                {/* Active focal card */}
                <div style={{ padding: '40px 24px', border: '1px solid var(--border-hairline)', borderRadius: '12px', background: 'var(--bg-surface)', textAlign: 'center', boxShadow: 'var(--shadow-subtle)' }}>
                  <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em', display: 'block', marginBottom: '12px' }}>
                    next focus action
                  </span>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 300, color: 'var(--text-primary)', margin: '0 auto', maxWidth: '380px', lineHeight: 1.4 }}>
                    "{activeFocusTask?.text}"
                  </h1>
                  <span className="zen-caption" style={{ display: 'block', marginTop: '24px' }}>
                    Objective: {dominantObjective}
                  </span>
                </div>

                {/* Conversational input console (Timbal workspace style) */}
                <form onSubmit={handleSendCommand} className="zen-console">
                  <textarea
                    className="zen-console-textarea"
                    placeholder="Report progress back to William..."
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
                      <span>William engine</span>
                    </div>

                    <button 
                      type="submit"
                      className="zen-btn"
                      style={{ padding: '6px 16px', borderRadius: '16px', fontSize: '0.75rem' }}
                      disabled={!commandInput.trim()}
                    >
                      Send
                    </button>
                  </div>
                </form>

                <div>
                  <button className="zen-btn-outline" style={{ width: '100%' }} onClick={() => setIsExecuting(false)}>
                    Pause / View Overview
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
              {historyLogs.map(log => (
                <div key={log.id} className="zen-timeline-node">
                  <div className="zen-timeline-dot"></div>
                  <span className="zen-timeline-time">{log.time}</span>
                  <span className="zen-timeline-title">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Memory details */}
        {activeTab === 'memory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="zen-caption">Assumptions & Rules</span>
              <h2 className="zen-title">Memory</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '8px 0' }}>
              
              <div style={{ borderBottom: '1px solid var(--border-hairline)', paddingBottom: '12px' }}>
                <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>Operator Role</span>
                <div style={{ fontSize: '1rem', fontWeight: 500, marginTop: '4px' }}>{initialData.profile.role}</div>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-hairline)', paddingBottom: '12px' }}>
                <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>Active Build</span>
                <div style={{ fontSize: '1rem', fontWeight: 500, marginTop: '4px' }}>{initialData.profile.name}</div>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-hairline)', paddingBottom: '12px' }}>
                <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>Core Goals</span>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                  <li style={{ fontSize: '0.9375rem', fontWeight: 500 }}>• {dominantObjective} (Primary)</li>
                  {otherGoals.map((g, i) => (
                    <li key={i} style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>• {g}</li>
                  ))}
                </ul>
              </div>

              <div style={{ borderBottom: '1px solid var(--border-hairline)', paddingBottom: '12px' }}>
                <span className="zen-caption" style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}>Connected Channels</span>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  {initialData.integrations.filter(i => i.connected).map(i => (
                    <span 
                      key={i.provider} 
                      style={{ fontSize: '0.75rem', border: '1px solid var(--border-hairline)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 500 }}
                    >
                      {i.provider}
                    </span>
                  ))}
                  {initialData.integrations.filter(i => i.connected).length === 0 && (
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No services synced.</span>
                  )}
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
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 500 }}>Dark Theme</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Toggle deep slate interface.</div>
                </div>
                <label className="ios-switch" style={{ width: '42px', height: '24px' }}>
                  <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                  <span className="ios-slider-toggle" style={{ borderRadius: '24px' }}></span>
                </label>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderBottom: '1px solid var(--border-hairline)', paddingBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 500 }}>Constitution Constraints</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rules active in William's decision filter.</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                  {rules.map(r => (
                    <div key={r.id} style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{r.rule_text}</span>
                      <label className="ios-switch" style={{ width: '38px', height: '20px' }}>
                        <input type="checkbox" checked={r.is_active} onChange={() => handleToggleRule(r.id)} />
                        <span className="ios-slider-toggle" style={{ borderRadius: '20px' }}></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

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

      </div>
    </div>
  );
};
