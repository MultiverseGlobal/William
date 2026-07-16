import React, { useState, useEffect } from 'react';
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
  
  // Hello greeting state
  const greetings = ['Hello', 'Hola', 'Bonjour', 'Ciao', 'William'];
  const [greetingIndex, setGreetingIndex] = useState(0);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [profileName, setProfileName] = useState('');
  const [profileRole, setProfileRole] = useState('Developer');
  const [profileAvatar, setProfileAvatar] = useState('👨‍💻');
  
  // Custom rules list
  const defaultRules: ConstitutionRule[] = [
    { id: 'r1', user_id: 'u1', rule_text: 'No screens after 10:00 PM for deep sleep recovery', category: 'sleep', is_active: true, created_at: new Date().toISOString() },
    { id: 'r2', user_id: 'u1', rule_text: 'Walk 10,000 steps daily or stand every 60 minutes', category: 'health', is_active: true, created_at: new Date().toISOString() },
    { id: 'r3', user_id: 'u1', rule_text: 'Deep work focus blocks of 90 minutes in the morning', category: 'work', is_active: true, created_at: new Date().toISOString() },
    { id: 'r4', user_id: 'u1', rule_text: 'Take weekends off entirely to disconnect and recharge', category: 'recovery', is_active: false, created_at: new Date().toISOString() },
    { id: 'r5', user_id: 'u1', rule_text: 'Never schedule meetings before 11:00 AM', category: 'priority', is_active: true, created_at: new Date().toISOString() },
  ];
  const [rules, setRules] = useState<ConstitutionRule[]>(defaultRules);
  const [newRuleText, setNewRuleText] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState<'sleep' | 'health' | 'work' | 'recovery' | 'priority'>('work');

  // Context states
  const [energy, setEnergy] = useState<number>(8);
  const [focus, setFocus] = useState<number>(7);
  const [dailyGoals, setDailyGoals] = useState<string>('Finish onboarding flow\nReview monorepo architecture\nDesign database schema');

  // Integrations states
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'i1', user_id: 'u1', provider: 'google', connected: false, connected_at: '', last_synced_at: null },
    { id: 'i2', user_id: 'u1', provider: 'notion', connected: false, connected_at: '', last_synced_at: null },
    { id: 'i3', user_id: 'u1', provider: 'github', connected: false, connected_at: '', last_synced_at: null },
    { id: 'i4', user_id: 'u1', provider: 'gmail', connected: false, connected_at: '', last_synced_at: null },
  ]);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Emojis list for avatar selector
  const avatarOptions = ['👨‍💻', '👩‍💻', '🚀', '🧠', '🎯', '🎨', '💼', '⚡', '🌟', '🧘'];

  // Cycle greetings at step 0
  useEffect(() => {
    if (step !== 0) return;
    const timer = setInterval(() => {
      setGreetingIndex((prev) => {
        if (prev === greetings.length - 1) {
          clearInterval(timer);
          return prev; // stays on "William"
        }
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [step]);

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, is_active: !r.is_active } : r));
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleText.trim()) return;
    const newRule: ConstitutionRule = {
      id: `rcustom_${Date.now()}`,
      user_id: 'u1',
      rule_text: newRuleText.trim(),
      category: newRuleCategory,
      is_active: true,
      created_at: new Date().toISOString()
    };
    setRules([...rules, newRule]);
    setNewRuleText('');
  };

  const handleConnectIntegration = (id: string) => {
    setConnectingId(id);
    setTimeout(() => {
      setIntegrations(integrations.map(integ => 
        integ.id === id 
          ? { ...integ, connected: true, connected_at: new Date().toISOString(), last_synced_at: new Date().toISOString() } 
          : integ
      ));
      setConnectingId(null);
    }, 1500); // simulate network sync delay
  };

  const handleComplete = () => {
    const goalsArray = dailyGoals
      .split('\n')
      .map(g => g.trim())
      .filter(g => g.length > 0);

    const contextState: Partial<ContextState> = {
      id: 'c1',
      user_id: 'u1',
      current_energy: energy,
      focus_score: focus,
      tasks_today: [],
      meetings_today: [],
      goals: goalsArray,
      last_updated_at: new Date().toISOString()
    };

    onComplete({
      username: email || 'william_user',
      profile: {
        name: profileName || 'User Name',
        role: profileRole,
        avatar: profileAvatar
      },
      rules: rules,
      context: contextState,
      integrations: integrations
    });
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'sleep': return '#3b82f6';
      case 'health': return '#10b981';
      case 'work': return '#f59e0b';
      case 'recovery': return '#8b5cf6';
      case 'priority': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      overflow: 'hidden'
    }}>
      {/* Decorative grain gradient background */}
      <div className="grainient-container"></div>

      {/* Screen 0: Hello Screen */}
      {step === 0 && (
        <div className="ios-card animate-fade" style={{ textAlign: 'center', padding: '40px 32px' }}>
          <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="handwritten-text animate-draw">
              {greetings[greetingIndex]}
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Personal Workspace Setup
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '40px', lineHeight: 1.5 }}>
            Configure your focus context and core rules to help William align advice to your physical energy and work calendar.
          </p>
          <button className="ios-btn-primary" onClick={handleNextStep}>
            Set Up Manually
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Screen 1: iPhone Apple ID sign in style */}
      {step === 1 && (
        <div className="ios-card animate-slide">
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔒</div>
            <h2 className="ios-heading">Sign In with Apple ID</h2>
            <p className="ios-subheading" style={{ marginBottom: 0 }}>
              Use your Apple Account credentials to authorize secure data storage for William.
            </p>
          </div>

          <div className="ios-input-group">
            <label className="ios-label">Apple ID</label>
            <input 
              type="text" 
              className="ios-input" 
              placeholder="example@icloud.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="ios-input-group" style={{ marginBottom: '24px' }}>
            <label className="ios-label">Password</label>
            <input 
              type="password" 
              className="ios-input" 
              placeholder="Required"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="ios-btn-primary" onClick={handleNextStep} disabled={!email || !password}>
            Sign In
          </button>
          <button className="ios-btn-secondary" onClick={() => {
            setEmail('william.executive@apple.com');
            setPassword('super_secret_123');
            setStep(2);
          }}>
            Set Up Later
          </button>
        </div>
      )}

      {/* Screen 2: User Profile Settings */}
      {step === 2 && (
        <div className="ios-card animate-slide">
          <h2 className="ios-heading">Profile Setup</h2>
          <p className="ios-subheading">
            Personalize how William identifies you in daily briefs and summaries.
          </p>

          <div className="ios-input-group">
            <label className="ios-label">Your Name</label>
            <input 
              type="text" 
              className="ios-input" 
              placeholder="e.g. William"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
          </div>

          <div className="ios-input-group">
            <label className="ios-label">Your Professional Role</label>
            <select 
              className="ios-input"
              value={profileRole}
              onChange={(e) => setProfileRole(e.target.value)}
              style={{ appearance: 'none', background: 'var(--bg-card-secondary) url("data:image/svg+xml;utf8,<svg fill=\'%238e8e93\' height=\'24\' viewBox=\'0 0 24 24\' width=\'24\' xmlns=\'http://www.w3.org/2000/svg\'><path d=\'M7 10l5 5 5-5z\'/></svg>") no-repeat right 12px center' }}
            >
              <option value="Developer">Developer</option>
              <option value="Founder / CEO">Founder / CEO</option>
              <option value="Product Designer">Product Designer</option>
              <option value="Creative Director">Creative Director</option>
              <option value="Consultant">Consultant</option>
            </select>
          </div>

          <div className="ios-input-group">
            <label className="ios-label">Choose Avatar</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
              {avatarOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setProfileAvatar(emoji)}
                  style={{
                    fontSize: '22px',
                    padding: '8px',
                    borderRadius: '10px',
                    border: '2px solid ' + (profileAvatar === emoji ? 'var(--bg-accent)' : 'transparent'),
                    background: 'var(--bg-card-secondary)',
                    cursor: 'pointer',
                    flex: '1 0 18%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <button className="ios-btn-secondary" style={{ width: '30%', padding: 0 }} onClick={handlePrevStep}>
              Back
            </button>
            <button className="ios-btn-primary" style={{ width: '70%', marginTop: 0 }} onClick={handleNextStep}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Screen 3: Constitution Setup (Tailored for William) */}
      {step === 3 && (
        <div className="ios-card animate-slide" style={{ maxWidth: '480px' }}>
          <h2 className="ios-heading" style={{ fontSize: '28px' }}>Your Constitution</h2>
          <p className="ios-subheading" style={{ marginBottom: '20px' }}>
            Select guidelines governing William's reasoning engine for your daily scheduling.
          </p>

          <div className="ios-list" style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '16px' }}>
            {rules.map((rule) => (
              <div key={rule.id} className="ios-list-row">
                <div className="ios-row-left" style={{ flex: 1, paddingRight: '8px' }}>
                  <div className="ios-icon-box" style={{ background: getCategoryColor(rule.category), fontSize: '11px', fontWeight: 'bold' }}>
                    {rule.category[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="ios-row-label" style={{ fontSize: '13px', lineHeight: 1.3 }}>{rule.rule_text}</div>
                    <div className="ios-row-sub" style={{ textTransform: 'uppercase', fontSize: '9px', fontWeight: 600 }}>{rule.category}</div>
                  </div>
                </div>
                <label className="ios-switch">
                  <input 
                    type="checkbox" 
                    checked={rule.is_active}
                    onChange={() => toggleRule(rule.id)}
                  />
                  <span className="ios-slider-toggle"></span>
                </label>
              </div>
            ))}
          </div>

          {/* Add custom rule form */}
          <form onSubmit={handleAddRule} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'var(--bg-card-secondary)', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '16px' }}>
            <span className="ios-label" style={{ margin: 0 }}>Add Custom Guideline</span>
            <input
              type="text"
              placeholder="e.g. Stop coding if focus drops below 4"
              className="ios-input"
              style={{ padding: '8px 12px', fontSize: '13px' }}
              value={newRuleText}
              onChange={(e) => setNewRuleText(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <select
                className="ios-input"
                style={{ width: '60%', padding: '6px', fontSize: '12px', background: 'var(--bg-card)' }}
                value={newRuleCategory}
                onChange={(e) => setNewRuleCategory(e.target.value as any)}
              >
                <option value="work">Work</option>
                <option value="sleep">Sleep</option>
                <option value="health">Health</option>
                <option value="recovery">Recovery</option>
                <option value="priority">Priority</option>
              </select>
              <button
                type="submit"
                style={{
                  background: 'var(--bg-accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Add Rule
              </button>
            </div>
          </form>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="ios-btn-secondary" style={{ width: '30%', padding: 0 }} onClick={handlePrevStep}>
              Back
            </button>
            <button className="ios-btn-primary" style={{ width: '70%', marginTop: 0 }} onClick={handleNextStep}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Screen 4: Context State Settings */}
      {step === 4 && (
        <div className="ios-card animate-slide">
          <h2 className="ios-heading">Physical Context</h2>
          <p className="ios-subheading">
            Initialize your biometric state sliders. William references these scores to gauge fatigue.
          </p>

          <div className="ios-input-group" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="ios-label" style={{ margin: 0 }}>Current Energy Score</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bg-accent)' }}>{energy}/10</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>😴</span>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--bg-accent)', cursor: 'pointer' }}
              />
              <span>⚡</span>
            </div>
          </div>

          <div className="ios-input-group" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span className="ios-label" style={{ margin: 0 }}>Target Focus Score</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--bg-accent)' }}>{focus}/10</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>🌀</span>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={focus}
                onChange={(e) => setFocus(parseInt(e.target.value))}
                style={{ flex: 1, accentColor: 'var(--bg-accent)', cursor: 'pointer' }}
              />
              <span>🎯</span>
            </div>
          </div>

          <div className="ios-input-group" style={{ marginBottom: '24px' }}>
            <label className="ios-label">Today's Focus Objectives (one per line)</label>
            <textarea
              className="ios-input"
              rows={3}
              placeholder="Objective 1&#10;Objective 2"
              style={{ resize: 'none', fontSize: '14px', fontFamily: 'inherit' }}
              value={dailyGoals}
              onChange={(e) => setDailyGoals(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="ios-btn-secondary" style={{ width: '30%', padding: 0 }} onClick={handlePrevStep}>
              Back
            </button>
            <button className="ios-btn-primary" style={{ width: '70%', marginTop: 0 }} onClick={handleNextStep}>
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Screen 5: Integrations Setup */}
      {step === 5 && (
        <div className="ios-card animate-slide" style={{ maxWidth: '460px' }}>
          <h2 className="ios-heading">Connect Services</h2>
          <p className="ios-subheading">
            Sync Notion databases and calendar accounts to load active workloads automatically.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {integrations.map((integ) => (
              <div 
                key={integ.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '14px 16px', 
                  background: 'var(--bg-card-secondary)', 
                  borderRadius: '14px',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>
                    {integ.provider === 'google' ? '📅' : integ.provider === 'notion' ? '📓' : integ.provider === 'github' ? '🐙' : '✉️'}
                  </span>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, textTransform: 'capitalize' }}>{integ.provider}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {integ.connected ? 'Connected' : 'Sync not enabled'}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={integ.connected || connectingId !== null}
                  onClick={() => handleConnectIntegration(integ.id)}
                  style={{
                    background: integ.connected ? 'transparent' : 'var(--bg-primary)',
                    color: integ.connected ? '#34c759' : 'var(--bg-accent)',
                    border: 'none',
                    borderRadius: '16px',
                    padding: '6px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: integ.connected ? 'default' : 'pointer',
                    minWidth: '85px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {connectingId === integ.id ? (
                    <div style={{ border: '2px solid transparent', borderTopColor: 'var(--bg-accent)', borderRadius: '50%', width: '12px', height: '12px', animation: 'spin 0.6s linear infinite' }} />
                  ) : integ.connected ? (
                    '✓ Connected'
                  ) : (
                    'Connect'
                  )}
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="ios-btn-secondary" style={{ width: '30%', padding: 0 }} onClick={handlePrevStep}>
              Back
            </button>
            <button className="ios-btn-primary" style={{ width: '70%', marginTop: 0 }} onClick={handleNextStep}>
              Continue
            </button>
          </div>

          <style dangerouslySetInnerHTML={{__html: `
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}} />
        </div>
      )}

      {/* Screen 6: Onboarding Complete (Welcome Screen) */}
      {step === 6 && (
        <div className="ios-card animate-slide" style={{ textAlign: 'center', padding: '36px 28px' }}>
          <div className="ios-privacy-icon animate-float" style={{ fontSize: '48px', marginBottom: '24px' }}>
            🤝
          </div>
          <h2 className="ios-heading" style={{ fontSize: '28px', marginBottom: '12px' }}>Welcome to William</h2>
          <p className="ios-subheading" style={{ marginBottom: '28px' }}>
            Your setup is complete. William is ready to organize your day according to your constitution.
          </p>

          <div style={{ background: 'var(--bg-card-secondary)', borderRadius: '14px', padding: '16px', textAlign: 'left', border: '1px solid var(--border-light)', marginBottom: '32px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
              Configuration Summary
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Operator:</span>
                <span style={{ fontWeight: 600 }}>{profileName || 'William User'} ({profileRole})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Active Rules:</span>
                <span style={{ fontWeight: 600 }}>{rules.filter(r => r.is_active).length} Guidelines</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Energy Score:</span>
                <span style={{ fontWeight: 600 }}>{energy}/10</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Connected Hubs:</span>
                <span style={{ fontWeight: 600 }}>{integrations.filter(i => i.connected).length} Accounts</span>
              </div>
            </div>
          </div>

          <button className="ios-btn-primary" onClick={handleComplete} style={{ height: '52px', fontSize: '17px' }}>
            Get Started
          </button>
        </div>
      )}
    </div>
  );
};
