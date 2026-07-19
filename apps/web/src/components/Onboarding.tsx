import React, { useState, useEffect, useRef } from 'react';
import type { ConstitutionRule, ContextState, Integration, Portrait, Journey, LibraryItem } from '@william/types';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingProps {
  onComplete: (data: {
    username: string;
    portrait: Portrait;
    journeys: Journey[];
    library: LibraryItem[];
    rules: ConstitutionRule[];
    context: Partial<ContextState>;
    integrations: Integration[];
  }) => void;
}

interface ChatMessage {
  id: string;
  sender: 'william' | 'user';
  text: string;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Portrait questionnaire state variables
  const [userName, setUserName] = useState<string>('');
  const [identity, setIdentity] = useState<string>('');
  const [values, setValues] = useState<string>('');
  const [building, setBuilding] = useState<string>('');
  const [burdens, setBurdens] = useState<string>('');
  const [strengths, setStrengths] = useState<string>('');
  const [struggles, setStruggles] = useState<string>('');
  const [principles, setPrinciples] = useState<string>('');
  const [meaning, setMeaning] = useState<string>('');

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initial intro sequence
  useEffect(() => {
    const runIntro = async () => {
      setIsTyping(true);
      
      // Step 0: Hello.
      await new Promise((r) => setTimeout(r, 1000));
      setMessages((prev) => [...prev, { id: 'm0', sender: 'william', text: 'Hello.' }]);
      
      // Step 1: I'm William.
      await new Promise((r) => setTimeout(r, 2000));
      setMessages((prev) => [...prev, { id: 'm1', sender: 'william', text: "I'm William." }]);
      
      // Step 2: Philosophy intro.
      await new Promise((r) => setTimeout(r, 2200));
      setMessages((prev) => [
        ...prev, 
        { 
          id: 'm2', 
          sender: 'william', 
          text: 'Before I can help you become who you want to become, I need to understand who you are.' 
        }
      ]);
      
      // Step 3: Ask Name.
      await new Promise((r) => setTimeout(r, 2500));
      setMessages((prev) => [
        ...prev, 
        { 
          id: 'm3', 
          sender: 'william', 
          text: 'What should I call you?' 
        }
      ]);
      
      setIsTyping(false);
      setCurrentStep(1); // Ready for name input
    };

    runIntro();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping) return;

    const userText = inputText.trim();
    setInputText('');

    // Add user message to log
    setMessages((prev) => [...prev, { id: `u_${Date.now()}`, sender: 'user', text: userText }]);
    setIsTyping(true);

    // Pause to simulate listening and thinking
    await new Promise((r) => setTimeout(r, 1200));

    // Handle flow based on steps
    let nextQuestion = '';
    
    switch (currentStep) {
      case 1: // Name answered
        setUserName(userText);
        nextQuestion = `Nice to meet you, ${userText}. Who are you trying to become?`;
        setCurrentStep(2);
        break;

      case 2: // Identity answered
        setIdentity(userText);
        nextQuestion = 'Why does that matter to you?';
        setCurrentStep(3);
        break;

      case 3: // Values answered
        setValues(userText);
        nextQuestion = 'What are you building?';
        setCurrentStep(4);
        break;

      case 4: // Projects/building answered
        setBuilding(userText);
        nextQuestion = 'What burdens are you currently carrying?';
        setCurrentStep(5);
        break;

      case 5: // Burdens answered
        setBurdens(userText);
        nextQuestion = 'What strengths do you rely on most?';
        setCurrentStep(6);
        break;

      case 6: // Strengths answered
        setStrengths(userText);
        nextQuestion = 'Where do you struggle most?';
        setCurrentStep(7);
        break;

      case 7: // Struggles answered
        setStruggles(userText);
        nextQuestion = 'What principles guide your decisions?';
        setCurrentStep(8);
        break;

      case 8: // Principles answered
        setPrinciples(userText);
        nextQuestion = 'What gives your life meaning?';
        setCurrentStep(9);
        break;

      case 9: // Meaning answered
        setMeaning(userText);
        nextQuestion = `Thank you, ${userName}. I have assembled the first brushstrokes of your Portrait. Let's begin our journey.`;
        setCurrentStep(10); // Finished!
        break;

      default:
        break;
    }

    setMessages((prev) => [...prev, { id: `w_${Date.now()}`, sender: 'william', text: nextQuestion }]);
    setIsTyping(false);
  };

