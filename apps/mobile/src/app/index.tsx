import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  FlatList,
  ScrollView,
  Platform,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing
} from 'react-native';
import type { Portrait, Journey, LibraryItem } from '@william/types';

interface ChatMessage {
  id: string;
  sender: 'william' | 'user';
  text: string;
  time: string;
}

// API Url mapping: Android emulator maps host localhost to 10.0.2.2
const API_URL = process.env.EXPO_PUBLIC_API_URL || Platform.select({
  android: 'http://10.0.2.2:3005',
  ios: 'http://10.0.2.2:3005', // Fallback, can be updated to host IP
  default: 'http://localhost:3005',
});

export default function HomeScreen() {
  const [portrait, setPortrait] = useState<Portrait | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatMessage[]>([]);
  const [currentTab, setCurrentTab] = useState<'chat' | 'journey' | 'portrait' | 'today'>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [isThinking, setIsThinking] = useState(false);

  // Animated values for presence orb
  const orbScale = useRef(new Animated.Value(1)).current;
  const orbGlow = useRef(new Animated.Value(0.4)).current;
  const rippleScale1 = useRef(new Animated.Value(1)).current;
  const rippleOpacity1 = useRef(new Animated.Value(0)).current;
  const rippleScale2 = useRef(new Animated.Value(1)).current;
  const rippleOpacity2 = useRef(new Animated.Value(0)).current;

  // Onboarding states
  const [onboardStep, setOnboardStep] = useState(0);
  const [onboardName, setOnboardName] = useState('');
  const [onboardIdentity, setOnboardIdentity] = useState('');
  const [onboardDreams, setOnboardDreams] = useState('');

  // Chat inputs
  const [chatInput, setChatInput] = useState('');

  // Capturing overlays
  const [captureType, setCaptureType] = useState<null | 'speak' | 'write' | 'capture'>(null);
  const [captureText, setCaptureText] = useState('');
  const [simPulse, setSimPulse] = useState(false);

  // Breathing loop animation
  useEffect(() => {
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orbScale, {
            toValue: 1.05,
            duration: 2500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(orbGlow, {
            toValue: 0.6,
            duration: 2500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orbScale, {
            toValue: 0.95,
            duration: 2500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(orbGlow, {
            toValue: 0.3,
            duration: 2500,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    breathe.start();

    return () => breathe.stop();
  }, []);

  // Ripple visualizer loops for Speak mode & Today screen
  useEffect(() => {
    let ripple1: Animated.CompositeAnimation | null = null;
    let ripple2: Animated.CompositeAnimation | null = null;

    if (currentTab === 'today' || captureType === 'speak') {
      rippleScale1.setValue(1);
      rippleOpacity1.setValue(0.4);
      rippleScale2.setValue(1);
      rippleOpacity2.setValue(0.4);

      ripple1 = Animated.loop(
        Animated.parallel([
          Animated.timing(rippleScale1, {
            toValue: 2.2,
            duration: 3500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rippleOpacity1, {
            toValue: 0,
            duration: 3500,
            useNativeDriver: true,
          }),
        ])
      );

      ripple2 = Animated.loop(
        Animated.sequence([
          Animated.delay(1750),
          Animated.parallel([
            Animated.timing(rippleScale2, {
              toValue: 2.2,
              duration: 3500,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(rippleOpacity2, {
              toValue: 0,
              duration: 3500,
              useNativeDriver: true,
            }),
          ]),
        ])
      );

      ripple1.start();
      ripple2.start();
    } else {
      rippleOpacity1.setValue(0);
      rippleOpacity2.setValue(0);
    }

    return () => {
      ripple1?.stop();
      ripple2?.stop();
    };
  }, [currentTab, captureType]);

  // Fetch API Helper
  const fetchJson = async (endpoint: string, options?: RequestInit) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, options);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn(`Mobile Brain API offline:`, e);
    }
    return null;
  };

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    const apiPortrait = await fetchJson('/api/portrait');
    if (apiPortrait) {
      setPortrait(apiPortrait);
      
      const apiJourneys = await fetchJson('/api/journeys');
      if (apiJourneys) setJourneys(apiJourneys);

      const dChats = await fetchJson('/api/chats?session=mobile');
      if (dChats) setChatLogs(dChats);
    } else {
      // Not onboarded yet
      setPortrait(null);
    }
    setIsLoading(false);
  }

  // Handle onboarding submission
  const handleOnboardSubmit = async () => {
    const freshPortrait: Portrait = {
      name: onboardName.trim(),
      identity: onboardIdentity.trim(),
      dreams: onboardDreams.trim(),
      values: 'Authenticity, Agency',
      principles: 'Patience, Stoic execution',
      strengths: 'Analytical reasoning',
      blind_spots: 'Isolation',
      relationships: 'Companion circle',
      decision_patterns: [],
      growth: ['Companion initialized on mobile walk.'],
      cognitiveProfile: {
        problemSolvingStyle: 'System-builder (prefers architectural foundations over spontaneous routines)',
        temporalBias: 'Underestimates 3-month compound growth; overestimates 1-week execution limits',
        attentionSpan: 'High-intensity deep work blocks, susceptible to rapid burnout if rest is neglected',
        decisionHeuristics: 'Prefers writing structured code to resolve ambiguity rather than discussing specs'
      },
      activeBeliefs: [
        {
          belief: 'I must build complete foundations before exposing ideas.',
          strength: 0.8,
          lastTested: 'Today',
          evolution: 'Initial baseline seeded during onboarding.'
        }
      ]
    };

    setIsLoading(true);
    // Initialize Portrait
    await fetchJson('/api/portrait', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(freshPortrait)
    });

    // Seed default journeys
    const defaultJourneys: Journey[] = [
      {
        id: 'j1',
        category: 'mental',
        icon: '🧠',
        title: 'Mental Clarity',
        currentState: 'Experiencing high cognitive noise.',
        vision: 'Develop an unshakeable focus for architectural creation.',
        progress: 25,
        milestones: [
          { id: 'm1', text: 'Daily 15-minute quiet morning walk', completed: false },
          { id: 'm2', text: 'Define primary study bounds', completed: true }
        ],
        memories: ['First walk felt disorganized, but quieted down around minute 10.'],
        lessons: ['Focus is a function of eliminated distractions, not effort.'],
        timeline: [{ date: 'Today', text: 'Mobile walk session completed.' }]
      },
      {
        id: 'j2',
        category: 'physical',
        icon: '💪',
        title: 'Physical Strength',
        currentState: 'Stiff from sitting at compile stations.',
        vision: 'Restore full flexibility and functional core capacity.',
        progress: 10,
        milestones: [
          { id: 'm3', text: '3 weekly movement sessions', completed: false }
        ],
        memories: [],
        lessons: [],
        timeline: []
      }
    ];

    for (const j of defaultJourneys) {
      await fetchJson('/api/journeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(j)
      });
    }

    setPortrait(freshPortrait);
    setJourneys(defaultJourneys);
    setIsLoading(false);
  };

  // Send message to brain
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    setChatInput('');

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: `muser_${Date.now()}`, sender: 'user', text: userText, time };
    setChatLogs(prev => [...prev, userMsg]);
    setIsThinking(true);

    const res = await fetchJson('/api/reasoner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: userText, session: 'mobile' })
    });

    setIsThinking(false);

    if (res && res.reply) {
      setChatLogs(prev => [...prev, {
        id: `mwilliam_${Date.now()}`,
        sender: 'william',
        text: res.reply,
        time
      }]);
    }
  };

  // Save mobile presence capture
  const handleSaveCapture = async () => {
    if (!captureText.trim()) return;
    const text = captureText.trim();
    setCaptureText('');

    const typeLabel = captureType === 'speak' ? 'Speech log' : captureType === 'capture' ? 'Camera snap' : 'Note capture';
    const tag = captureType === 'speak' ? 'audio' : captureType === 'capture' ? 'image' : 'note';

    // Post note to library
    const newItem: LibraryItem = {
      id: `l_${Date.now()}`,
      type: 'note',
      title: `${typeLabel} - ${new Date().toLocaleDateString()}`,
      content: text,
      dateAdded: 'Today',
      tags: [tag, 'mobile']
    };

    await fetchJson('/api/library', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });

    // Update Portrait
    if (portrait) {
      const updatedPortrait = {
        ...portrait,
        growth: [...portrait.growth, `Captured mobile walk ${tag}: "${text.substring(0, 40)}..."`]
      };
      setPortrait(updatedPortrait);
      await fetchJson('/api/portrait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPortrait)
      });
    }

    // Append to Journey timeline
    const updatedJourneys = journeys.map((j) => {
      if (j.id === 'j1') {
        const updatedJ = {
          ...j,
          timeline: [{ date: 'Today', text: `${typeLabel}: ${text}` }, ...j.timeline]
        };
        fetchJson('/api/journeys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedJ)
        });
        return updatedJ;
      }
      return j;
    });
    setJourneys(updatedJourneys);

    // Save history logs
    await fetchJson('/api/chronicle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `Captured [${typeLabel}] on mobile: "${text}"`, category: 'thought' })
    });

    setCaptureType(null);
  };

  // Toggle milestone completion
  const handleToggleMilestone = async (journeyId: string, milestoneId: string) => {
    const updatedJourneys = journeys.map((j) => {
      if (j.id === journeyId) {
        const updatedJ = {
          ...j,
          milestones: j.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m)
        };
        // Recalculate progress percentage
        const completedCount = updatedJ.milestones.filter(m => m.completed).length;
        updatedJ.progress = Math.round((completedCount / updatedJ.milestones.length) * 100);

        fetchJson('/api/journeys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedJ)
        });
        return updatedJ;
      }
      return j;
    });
    setJourneys(updatedJourneys);
  };

  // Pulse voice recorder simulation
  useEffect(() => {
    let interval: any;
    if (captureType === 'speak') {
      setSimPulse(true);
      interval = setInterval(() => {
        setSimPulse(prev => !prev);
      }, 600);
    }
    return () => clearInterval(interval);
  }, [captureType]);

  // Loading spinner
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#ffffff" />
        <Text style={styles.loadingText}>Connecting to William's Brain...</Text>
      </View>
    );
  }

  // 1. Render Onboarding
  if (!portrait) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.onboardContainer}>
          <Text style={styles.onboardTitle}>William</Text>
          <Text style={styles.onboardSubtitle}>Before we walk together, let me understand your place.</Text>

          {onboardStep === 0 && (
            <View style={styles.onboardStep}>
              <Text style={styles.onboardLabel}>What name should I address you by?</Text>
              <TextInput
                style={styles.textInput}
                value={onboardName}
                onChangeText={setOnboardName}
                placeholder="e.g. Benjamin"
                placeholderTextColor="#52525b"
                autoFocus
              />
              <TouchableOpacity
                style={styles.onboardButton}
                disabled={!onboardName.trim()}
                onPress={() => setOnboardStep(1)}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {onboardStep === 1 && (
            <View style={styles.onboardStep}>
              <Text style={styles.onboardLabel}>How would you describe the identity you're working toward?</Text>
              <TextInput
                style={styles.textInput}
                value={onboardIdentity}
                onChangeText={setOnboardIdentity}
                placeholder="e.g. A focused developer building lasting systems"
                placeholderTextColor="#52525b"
                autoFocus
              />
              <TouchableOpacity
                style={styles.onboardButton}
                disabled={!onboardIdentity.trim()}
                onPress={() => setOnboardStep(2)}
              >
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {onboardStep === 2 && (
            <View style={styles.onboardStep}>
              <Text style={styles.onboardLabel}>What is the primary long-term dream or project (e.g. Atlas)?</Text>
              <TextInput
                style={styles.textInput}
                value={onboardDreams}
                onChangeText={setOnboardDreams}
                placeholder="e.g. Compiling the Atlas strategic architecture"
                placeholderTextColor="#52525b"
                autoFocus
              />
              <TouchableOpacity
                style={styles.onboardButton}
                disabled={!onboardDreams.trim()}
                onPress={handleOnboardSubmit}
              >
                <Text style={styles.buttonText}>Begin Walk</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // 2. Render Main Application
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerLogo}>🧭 William</Text>
        <Text style={styles.headerState}>Walk companion • Connected</Text>
      </View>

      {/* Screen contents */}
      <View style={styles.content}>
        
        {/* Tab 1: William Chat */}
        {currentTab === 'chat' && (
          <View style={styles.tabContent}>
            <FlatList
              data={chatLogs}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.chatList}
              renderItem={({ item }) => (
                <View style={[
                  styles.chatBubble,
                  item.sender === 'user' ? styles.userBubble : styles.williamBubble
                ]}>
                  <Text style={styles.chatSender}>
                    {item.sender === 'user' ? portrait.name : 'William'}
                  </Text>
                  <Text style={styles.chatText}>{item.text}</Text>
                  <Text style={styles.chatTime}>{item.time}</Text>
                </View>
              )}
            />
            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Talk to William..."
                placeholderTextColor="#71717a"
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
                <Text style={styles.sendButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tab 2: Journey Track */}
        {currentTab === 'journey' && (
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.scrollPadding}>
            <Text style={styles.tabTitle}>Active Journeys</Text>
            {journeys.map((j) => (
              <View key={j.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{j.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{j.title}</Text>
                    <Text style={styles.cardState}>{j.currentState}</Text>
                  </View>
                  <Text style={styles.progressPct}>{j.progress}%</Text>
                </View>
                
                <Text style={styles.sectionLabel}>Milestones Checklist</Text>
                {j.milestones.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={styles.checkItem}
                    onPress={() => handleToggleMilestone(j.id, m.id)}
                  >
                    <View style={[styles.checkbox, m.completed && styles.checkedBox]}>
                      {m.completed && <Text style={{ fontSize: 9, color: '#000' }}>✓</Text>}
                    </View>
                    <Text style={[styles.checkText, m.completed && styles.completedText]}>{m.text}</Text>
                  </TouchableOpacity>
                ))}

                {j.timeline && j.timeline.length > 0 && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.sectionLabel}>Journey Timeline logs</Text>
                    {j.timeline.slice(0, 2).map((t, idx) => (
                      <View key={idx} style={styles.timelineRow}>
                        <Text style={styles.timelineDate}>{t.date}</Text>
                        <Text style={styles.timelineText}>{t.text}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}

        {/* Tab 3: Portrait Biography */}
        {currentTab === 'portrait' && portrait && (
          <ScrollView style={styles.tabContent} contentContainerStyle={styles.scrollPadding}>
            <Text style={styles.tabTitle}>Your Biography</Text>
            
            <View style={styles.bioCard}>
              <Text style={styles.bioTitle}>Identity</Text>
              <Text style={styles.bioBody}>{portrait.identity}</Text>
            </View>

            <View style={styles.bioCard}>
              <Text style={styles.bioTitle}>Dreams & Projects</Text>
              <Text style={styles.bioBody}>{portrait.dreams}</Text>
            </View>

            <View style={styles.bioCard}>
              <Text style={styles.bioTitle}>Strengths</Text>
              <Text style={styles.bioBody}>{portrait.strengths}</Text>
            </View>

            <View style={styles.bioCard}>
              <Text style={styles.bioTitle}>Principles</Text>
              <Text style={styles.bioBody}>{portrait.principles}</Text>
            </View>

            <View style={styles.bioCard}>
              <Text style={styles.bioTitle}>Blind Spots</Text>
              <Text style={styles.bioBody}>{portrait.blind_spots}</Text>
            </View>

            {/* Cognitive Profile Card */}
            <View style={[styles.bioCard, { borderTopWidth: 1, borderTopColor: '#27272a', marginTop: 12, paddingTop: 16 }]}>
              <Text style={[styles.bioTitle, { color: '#a1a1aa' }]}>Cognitive Style</Text>
              <Text style={[styles.bioBody, { fontSize: 13, marginBottom: 8 }]}>
                <Text style={{ fontWeight: 'bold', color: '#e4e4e7' }}>Style: </Text>
                {portrait.cognitiveProfile?.problemSolvingStyle}
              </Text>
              <Text style={[styles.bioBody, { fontSize: 13, marginBottom: 8 }]}>
                <Text style={{ fontWeight: 'bold', color: '#e4e4e7' }}>Temporal Bias: </Text>
                {portrait.cognitiveProfile?.temporalBias}
              </Text>
              <Text style={[styles.bioBody, { fontSize: 13, marginBottom: 8 }]}>
                <Text style={{ fontWeight: 'bold', color: '#e4e4e7' }}>Attention: </Text>
                {portrait.cognitiveProfile?.attentionSpan}
              </Text>
              <Text style={[styles.bioBody, { fontSize: 13 }]}>
                <Text style={{ fontWeight: 'bold', color: '#e4e4e7' }}>Heuristics: </Text>
                {portrait.cognitiveProfile?.decisionHeuristics}
              </Text>
            </View>

            {/* Active Beliefs Card */}
            <View style={styles.bioCard}>
              <Text style={[styles.bioTitle, { color: '#a1a1aa' }]}>Active Beliefs</Text>
              {(portrait.activeBeliefs || []).map((item, idx) => (
                <View key={idx} style={{ borderLeftWidth: 2, borderLeftColor: '#52525b', paddingLeft: 10, marginBottom: 12 }}>
                  <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '500' }}>
                    {item.belief} ({Math.round(item.strength * 100)}%)
                  </Text>
                  <Text style={{ color: '#a1a1aa', fontSize: 11, marginTop: 2 }}>
                    Evolution: {item.evolution}
                  </Text>
                </View>
              ))}
              {(!portrait.activeBeliefs || portrait.activeBeliefs.length === 0) && (
                <Text style={styles.bioBody}>No active beliefs tracked yet.</Text>
              )}
            </View>
          </ScrollView>
        )}

        {/* Tab 4: Today (Presence Walk) */}
        {currentTab === 'today' && (
          <View style={[styles.tabContent, { padding: 24, justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#000000' }]}>
            
            {/* Top status header */}
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <Text style={{ fontSize: 10, textTransform: 'uppercase', color: '#71717a', letterSpacing: 2 }}>William Presence</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: isThinking ? '#a78bfa' : '#10b981' }} />
                <Text style={{ fontSize: 12, color: '#a1a1aa' }}>
                  {isThinking ? 'Thinking...' : 'Idle'}
                </Text>
              </View>
            </View>

            {/* Central Animated Breathing Orb */}
            <View style={styles.orbWrapper}>
              {/* Ripple circles */}
              <Animated.View 
                style={[
                  styles.orbRippleRing,
                  {
                    transform: [{ scale: rippleScale1 }],
                    opacity: rippleOpacity1
                  }
                ]}
              />
              <Animated.View 
                style={[
                  styles.orbRippleRing,
                  {
                    transform: [{ scale: rippleScale2 }],
                    opacity: rippleOpacity2
                  }
                ]}
              />

              {/* Glassmorphic frosted boundary */}
              <View style={styles.orbGlassShield} />

              {/* Outer glow aura */}
              <Animated.View 
                style={[
                  styles.orbOuterGlow,
                  {
                    transform: [{ scale: orbScale }],
                    opacity: orbGlow
                  }
                ]}
              />

              {/* Central Sphere */}
              <Animated.View 
                style={[
                  styles.orbSphere,
                  {
                    transform: [{ scale: orbScale }]
                  }
                ]}
              >
                {/* Core breathing center */}
                <View style={styles.orbCore} />
              </Animated.View>
            </View>

            {/* Dialogue bubble */}
            <View style={{ width: '100%', paddingHorizontal: 12, marginBottom: 16, minHeight: 80, justifyContent: 'center' }}>
              {isThinking ? (
                <ActivityIndicator size="small" color="#ffffff" style={{ opacity: 0.5 }} />
              ) : (
                <Text style={{ fontSize: 16, color: '#f4f4f5', textAlign: 'center', fontStyle: 'italic', lineHeight: 24, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
                  {chatLogs.length > 0 && chatLogs.filter(l => l.sender === 'william').length > 0
                    ? `"${chatLogs.filter(l => l.sender === 'william').slice(-1)[0].text}"`
                    : '"Walk with me. Speak your mind, or write down what feels heavy."'}
                </Text>
              )}
            </View>

            {/* Actions & Prompts list */}
            <View style={{ width: '100%', gap: 16, marginBottom: 12 }}>
              
              {/* Suggestions pills */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                <TouchableOpacity 
                  style={styles.pillButton} 
                  onPress={() => {
                    setCaptureType('speak');
                  }}
                >
                  <Text style={styles.pillText}>🎤 Speak observation</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.pillButton} 
                  onPress={() => {
                    setCaptureType('write');
                  }}
                >
                  <Text style={styles.pillText}>⌨️ Write note</Text>
                </TouchableOpacity>
              </View>

              {/* Main giant record bar button */}
              <TouchableOpacity 
                style={styles.voiceRecordBar}
                onPress={() => setCaptureType('speak')}
              >
                <View style={styles.voiceRecordDot} />
                <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '600', letterSpacing: 0.5 }}>START VOICE WALK</Text>
              </TouchableOpacity>

            </View>

          </View>
        )}

      </View>

      {/* Capture Full-Screen Modals */}
      <Modal
        visible={captureType !== null}
        animationType="slide"
        transparent={true}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {captureType === 'speak' ? 'Speech Recorder' : captureType === 'capture' ? 'Camera view' : 'Capture thought'}
            </Text>
            <TouchableOpacity onPress={() => { setCaptureType(null); setCaptureText(''); }}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {captureType === 'speak' && (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 32 }}>
                {/* Visualizer concentric ripples */}
                <View style={styles.visualizerWrapper}>
                  
                  {/* Ripple Wave 1 */}
                  <Animated.View 
                    style={[
                      styles.orbPulseRing,
                      {
                        transform: [{ scale: rippleScale1 }],
                        opacity: rippleOpacity1
                      }
                    ]}
                  />

                  {/* Ripple Wave 2 */}
                  <Animated.View 
                    style={[
                      styles.orbPulseRing,
                      {
                        transform: [{ scale: rippleScale2 }],
                        opacity: rippleOpacity2
                      }
                    ]}
                  />

                  {/* Visualizer center core */}
                  <Animated.View 
                    style={[
                      styles.orbSphere,
                      {
                        transform: [{ scale: orbScale }],
                        backgroundColor: '#a78bfa'
                      }
                    ]}
                  />

                </View>
                <Text style={styles.pulseText}>William is capturing presence walk logs...</Text>
              </View>
            )}

            {captureType === 'capture' && (
              <View style={styles.cameraFrame}>
                <Text style={{ fontSize: 13, color: '#71717a' }}>[ camera view finder preview ]</Text>
              </View>
            )}

            <TextInput
              style={[
                styles.modalInput,
                captureType === 'speak' && { maxHeight: 100, flex: 0, height: 100 }
              ]}
              value={captureText}
              onChangeText={setCaptureText}
              placeholder={
                captureType === 'speak'
                  ? 'Transcribing speaking description...'
                  : captureType === 'capture'
                  ? 'Describe what you see in this snapshot...'
                  : 'Write note details here...'
              }
              placeholderTextColor="#52525b"
              multiline
              autoFocus={captureType !== 'speak'}
            />

            <TouchableOpacity
              style={styles.saveButton}
              disabled={!captureText.trim()}
              onPress={handleSaveCapture}
            >
              <Text style={styles.saveButtonText}>Save Observation</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Bottom Tabs navigation bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('chat')}
        >
          <Text style={[styles.navIcon, currentTab === 'chat' && styles.activeNavText]}>💬</Text>
          <Text style={[styles.navText, currentTab === 'chat' && styles.activeNavText]}>William</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('journey')}
        >
          <Text style={[styles.navIcon, currentTab === 'journey' && styles.activeNavText]}>🧭</Text>
          <Text style={[styles.navText, currentTab === 'journey' && styles.activeNavText]}>Journey</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('portrait')}
        >
          <Text style={[styles.navIcon, currentTab === 'portrait' && styles.activeNavText]}>📖</Text>
          <Text style={[styles.navText, currentTab === 'portrait' && styles.activeNavText]}>Portrait</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('today')}
        >
          <Text style={[styles.navIcon, currentTab === 'today' && styles.activeNavText]}>⚡</Text>
          <Text style={[styles.navText, currentTab === 'today' && styles.activeNavText]}>Today</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#09090b',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12
  },
  loadingText: {
    color: '#a1a1aa',
    fontSize: 13
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  headerLogo: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500'
  },
  headerState: {
    color: '#71717a',
    fontSize: 11
  },
  content: {
    flex: 1
  },
  tabContent: {
    flex: 1,
  },
  scrollPadding: {
    padding: 20,
    paddingBottom: 40
  },
  tabTitle: {
    fontSize: 18,
    fontWeight: '300',
    color: '#ffffff',
    marginBottom: 20
  },
  card: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    paddingBottom: 12,
    marginBottom: 12
  },
  cardIcon: {
    fontSize: 24
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff'
  },
  cardState: {
    fontSize: 11,
    color: '#a1a1aa',
    marginTop: 2
  },
  progressPct: {
    fontSize: 15,
    fontWeight: '300',
    color: '#ffffff'
  },
  sectionLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    color: '#71717a',
    letterSpacing: 1.2,
    marginVertical: 8
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6
  },
  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#71717a',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkedBox: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff'
  },
  checkText: {
    color: '#f4f4f5',
    fontSize: 13
  },
  completedText: {
    color: '#71717a',
    textDecorationLine: 'line-through'
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6
  },
  timelineDate: {
    width: 52,
    color: '#71717a',
    fontSize: 11
  },
  timelineText: {
    color: '#a1a1aa',
    fontSize: 12,
    flex: 1
  },
  bioCard: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16
  },
  bioTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    color: '#a1a1aa',
    letterSpacing: 1.2,
    marginBottom: 6
  },
  bioBody: {
    fontSize: 14,
    color: '#f4f4f5',
    lineHeight: 20
  },
  captureGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  captureBtn: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  captureIcon: {
    fontSize: 28,
    marginBottom: 6
  },
  captureLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#ffffff'
  },
  captureDesc: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 2
  },
  chatList: {
    padding: 16,
    gap: 12
  },
  chatBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: '85%'
  },
  userBubble: {
    backgroundColor: '#27272a',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 2
  },
  williamBubble: {
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 2
  },
  chatSender: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: '#a1a1aa',
    marginBottom: 4
  },
  chatText: {
    color: '#f4f4f5',
    fontSize: 14,
    lineHeight: 18
  },
  chatTime: {
    fontSize: 8,
    color: '#71717a',
    alignSelf: 'flex-end',
    marginTop: 4
  },
  chatInputContainer: {
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
    backgroundColor: '#09090b'
  },
  chatInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 19,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 13
  },
  sendButton: {
    paddingHorizontal: 16,
    height: 38,
    backgroundColor: '#ffffff',
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600'
  },
  navBar: {
    height: 64,
    borderTopWidth: 1,
    borderTopColor: '#27272a',
    flexDirection: 'row',
    backgroundColor: '#09090b',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4
  },
  navIcon: {
    fontSize: 18,
    color: '#71717a'
  },
  navText: {
    fontSize: 9,
    color: '#71717a'
  },
  activeNavText: {
    color: '#ffffff'
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: '#09090b'
  },
  modalHeader: {
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500'
  },
  closeBtnText: {
    color: '#a1a1aa',
    fontSize: 13
  },
  modalContent: {
    flex: 1,
    padding: 24,
    gap: 16
  },
  pulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pulseActive: {
    borderColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  pulseText: {
    fontSize: 11,
    color: '#a1a1aa',
    marginTop: 12
  },
  cameraFrame: {
    height: 200,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalInput: {
    flex: 1,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 14,
    textAlignVertical: 'top'
  },
  saveButton: {
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600'
  },
  // Onboarding screens
  onboardContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12
  },
  onboardTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: '#ffffff',
    textAlign: 'center'
  },
  onboardSubtitle: {
    fontSize: 14,
    color: '#a1a1aa',
    textAlign: 'center',
    marginBottom: 40
  },
  onboardStep: {
    gap: 16
  },
  onboardLabel: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '400',
    lineHeight: 22
  },
  textInput: {
    height: 48,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a',
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 14
  },
  onboardButton: {
    height: 48,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12
  },
  buttonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600'
  },
  // Glowing breathing orb styles
  orbWrapper: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  orbOuterGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#8b5cf6', // Indigo glow aura
    opacity: 0.35,
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.85,
    shadowRadius: 40,
    elevation: 8
  },
  orbGlassShield: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4
  },
  orbRippleRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: '#06b6d4',
  },
  orbSphere: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#06b6d4', // Cyan main sphere
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#06b6d4',
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  orbCore: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    opacity: 0.95,
    shadowColor: '#ffffff',
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4
  },
  pillButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#18181b',
    borderWidth: 1,
    borderColor: '#27272a'
  },
  pillText: {
    color: '#a1a1aa',
    fontSize: 12,
    fontWeight: '500'
  },
  voiceRecordBar: {
    width: '100%',
    height: 52,
    backgroundColor: '#1c1917',
    borderWidth: 1,
    borderColor: '#44403c',
    borderRadius: 26,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10
  },
  voiceRecordDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444'
  },
  // Visualizer ripples
  visualizerWrapper: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  orbPulseRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#a78bfa',
    backgroundColor: 'transparent'
  }
});
