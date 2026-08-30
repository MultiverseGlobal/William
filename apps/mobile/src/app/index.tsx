/**
 * HomeScreen — Typographic Edition
 *
 * The word is the interface.
 *   - Resting:    "orion" + still hairline
 *   - Listening:  tracking compresses, hairline waveforms
 *   - Processing: hairline pulses, first words of response appear below
 *
 * No orb. No AI gradient sphere. Not competing in that crowd.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  StatusBar,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withRepeat,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useOrionStore } from '../store/useOrionStore';
import { Colors } from '../theme/colors';
import { ExecutiveDock } from '../components/ExecutiveDock';
import { OrionWaveform } from '../components/OrionWaveform';

const { width } = Dimensions.get('window');

// Mock briefing items — replace with real Supabase query
const MOCK_BRIEFING = [
  { id: '1', label: '2 leads need attention', accent: '#10b981' },
  { id: '2', label: '1 draft ready in Metaphor', accent: 'hsl(260, 70%, 62%)' },
];

function BriefingCard({
  items,
  onDismiss,
}: {
  items: { id: string; label: string; accent: string }[];
  onDismiss: () => void;
}) {
  const translateY = useSharedValue(120);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Brief delay, then spring in
    const timer = setTimeout(() => {
      translateY.value = withSpring(0, { damping: 20, stiffness: 140 });
      opacity.value = withTiming(1, { duration: 300 });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const dismiss = () => {
    translateY.value = withTiming(180, { duration: 280, easing: Easing.in(Easing.ease) });
    opacity.value = withTiming(0, { duration: 200 });
    setTimeout(onDismiss, 300);
  };

  return (
    <Animated.View style={[styles.briefingCard, cardStyle]}>
      <Text style={styles.briefingHeader}>this morning</Text>
      {items.map((item) => (
        <View key={item.id} style={[styles.briefingItem, { borderLeftColor: item.accent }]}>
          <Text style={styles.briefingItemText}>{item.label}</Text>
        </View>
      ))}
      <Pressable onPress={dismiss} style={styles.briefingDismiss}>
        <Text style={styles.briefingDismissText}>dismiss</Text>
      </Pressable>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { stage, setStage } = useOrionStore();
  const insets = useSafeAreaInsets();

  const [isRecording, setIsRecording] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true);
  const [isFirstOpen] = useState(true); // TODO: persist via AsyncStorage

  // Wordmark letter-spacing animation
  // Idle: 12, Listening: 4 (compresses inward as it listens)
  const wordmarkTracking = useSharedValue(12);
  const wordmarkOpacity = useSharedValue(0);

  // Response preview text
  const [responsePreview, setResponsePreview] = useState('');
  const responseOpacity = useSharedValue(0);

  useEffect(() => {
    // Entrance: wordmark fades in
    wordmarkOpacity.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.ease) });
  }, []);

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    letterSpacing: withTiming(isRecording ? 4 : 12, {
      duration: 300,
      easing: Easing.out(Easing.ease),
    }),
  }));

  const responseStyle = useAnimatedStyle(() => ({
    opacity: responseOpacity.value,
  }));

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setIsRecording(true);
    setStage('LISTENING');
    setResponsePreview('');
    responseOpacity.value = withTiming(0, { duration: 150 });
  };

  const handlePressOut = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    setIsRecording(false);
    setStage('PROCESSING');

    // Simulate response preview — replace with real stream
    setTimeout(() => {
      setResponsePreview('here\'s what i found...');
      responseOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) });
      setStage('LISTENING');
    }, 1800);
  };

  const waveState = isRecording
    ? 'listening'
    : stage === 'PROCESSING'
    ? 'processing'
    : 'idle';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* ── Center canvas ──────────────────────────────────────────── */}
      <View style={styles.canvas}>

        {/* Wordmark — the identity of the app */}
        <Animated.Text style={[styles.wordmark, wordmarkStyle]}>
          orion
        </Animated.Text>

        {/* The waveform hairline — beneath the wordmark */}
        <View style={styles.waveformContainer}>
          <OrionWaveform state={waveState} />
        </View>

        {/* Response preview — fades in after AI returns */}
        {responsePreview !== '' && (
          <Animated.Text style={[styles.responsePreview, responseStyle]}>
            {responsePreview}
          </Animated.Text>
        )}
      </View>

      {/* ── Briefing card — rises from bottom on returning visit ───── */}
      {showBriefing && MOCK_BRIEFING.length > 0 && (
        <BriefingCard items={MOCK_BRIEFING} onDismiss={() => setShowBriefing(false)} />
      )}

      {/* ── Hold-to-speak pill ─────────────────────────────────────── */}
      <View style={[styles.pillContainer, { paddingBottom: insets.bottom + 96 }]}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            styles.pill,
            pressed && styles.pillActive,
          ]}
        >
          <Text style={styles.pillText}>
            {isRecording ? 'release to send' : 'hold to speak  ·  tap to type'}
          </Text>
        </Pressable>
      </View>

      <ExecutiveDock onResetOrb={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },

  // ── Canvas
  canvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  // ── Wordmark
  wordmark: {
    fontSize: 36,
    fontWeight: '300',
    color: Colors.textPrimary,
    letterSpacing: 12, // animated
    textTransform: 'lowercase',
    marginBottom: 20,
  },

  // ── Waveform
  waveformContainer: {
    width: width - 64,
    overflow: 'hidden',
  },

  // ── Response preview
  responsePreview: {
    marginTop: 24,
    fontSize: 14,
    fontWeight: '300',
    color: 'rgba(240,240,240,0.55)',
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Briefing card
  briefingCard: {
    position: 'absolute',
    bottom: 180,
    left: 24,
    right: 24,
    backgroundColor: '#10131b',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
  },
  briefingHeader: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(240,240,240,0.35)',
    letterSpacing: 1.5,
    textTransform: 'lowercase',
    marginBottom: 14,
    fontFamily: 'IBMPlexMono',
  },
  briefingItem: {
    borderLeftWidth: 2,
    paddingLeft: 12,
    marginBottom: 10,
  },
  briefingItemText: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(240,240,240,0.75)',
    lineHeight: 20,
  },
  briefingDismiss: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  briefingDismissText: {
    fontSize: 12,
    color: 'rgba(240,240,240,0.3)',
    letterSpacing: 0.5,
  },

  // ── Pill
  pillContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  pill: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  pillActive: {
    borderColor: 'rgba(255,255,255,0.28)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '300',
    color: 'rgba(240,240,240,0.45)',
    letterSpacing: 0.3,
    textTransform: 'lowercase',
  },
});