  const handleComplete = () => {
    // Construct refined Portrait structure from onboarding conversation answers
    const portraitData: Portrait = {
      name: userName,
      identity: identity,
      values: `${values}. Meaning: ${meaning}.`,
      principles: principles,
      strengths: strengths,
      blind_spots: `Burdens: ${burdens}. Struggles: ${struggles}.`,
      dreams: building,
      relationships: 'Companion circle',
      decision_patterns: ['Prefers system redesign over raw motivation'],
      growth: ['Portrait established through initial dialogue.']
    };

    // Initialize 5 primary Journeys
    const initialJourneys: Journey[] = [
      {
        id: 'j1',
        category: 'mental',
        icon: '🧠',
        title: 'Mental Journey',
        currentState: 'Beginning strategy & presence check-ins.',
        vision: 'Clarity, patience, and high cognitive agency.',
        milestones: [
          { id: 'm1_1', text: 'Maintain daily morning strategy block', completed: false },
          { id: 'm1_2', text: 'Reflect on evening decisions', completed: false }
        ],
        memories: ['Onboarding conversation with William established'],
        lessons: ['Focus on systems rather than relying on sheer willpower.'],
        progress: 20,
        timeline: [{ date: 'Today', text: 'Started mental companion journey with William' }]
      },
      {
        id: 'j2',
        category: 'physical',
        icon: '💪',
        title: 'Physical Journey',
        currentState: 'Struggling to keep routines during high-stress weeks.',
        vision: 'Restored workout pacing and daily physical energy.',
        milestones: [
          { id: 'm2_1', text: 'Run 3 times a week', completed: false },
          { id: 'm2_2', text: 'Bedtime wind-down by 10:30 PM', completed: false }
        ],
        memories: ['Recognized that stress breaks physical routines'],
        lessons: ['One meaningful step in each important area is enough.'],
        progress: 15,
        timeline: [{ date: 'Today', text: 'Set baseline physical habits' }]
      },
      {
        id: 'j3',
        category: 'financial',
        icon: '💰',
        title: 'Financial Journey',
        currentState: 'Constructing independent products.',
        vision: 'Long-term financial system decoupling time from income.',
        milestones: [
          { id: 'm3_1', text: 'Launch version 1 of project', completed: false },
          { id: 'm3_2', text: 'Acquire first 3 clients', completed: false }
        ],
        memories: ['Began constructing Atlas project'],
        lessons: ['Focus engineering blocks on what moves the client metrics'],
        progress: 10,
        timeline: [{ date: 'Today', text: 'Began strategic tracking of projects' }]
      },
      {
        id: 'j4',
        category: 'relationships',
        icon: '❤️',
        title: 'Relationships Journey',
        currentState: 'Balanced and intentional connections.',
        vision: 'Deepening family bonds and peer partner dialogue.',
        milestones: [
          { id: 'm4_1', text: 'Call Mum weekly', completed: false },
          { id: 'm4_2', text: 'Support founder peers', completed: false }
        ],
        memories: ['Admitted that no human should have to face limitations alone'],
        lessons: ['Preserve human agency while sharing cognitive burden'],
        progress: 30,
        timeline: [{ date: 'Today', text: 'Committed to weekly check-ins' }]
      },
      {
        id: 'j5',
        category: 'legacy',
        icon: '🌍',
        title: 'Legacy Journey',
        currentState: 'Designing systems for human actualization.',
        vision: 'Empowering self-becoming rather than corporate checklists.',
        milestones: [
          { id: 'm5_1', text: 'Deliver the study experience interface', completed: false },
          { id: 'm5_2', text: 'Formulate a tool for companion growth', completed: false }
        ],
        memories: ['Conceived companion system for human actualization'],
        lessons: ['Transform the operator, do not merely complete tasks.'],
        progress: 5,
        timeline: [{ date: 'Today', text: 'Conceptualized legacy milestone tracks' }]
      }
    ];

    // Initialize 4 primary Library items
    const initialLibrary: LibraryItem[] = [
      {
        id: 'l1',
        type: 'book',
        title: 'Meditations',
        author: 'Marcus Aurelius',
        content: 'You have power over your mind - not outside events. Realize this, and you will find strength.',
        dateAdded: 'Today',
        tags: ['Philosophy', 'Stoicism']
      },
      {
        id: 'l2',
        type: 'quote',
        title: 'Stoic Obstacles',
        content: 'The obstacle in the path becomes the path. Never forget that within every obstacle is an opportunity to improve our condition.',
        dateAdded: 'Today',
        tags: ['Stoicism', 'Strategy']
      },
      {
        id: 'l3',
        type: 'lesson',
        title: 'Systems Over Motivation',
        content: 'When routines consistently break after periods of stress, redesign your system instead of relying on motivation.',
        dateAdded: 'Today',
        tags: ['Systems', 'Self-Actualization']
      },
      {
        id: 'l4',
        type: 'idea',
        title: 'Core Philosophy',
        content: 'Every human is limited. No human should have to face those limitations alone.',
        dateAdded: 'Today',
        tags: ['Philosophy', 'William']
      }
    ];

    // Initialize clean rules
    const initialRules: ConstitutionRule[] = [
      { 
        id: 'r1', 
        user_id: 'u1', 
        rule_text: principles.substring(0, 100) || 'Act with alignment to principles.', 
        category: 'priority', 
        is_active: true, 
        created_at: new Date().toISOString() 
      },
      { 
        id: 'r2', 
        user_id: 'u1', 
        rule_text: 'Reduce cognitive load, prioritize breathing room.', 
        category: 'recovery', 
        is_active: true, 
        created_at: new Date().toISOString() 
      }
    ];

    const contextState: Partial<ContextState> = {
      id: 'c1',
      user_id: 'u1',
      current_energy: 8,
      focus_score: 8,
      tasks_today: [],
      meetings_today: [],
      goals: [building],
      last_updated_at: new Date().toISOString()
    };

    const integrations: Integration[] = [
      { id: 'i1', user_id: 'u1', provider: 'google', connected: false, connected_at: new Date().toISOString(), last_synced_at: null },
      { id: 'i2', user_id: 'u1', provider: 'notion', connected: false, connected_at: new Date().toISOString(), last_synced_at: null }
    ];

    onComplete({
      username: userName,
      portrait: portraitData,
      journeys: initialJourneys,
      library: initialLibrary,
      rules: initialRules,
      context: contextState,
      integrations: integrations
    });
  };

