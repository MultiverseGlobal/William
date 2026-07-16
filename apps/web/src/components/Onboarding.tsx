import React, { useState, useEffect } from 'react';
import type { ConstitutionRule, ContextState, Integration } from '@william/types';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  // Ritual greeting state
  const [ritualPhase, setRitualPhase] = useState<number>(0);

  // User input answers
  const [becomingInput, setBecomingInput] = useState('');
  const [buildingInput, setBuildingInput] = useState('');
  const [missionInput, setMissionInput] = useState('');

  // Auto-progress ritual steps
  useEffect(() => {
    if (step !== 0) return;

    const timer1 = setTimeout(() => {
      setRitualPhase(1); // switch to "Let's build your world."
    }, 2800);

    const timer2 = setTimeout(() => {
      setStep(1); // switch to first question
    }, 5600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [step]);

  // Simulating calculation step
  useEffect(() => {
    if (step === 4) {
      const timer = setTimeout(() => {
        setStep(5); // ready screen
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleNextStep = () => {
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleComplete = () => {
    // Initial core rules
    const initialRules: ConstitutionRule[] = [
      { id: 'r1', user_id: 'u1', rule_text: 'Prioritize tasks aligned with dominant mission targets', category: 'priority', is_active: true, created_at: new Date().toISOString() },
      { id: 'r2', user_id: 'u1', rule_text: 'Execute deep work session in early morning blocks', category: 'work', is_active: true, created_at: new Date().toISOString() },
      { id: 'r3', user_id: 'u1', rule_text: 'Strict boundary between active execution and recovery', category: 'recovery', is_active: true, created_at: new Date().toISOString() }
    ];

    const contextState: Partial<ContextState> = {
      id: 'c1',
      user_id: 'u1',
      current_energy: 8,
      focus_score: 8,
      tasks_today: [],
      meetings_today: [],
      goals: [missionInput.trim() || 'Acquire first 3 clients'],
      last_updated_at: new Date().toISOString()
    };

    const integrations: Integration[] = [
      { id: 'i1', user_id: 'u1', provider: 'google', connected: true, connected_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
      { id: 'i2', user_id: 'u1', provider: 'notion', connected: true, connected_at: new Date().toISOString(), last_synced_at: new Date().toISOString() },
      { id: 'i3', user_id: 'u1', provider: 'github', connected: true, connected_at: new Date().toISOString(), last_synced_at: new Date().toISOString() }
    ];

    onComplete({
      username: becomingInput.trim() || 'Benjamin',
      profile: {
        name: buildingInput.trim() || 'Atlas',
        role: becomingInput.trim() || 'Founder',
        avatar: '🦾'
      },
      rules: initialRules,
      context: contextState,
      integrations: integrations
    });
  };

  return (
    <div className="zen-container">
      <AnimatePresence mode="wait">
        
        {/* Step 0: The Ritual Greeting Screen */}
        {step === 0 && (
          <motion.div 
            key="ritual"
            className="ritual-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <AnimatePresence mode="wait">
              {ritualPhase === 0 ? (
                <motion.div 
                  key="hello"
                  className="ritual-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                >
                  Hello, Benjamin.
                </motion.div>
              ) : (
                <motion.div 
                  key="build"
                  className="ritual-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                >
                  Let's build your world.
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Step 1: Who are you becoming? */}
        {step === 1 && (
          <motion.div
            key="step1"
            className="zen-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="zen-caption">First Inquiry</span>
              <h2 className="zen-title">Who are you becoming?</h2>
            </div>

            <div style={{ marginTop: '16px' }}>
              <input
                type="text"
                className="zen-input"
                value={becomingInput}
                onChange={(e) => setBecomingInput(e.target.value)}
                placeholder="e.g. Founder"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && becomingInput.trim()) {
                    handleNextStep();
                  }
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button 
                className="zen-btn" 
                onClick={handleNextStep} 
                disabled={!becomingInput.trim()}
                style={{ width: '100%' }}
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: What are you building? */}
        {step === 2 && (
          <motion.div
            key="step2"
            className="zen-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="zen-caption">Second Inquiry</span>
              <h2 className="zen-title">What are you building?</h2>
            </div>

            <div style={{ marginTop: '16px' }}>
              <input
                type="text"
                className="zen-input"
                value={buildingInput}
                onChange={(e) => setBuildingInput(e.target.value)}
                placeholder="e.g. Atlas"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && buildingInput.trim()) {
                    handleNextStep();
                  }
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="zen-btn-outline" onClick={handlePrevStep}>
                Back
              </button>
              <button 
                className="zen-btn" 
                onClick={handleNextStep} 
                disabled={!buildingInput.trim()}
                style={{ flex: 1 }}
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: What matters most over the next 90 days? */}
        {step === 3 && (
          <motion.div
            key="step3"
            className="zen-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span className="zen-caption">Dominant objective</span>
              <h2 className="zen-title">What matters most over the next 90 days?</h2>
            </div>

            <div style={{ marginTop: '16px' }}>
              <textarea
                className="zen-textarea"
                rows={3}
                value={missionInput}
                onChange={(e) => setMissionInput(e.target.value)}
                placeholder="e.g. Acquire first 3 Atlas clients."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && missionInput.trim()) {
                    e.preventDefault();
                    handleNextStep();
                  }
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="zen-btn-outline" onClick={handlePrevStep}>
                Back
              </button>
              <button 
                className="zen-btn" 
                onClick={handleNextStep} 
                disabled={!missionInput.trim()}
                style={{ flex: 1 }}
              >
                Configure Workspace
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: William is thinking / processing */}
        {step === 4 && (
          <motion.div
            key="step4"
            className="zen-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ textAlign: 'center', gap: '24px' }}
          >
            <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Spinner animation */}
              <motion.div 
                style={{
                  width: '32px',
                  height: '32px',
                  border: '1px solid var(--border-hairline)',
                  borderTopColor: 'var(--text-primary)',
                  borderRadius: '50%'
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </div>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              William is mapping the execution context...
            </p>
          </motion.div>
        )}

        {/* Step 5: I've understood. Let's begin. */}
        {step === 5 && (
          <motion.div
            key="step5"
            className="zen-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            style={{ textAlign: 'center', gap: '32px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 className="zen-title">I've understood.</h2>
              <p className="zen-subtitle" style={{ color: 'var(--text-muted)' }}>
                Your dominant mission is set.
              </p>
            </div>

            <div style={{ marginTop: '16px' }}>
              <button 
                className="zen-btn" 
                onClick={handleComplete}
                style={{ padding: '14px 44px', fontSize: '1rem' }}
              >
                Let's begin.
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
