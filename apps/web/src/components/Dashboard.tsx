import React, { useState } from 'react';
import type { Command, ConstitutionRule, ContextState, Integration, DailyBrief } from '@william/types';

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

export const Dashboard: React.FC<DashboardProps> = ({ initialData, onReset }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // App states loaded from onboarding
  const [profile] = useState(initialData.profile);
  const [rules, setRules] = useState<ConstitutionRule[]>(initialData.rules);
  const [context, setContext] = useState<Partial<ContextState>>(initialData.context);
  const [integrations, setIntegrations] = useState<Integration[]>(initialData.integrations);
  
  // Interactive prompt input
  const [commandInput, setCommandInput] = useState('');
  
  // Mock activity logs (Command queue)
  const [commandLogs, setCommandLogs] = useState<Command[]>([
    {
      id: 'cmd_1',
      user_id: 'u1',
      title: 'Analyze Notion task backlog & prioritize writing tasks',
      reason: 'Rule [Work]: Prioritize writing time in morning blocks',
      estimated_minutes: 20,
      status: 'completed',
      ignored_count: 0,
      issued_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      completed_at: new Date(Date.now() - 3600000 * 1.7).toISOString(),
      context_snapshot: null
    },
    {
      id: 'cmd_2',
      user_id: 'u1',
      title: 'Generate morning executive briefing feed',
      reason: 'Scheduled auto execution at 08:00 AM',
      estimated_minutes: 5,
      status: 'completed',
      ignored_count: 0,
      issued_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      completed_at: new Date(Date.now() - 3600000 * 1.4).toISOString(),
      context_snapshot: null
    },
    {
      id: 'cmd_3',
      user_id: 'u1',
      title: 'Postpone code review session to recovery block',
      reason: 'Rule [Recovery]: Stand up / break alert triggered after 90m focus',
      estimated_minutes: 15,
      status: 'active',
      ignored_count: 0,
      issued_at: new Date(Date.now() - 600000).toISOString(),
      completed_at: null,
      context_snapshot: null
    }
  ]);

  // Handle toggling theme
  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Toggle active rule
  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, is_active: !r.is_active } : r));
  };

  // Submit prompt console
  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    // Create a new mock command log
    const newCommand: Command = {
      id: `cmd_${Date.now()}`,
      user_id: 'u1',
      title: commandInput.trim(),
      reason: 'Manual prompt instruction input via workspace console',
      estimated_minutes: Math.floor(Math.random() * 25) + 5,
      status: 'active',
      ignored_count: 0,
      issued_at: new Date().toISOString(),
      completed_at: null,
      context_snapshot: null
    };

    setCommandLogs([newCommand, ...commandLogs]);
    setCommandInput('');

    // Simulate completion after a delay
    setTimeout(() => {
      setCommandLogs(prevLogs => 
        prevLogs.map(c => c.id === newCommand.id ? { ...c, status: 'completed', completed_at: new Date().toISOString() } : c)
      );
      // Increment focus score slightly on command success
      setContext(prev => ({
        ...prev,
        focus_score: Math.min((prev.focus_score || 7) + 1, 10)
      }));
    }, 4000);
  };

  // Simulate syncing an integration
  const handleSyncIntegration = (id: string) => {
    setIntegrations(integrations.map(integ => 
      integ.id === id 
        ? { ...integ, last_synced_at: new Date().toISOString() }
        : integ
    ));
  };

  // Dynamically compute warnings / risks based on active rules
  const getDynamicBrief = (): DailyBrief => {
    const isSleepRuleActive = rules.find(r => r.category === 'sleep')?.is_active ?? false;
    const isHealthRuleActive = rules.find(r => r.category === 'health')?.is_active ?? false;
    const isPriorityRuleActive = rules.find(r => r.category === 'priority')?.is_active ?? false;

    const risks: string[] = [];
    if (!isSleepRuleActive) {
      risks.push('Fatigue alert: Sleep recovery schedule is toggled OFF.');
    }
    if (!isHealthRuleActive) {
      risks.push('Biometric warning: Health movement guidelines are inactive.');
    }
    if (context.current_energy && context.current_energy < 5) {
      risks.push('Low battery: Current energy level suggests scheduling high-intensity work tomorrow instead.');
    }
    if (risks.length === 0) {
      risks.push('All parameters normal. Perfect constitution compliance score today.');
    }

    return {
      id: 'brief_1',
      user_id: 'u1',
      type: 'morning',
      content: {
        objective: `Maintain writing flow while monitoring your daily goals: ${context.goals?.join(', ') || 'No goals configured'}.`,
        meetings: [
          '09:30 AM - Synchronize Notion backlog and workspaces',
          '02:00 PM - Refactor TypeScript compiler types review'
        ],
        risks: risks,
        tomorrow_priority: isPriorityRuleActive ? 'Protect writing block' : 'Resolve scheduling overflow backlog'
      },
      generated_at: new Date().toISOString(),
      acknowledged_at: null
    };
  };

  const dailyBrief = getDynamicBrief();

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'sleep': return 'tb-badge-sleep';
      case 'health': return 'tb-badge-health';
      case 'work': return 'tb-badge-work';
      case 'recovery': return 'tb-badge-recovery';
      case 'priority': return 'tb-badge-priority';
      default: return '';
    }
  };

  return (
    <div className="tb-app">
      {/* Dynamic Navigation Header */}
      <header className="tb-header">
        <a href="#" className="tb-nav-logo">
          <div className="tb-logo-mark">W</div>
          <span>William Workspace</span>
        </a>

        <div className="tb-header-actions">
          {/* Theme Switcher */}
          <button className="tb-theme-toggle" onClick={toggleTheme} title="Toggle Dark/Light Mode">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {/* Connected User Badge */}
          <div className="tb-user-profile">
            <div className="tb-user-avatar">{profile.avatar}</div>
            <span>{profile.name}</span>
          </div>

          <button 
            onClick={onReset}
            style={{
              border: '1px solid var(--tb-border)',
              background: 'transparent',
              borderRadius: '20px',
              padding: '6px 12px',
              fontSize: '11px',
              cursor: 'pointer',
              color: 'var(--tb-text-secondary)',
              fontWeight: 600
            }}
          >
            Reset Setup
          </button>
        </div>
      </header>

      {/* Main dashboard content */}
      <main className="tb-main">
        {/* Central interactive console in standard Timbal.ai Landing area */}
        <section className="tb-console-container">
          <h1 className="tb-console-title">The end-to-end workspace for William</h1>
          <p className="tb-console-subtitle">Configure rules, sync tools, and dispatch cognitive instructions.</p>

          <form onSubmit={handleSendCommand} className="tb-console-input-wrapper">
            <textarea
              className="tb-console-textarea"
              placeholder="Deploy task analysis or command William..."
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendCommand(e);
                }
              }}
            />
            
            <div className="tb-console-footer">
              {/* Status indicator selector matching timbal legato selector */}
              <div className="tb-pill-selector">
                <div className="tb-pill-dot"></div>
                <span>Legato Framework</span>
              </div>

              {/* Signature Send Button with Custom pulse metalball ring */}
              <button 
                type="submit" 
                className="tb-btn-send"
                disabled={!commandInput.trim()}
                style={{ opacity: commandInput.trim() ? 1 : 0.6 }}
              >
                {commandInput.trim() && <div className="tb-metalball-animation"></div>}
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5"
                  style={{ position: 'relative', zIndex: 2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
              </button>
            </div>
          </form>
        </section>

        {/* Dashboard Grid Panel System */}
        <section className="tb-dashboard-grid">
          
          {/* Panel 1: Context State Metrics (Col-4) */}
          <div className="tb-panel tb-panel-col-4">
            <div className="tb-panel-header">
              <span className="tb-panel-title">Context Tracker</span>
              <span style={{ fontSize: '18px' }}>🧠</span>
            </div>
            
            <div className="tb-context-status">
              <div className="tb-slider-display">
                <div className="tb-slider-row">
                  <span>Energy Index</span>
                  <span>{context.current_energy}/10</span>
                </div>
                <div className="tb-progress-track">
                  <div 
                    className="tb-progress-fill tb-fill-energy" 
                    style={{ width: `${(context.current_energy ?? 8) * 10}%` }}
                  />
                </div>
              </div>

              <div className="tb-slider-display">
                <div className="tb-slider-row">
                  <span>Focus Quotient</span>
                  <span>{context.focus_score}/10</span>
                </div>
                <div className="tb-progress-track">
                  <div 
                    className="tb-progress-fill tb-fill-focus" 
                    style={{ width: `${(context.focus_score ?? 7) * 10}%` }}
                  />
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--tb-border)', paddingTop: '12px', marginTop: '6px' }}>
              <span className="tb-brief-block-title" style={{ fontSize: '11px' }}>Daily Focus Goals</span>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                {context.goals?.map((goal, idx) => (
                  <li key={idx} style={{ fontSize: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: '#10b981' }}>✓</span>
                    <span style={{ color: 'var(--tb-text)' }}>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Panel 2: Active Constitution Toggles (Col-8) */}
          <div className="tb-panel tb-panel-col-8">
            <div className="tb-panel-header">
              <span className="tb-panel-title">Active Constitution Rules</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>
                {rules.filter(r => r.is_active).length} RULES ENFORCED
              </span>
            </div>

            <div className="tb-rules-list">
              {rules.map((rule) => (
                <div key={rule.id} className="tb-rule-card">
                  <div className="tb-rule-card-left">
                    <span className={`tb-category-badge ${getCategoryColor(rule.category)}`}>
                      {rule.category}
                    </span>
                    <span className="tb-rule-text">{rule.rule_text}</span>
                  </div>
                  <label className="ios-switch" style={{ width: '42px', height: '24px' }}>
                    <input 
                      type="checkbox" 
                      checked={rule.is_active}
                      onChange={() => toggleRule(rule.id)}
                    />
                    <span className="ios-slider-toggle" style={{ borderRadius: '24px' }}></span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 3: Integrations Board (Col-4) */}
          <div className="tb-panel tb-panel-col-4">
            <div className="tb-panel-header">
              <span className="tb-panel-title">Connected Services</span>
              <span>🔌</span>
            </div>

            <div className="tb-integrations-list">
              {integrations.map((integ) => (
                <div key={integ.id} className="tb-integration-box">
                  <span className="tb-integration-icon">
                    {integ.provider === 'google' ? '📅' : integ.provider === 'notion' ? '📓' : integ.provider === 'github' ? '🐙' : '✉️'}
                  </span>
                  <span className="tb-integration-name" style={{ textTransform: 'capitalize' }}>
                    {integ.provider}
                  </span>
                  
                  {integ.connected ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span className="tb-integration-status-pill tb-status-connected">Active</span>
                      <button 
                        onClick={() => handleSyncIntegration(integ.id)}
                        style={{ fontSize: '9px', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'var(--tb-text-secondary)' }}
                      >
                        {integ.last_synced_at ? 'Synced Just Now' : 'Sync Now'}
                      </button>
                    </div>
                  ) : (
                    <span className="tb-integration-status-pill tb-status-disconnected">Off</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Panel 4: Live Daily briefings Widget (Col-8) */}
          <div className="tb-panel tb-panel-col-8">
            <div className="tb-panel-header">
              <span className="tb-panel-title">Daily Cognitive briefing</span>
              <span style={{ fontSize: '11px', color: 'var(--tb-text-muted)' }}>
                UPDATED {new Date(dailyBrief.generated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="tb-brief-section">
              <div className="tb-brief-objective">
                {dailyBrief.content.objective}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '4px' }}>
                <div>
                  <h4 className="tb-brief-block-title">Meetings & Schedule</h4>
                  <ul className="tb-brief-list">
                    {dailyBrief.content.meetings.map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="tb-brief-block-title">Identified Risks</h4>
                  <ul className="tb-brief-list">
                    {dailyBrief.content.risks.map((r, idx) => (
                      <li key={idx} style={{ color: r.includes('warning') || r.includes('alert') ? '#f59e0b' : 'inherit' }}>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Panel 5: Production Log monitoring (Col-12) */}
          <div className="tb-panel tb-panel-col-12">
            <div className="tb-panel-header">
              <span className="tb-panel-title">Execution logs & activity feed</span>
              <span style={{ fontSize: '11px', color: 'var(--tb-text-muted)' }}>
                {commandLogs.length} LOGGED OPERATIONS
              </span>
            </div>

            <div className="tb-activity-logs">
              {commandLogs.map((log) => (
                <div key={log.id} className="tb-log-row">
                  <div className="tb-log-details" style={{ flex: 1, paddingRight: '12px' }}>
                    <span className="tb-log-title">{log.title}</span>
                    <span className="tb-log-reason">{log.reason}</span>
                    <span className="tb-log-time">
                      Issued: {new Date(log.issued_at).toLocaleTimeString()} 
                      {log.completed_at && ` | Completed: ${new Date(log.completed_at).toLocaleTimeString()}`}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--tb-text-secondary)', fontWeight: 500 }}>
                      Est: {log.estimated_minutes}m
                    </span>
                    <span className={`tb-log-status tb-status-${log.status}`}>
                      {log.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>
      </main>
    </div>
  );
};