  return (
    <div className="zen-container" style={{ justifyContent: 'space-between', padding: '40px 24px', backgroundColor: '#09090b', color: '#f4f4f5' }}>
      
      {/* Scrollable Conversation container */}
      <div 
        style={{ 
          width: '100%', 
          maxWidth: '560px', 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px 0', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '24px',
          scrollBehavior: 'smooth'
        }}
      >
        <AnimatePresence>
          {messages.map((msg, index) => {
            const isLatest = index === messages.length - 1;
            const isWilliam = msg.sender === 'william';
            
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: isLatest ? 1 : 0.4, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isWilliam ? 'flex-start' : 'flex-end',
                  width: '100%',
                  gap: '4px'
                }}
              >
                {isWilliam && (
                  <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
                    William
                  </span>
                )}
                <div
                  style={{
                    fontWeight: 300,
                    lineHeight: 1.5,
                    maxWidth: '85%',
                    color: isWilliam ? '#f4f4f5' : '#a1a1aa',
                    whiteSpace: 'pre-wrap',
                    fontFamily: isWilliam ? 'var(--font-sans)' : 'var(--font-cursive)',
                    fontSize: isWilliam ? '1.0625rem' : '1.375rem'
                  }}
                >
                  {msg.text}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            style={{ display: 'flex', gap: '4px', padding: '8px 0' }}
          >
            <span style={{ fontSize: '0.75rem', color: '#a1a1aa', fontStyle: 'italic' }}>William is thinking...</span>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input / Control Panel at bottom */}
      <div style={{ width: '100%', maxWidth: '560px', marginTop: '24px' }}>
        {currentStep < 10 ? (
          <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="text"
              className="zen-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={currentStep === 0 ? "Wait for William..." : "Speak your mind..."}
              disabled={currentStep === 0 || isTyping}
              autoFocus
              style={{
                borderBottomColor: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                caretColor: '#ffffff',
                fontSize: '1.125rem'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'rgba(255,255,255,0.3)' }}>
              <span>Onboarding Conversation</span>
              <span>Press Enter to respond</span>
            </div>
          </form>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
          >
            <button 
              className="zen-btn" 
              onClick={handleComplete}
              style={{ 
                width: '100%', 
                padding: '14px 0', 
                backgroundColor: '#ffffff', 
                color: '#09090b', 
                fontWeight: 600,
                borderRadius: '8px',
                fontSize: '0.9375rem'
              }}
            >
              Let's begin.
            </button>
          </motion.div>
        )}
      </div>

    </div>
  );
};
