import React, { useState } from 'react';
import type { ConstitutionRule, ContextState, Integration } from '@william/types';

interface OnboardingProps {
  onComplete: (data: {
    username: string;
    profile: { name: string; role: string; avatar: string };
    rules: ConstitutionRule[];
    context: Partial<ContextState>;
    integrations: Integration[];
  }) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(0);
  
  // Minimal onboarding fields
  const [role, setRole] = useState<string>('Founder');
  const [projectName, setProjectName] = useState<string>('Atlas');
  const [goalsInput, setGoalsInput] = useState<string>('Reach $10k MRR\nAcquire first clients');
  const [connectedServices, setConnectedServices] = useState<{
    calendar: boolean;
    notion: boolean;
    github: boolean;
  }>({
    calendar: false,
    notion: false,
    github: false
  });

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleRoleSelect = (selectedRole: string) => {
    setRole(selectedRole);
    setStep(2); // Automatically transition to next step on select
  };

  const toggleService = (service: 'calendar' | 'notion' | 'github') => {
    setConnectedServices(prev => ({
      ...prev,
      [service]: !prev[service]
    }));
  };

  const handleComplete = () => {
    const goalsArray = goalsInput
      .split('\n')
      .map(g => g.trim())
      .filter(g => g.length > 0);

    // Initial mock rules (highly tailored, minimal)
    const initialRules: ConstitutionRule[] = [
      { id: 'r1', user_id: 'u1', rule_text: 'Prioritize tasks aligned with dominant project goal', category: 'priority', is_active: true, created_at: new Date().toISOString() },
      { id: 'r2', user_id: 'u1', rule_text: 'Execute deep work session in early morning blocks', category: 'work', is_active: true, created_at: new Date().toISOString() },
      { id: 'r3', user_id: 'u1', rule_text: 'Review daily constraints before starting missions', category: 'priority', is_active: true, created_at: new Date().toISOString() }
    ];

    const contextState: Partial<ContextState> = {
      id: 'c1',
      user_id: 'u1',
      current_energy: 8,
      focus_score: 8,
      tasks_today: [],
      meetings_today: [],
      goals: goalsArray,
      last_updated_at: new Date().toISOString()
    };

    const integrations: Integration[] = [
      { id: 'i1', user_id: 'u1', provider: 'google', connected: connectedServices.calendar, connected_at: connectedServices.calendar ? new Date().toISOString() : '', last_synced_at: connectedServices.calendar ? new Date().toISOString() : null },
      { id: 'i2', user_id: 'u1', provider: 'notion', connected: connectedServices.notion, connected_at: connectedServices.notion ? new Date().toISOString() : '', last_synced_at: connectedServices.notion ? new Date().toISOString() : null },
      { id: 'i3', user_id: 'u1', provider: 'github', connected: connectedServices.github, connected_at: connectedServices.github ? new Date().toISOString() : '', last_synced_at: connectedServices.github ? new Date().toISOString() : null }
    ];

    onComplete({
      username: `${role.toLowerCase()}_operator`,
      profile: {
        name: projectName || 'Atlas Operator',
        role: role,
        avatar: role === 'Founder' ? '🚀' : role === 'Creator' ? '🎨' : role === 'Student' ? '🎓' : '💼'
      },
      rules: initialRules,
      context: contextState,
      integrations: integrations
    });
  };

  return (
    <div className="zen-container">
      {/* Hero Welcome Screen */}
      {step === 0 && (
        <div className="zen-content zen-animate-enter" style={{ textAlign: 'center', gap: '48px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h1 className="zen-title" style={{ fontSize: '3rem', fontWeight: 300, letterSpacing: '-0.06em' }}>
              William
            </h1>
            <p className="zen-subtitle" style={{ fontSize: '1.25rem', letterSpacing: '-0.02em', color: 'var(--text-muted)' }}>
              Your execution engine.
            </p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)', fontSize: '1.125rem' }}>
            <p>One decision.</p>
            <p>One priority.</p>
            <p>One step forward.</p>
          </div>

          <div style={{ marginTop: '24px' }}>
            <button className="zen-btn" style={{ padding: '14px 40px', fontSize: '1rem' }} onClick={handleNextStep}>
              Start
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Who are you? */}
      {step === 1 && (
        <div className="zen-content zen-animate-enter">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="zen-caption">Step 1 of 4</span>
            <h2 className="zen-title">Who are you?</h2>
          </div>

          <div className="zen-choice-list">
            {['Founder', 'Student', 'Creator', 'Executive'].map(opt => (
              <button 
                key={opt}
                className={`zen-choice-item ${role === opt ? 'selected' : ''}`}
                onClick={() => handleRoleSelect(opt)}
              >
                <span>{opt}</span>
                <span>→</span>
              </button>
            ))}
          </div>

          <div style={{ marginTop: '12px' }}>
            <button className="zen-btn-outline" onClick={handlePrevStep}>
              Back
            </button>
          </div>
        </div>
      )}

      {/* Step 2: What are you building? */}
      {step === 2 && (
        <div className="zen-content zen-animate-enter">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="zen-caption">Step 2 of 4</span>
            <h2 className="zen-title">What are you building?</h2>
          </div>

          <div style={{ marginTop: '16px' }}>
            <input 
              type="text" 
              className="zen-input"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Atlas"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && projectName.trim()) {
                  handleNextStep();
                }
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button className="zen-btn-outline" onClick={handlePrevStep}>
              Back
            </button>
            <button className="zen-btn" onClick={handleNextStep} disabled={!projectName.trim()}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Goals */}
      {step === 3 && (
        <div className="zen-content zen-animate-enter">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="zen-caption">Step 3 of 4</span>
            <h2 className="zen-title">What are your goals?</h2>
            <p className="zen-caption">Enter one goal per line.</p>
          </div>

          <div style={{ marginTop: '16px' }}>
            <textarea 
              className="zen-textarea"
              rows={4}
              value={goalsInput}
              onChange={(e) => setGoalsInput(e.target.value)}
              placeholder="e.g. Reach $10k MRR&#10;Acquire first clients"
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button className="zen-btn-outline" onClick={handlePrevStep}>
              Back
            </button>
            <button className="zen-btn" onClick={handleNextStep} disabled={!goalsInput.trim()}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Connect */}
      {step === 4 && (
        <div className="zen-content zen-animate-enter">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className="zen-caption">Step 4 of 4</span>
            <h2 className="zen-title">Connect</h2>
            <p className="zen-caption">Synergize William with your tools to pull context.</p>
          </div>

          <div className="zen-choice-list" style={{ marginTop: '16px' }}>
            {[
              { key: 'calendar', name: 'Calendar', desc: 'Sync daily schedules' },
              { key: 'notion', name: 'Notion', desc: 'Pull product specs' },
              { key: 'github', name: 'GitHub', desc: 'Sync code activities' }
            ].map(svc => (
              <button 
                key={svc.key}
                className={`zen-choice-item ${connectedServices[svc.key as 'calendar' | 'notion' | 'github'] ? 'selected' : ''}`}
                onClick={() => toggleService(svc.key as any)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 500 }}>{svc.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{svc.desc}</span>
                </div>
                <span>
                  {connectedServices[svc.key as 'calendar' | 'notion' | 'github'] ? 'Connected' : 'Disconnect'}
                </span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
            <button className="zen-btn-outline" onClick={handlePrevStep}>
              Back
            </button>
            <button className="zen-btn" onClick={handleComplete} style={{ flex: 1 }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
