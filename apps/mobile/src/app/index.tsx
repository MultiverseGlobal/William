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
  StatusBar
} from 'react-native';
import type { Portrait, Journey, LibraryItem } from '@william/types';

interface ChatMessage {
  id: string;
  sender: 'william' | 'user';
  text: string;
  time: string;
}

// API Url mapping: Android emulator maps host localhost to 10.0.2.2
const API_URL = Platform.select({
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
      growth: ['Companion initialized on mobile walk.']
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

    const res = await fetchJson('/api/reasoner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: userText, session: 'mobile' })
    });

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
        {currentTab === 'portrait' && (
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
          </ScrollView>
        )}

        {/* Tab 4: Today Capture */}
        {currentTab === 'today' && (
          <View style={[styles.tabContent, { padding: 24, justifyContent: 'center' }]}>
            <View style={{ marginBottom: 40, alignItems: 'center' }}>
              <Text style={{ fontSize: 13, textTransform: 'uppercase', color: '#a1a1aa', letterSpacing: 1.5, marginBottom: 4 }}>PRESENCE WALK</Text>
              <Text style={{ fontSize: 20, color: '#f4f4f5', fontWeight: '300', textAlign: 'center' }}>What should William observe in your world?</Text>
            </View>

            {/* 3 Giant Action Capture Buttons */}
            <View style={styles.captureGrid}>
              <TouchableOpacity
                style={styles.captureBtn}
                onPress={() => setCaptureType('speak')}
              >
                <Text style={styles.captureIcon}>🎤</Text>
                <Text style={styles.captureLabel}>Speak</Text>
                <Text style={styles.captureDesc}>Simulate voice logger</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureBtn}
                onPress={() => setCaptureType('write')}
              >
                <Text style={styles.captureIcon}>⌨️</Text>
                <Text style={styles.captureLabel}>Write</Text>
                <Text style={styles.captureDesc}>Type a quick note</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.captureBtn}
                onPress={() => setCaptureType('capture')}
              >
                <Text style={styles.captureIcon}>📷</Text>
                <Text style={styles.captureLabel}>Capture</Text>
                <Text style={styles.captureDesc}>Camera observation</Text>
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
            <TouchableOpacity onPress={() => setCaptureType(null)}>
              <Text style={styles.closeBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            {captureType === 'speak' && (
              <View style={{ alignItems: 'center', marginVertical: 32 }}>
                <View style={[styles.pulseCircle, simPulse && styles.pulseActive]}>
                  <Text style={{ fontSize: 28 }}>🎤</Text>
                </View>
                <Text style={styles.pulseText}>Recording voice presence transcript...</Text>
              </View>
            )}

            {captureType === 'capture' && (
              <View style={styles.cameraFrame}>
                <Text style={{ fontSize: 13, color: '#71717a' }}>[ camera viewfinder preview ]</Text>
              </View>
            )}

            <TextInput
              style={styles.modalInput}
              value={captureText}
              onChangeText={setCaptureText}
              placeholder={
                captureType === 'speak'
                  ? 'Transcribe speaking description...'
                  : captureType === 'capture'
                  ? 'Describe what you see in this snapshot...'
                  : 'Write note details here...'
              }
              placeholderTextColor="#52525b"
              multiline
              autoFocus
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
  }
});
