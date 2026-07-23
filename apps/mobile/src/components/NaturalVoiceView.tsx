import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

import * as Haptics from 'expo-haptics';
import { speakBriefing } from '../services/audioService';

const { width, height } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

interface NaturalVoiceViewProps {
  queryText?: string;
  onVoiceComplete: () => void;
}

// High-visibility dust particles floating above the wave crest
const DUST_PARTICLES = Array.from({ length: 40 }).map((_, i) => ({
  id: i,
  startX: width * 0.15 + Math.random() * (width * 0.7),
  size: Math.random() * 3 + 2.5, // 2.5px to 5.5px
  duration: Math.random() * 2000 + 1200,
  maxOpacity: Math.random() * 0.3 + 0.6, // 0.6 to 0.9 high visibility
  driftY: -(Math.random() * 60 + 30),
  driftX: (Math.random() - 0.5) * 40,
}));

const DustParticle: React.FC<{ p: (typeof DUST_PARTICLES)[0] }> = ({ p }) => {
  const progress = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = Math.random() * 800;
    progress.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: p.duration, easing: Easing.out(Easing.quad) }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(p.maxOpacity, { duration: p.duration * 0.3 }),
          withTiming(0, { duration: p.duration * 0.7 })
        ),
        -1,
        false
      )
    );
  }, [progress, opacity, p]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: progress.value * p.driftY },
      { translateX: progress.value * p.driftX },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.dustDot,
        {
          left: p.startX,
          width: p.size,
          height: p.size,
          borderRadius: p.size / 2,
        },
        animatedStyle,
      ]}
    />
  );
};

// Typewriter effect hook
const useTypewriter = (text: string, speed: number = 55) => {
  const charIndex = useSharedValue(0);

  useEffect(() => {
    charIndex.value = 0;
    // Animate character by character
    charIndex.value = withTiming(text.length, {
      duration: text.length * speed,
      easing: Easing.linear,
    });
  }, [text, speed, charIndex]);

  return charIndex;
};

export const NaturalVoiceView: React.FC<NaturalVoiceViewProps> = ({
  queryText = 'Listening for voice command...\nHow can William assist you?',
  onVoiceComplete,
}) => {
  const [isListening, setIsListening] = useState(false);
  const activeText = isListening ? 'Listening out loud...\nSay your prompt now' : queryText;
  const cursorOpacity = useSharedValue(1);
  const wavePhase = useSharedValue(0);
  const waveAmp = useSharedValue(8);
  const charIndex = useTypewriter(activeText, 50);

  useEffect(() => {
    // Cursor blinking
    cursorOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 450 }),
        withTiming(1, { duration: 450 })
      ),
      -1,
      true
    );

    // Smooth wave oscillation
    wavePhase.value = withRepeat(
      withTiming(Math.PI * 2, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );

    // Gentle breathing amplitude
    waveAmp.value = withRepeat(
      withSequence(
        withTiming(14, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(6, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [cursorOpacity, wavePhase, waveAmp]);

  const cursorStyle = useAnimatedStyle(() => ({
    opacity: cursorOpacity.value,
  }));

  // The reference shows a smooth mountain-like single peak wave, not a complex multi-sine
  const wavePath1Props = useAnimatedProps(() => {
    const p = wavePhase.value;
    const a = waveAmp.value;
    const baseY = 60;
    // Smooth single mountain crest shape
    const peakY = baseY - a * (1 + Math.sin(p) * 0.3);
    const shoulderL = baseY - a * 0.3 * Math.cos(p * 0.8);
    const shoulderR = baseY - a * 0.3 * Math.sin(p * 0.6);

    const d = `M 0 ${baseY + 2} `
      + `C ${width * 0.2} ${shoulderL}, ${width * 0.35} ${peakY - 4}, ${width * 0.5} ${peakY} `
      + `C ${width * 0.65} ${peakY + 4}, ${width * 0.8} ${shoulderR}, ${width} ${baseY + 2} `
      + `L ${width} 120 L 0 120 Z`;
    return { d };
  });

  // Secondary wave layer (subtle, behind)
  const wavePath2Props = useAnimatedProps(() => {
    const p = wavePhase.value + 0.8;
    const a = waveAmp.value * 0.5;
    const baseY = 65;
    const peakY = baseY - a * (1 + Math.cos(p) * 0.4);

    const d = `M 0 ${baseY} `
      + `C ${width * 0.3} ${peakY + 2}, ${width * 0.5} ${peakY}, ${width * 0.7} ${peakY + 3} `
      + `C ${width * 0.85} ${baseY - 2}, ${width * 0.95} ${baseY}, ${width} ${baseY + 1} `
      + `L ${width} 120 L 0 120 Z`;
    return { d };
  });

  // Split the query into two lines for the centered display (matching reference)
  const lines = activeText.split('\n');

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.container}
      onPress={onVoiceComplete}
    >
      {/* Center Voice Query Text - matching reference typography */}
      <View style={styles.textWrapper}>
        {lines.map((line, lineIdx) => (
          <View key={lineIdx} style={styles.lineRow}>
            {line.split(' ').map((word, wordIdx) => {
              // In the reference, "show" appears slightly lighter/grayed — the last typed word
              const isLastWord = lineIdx === 0 && wordIdx === line.split(' ').length - 1 && lines.length > 1;
              return (
                <Text
                  key={wordIdx}
                  style={[
                    styles.queryWord,
                    lineIdx === 1 && styles.queryWordSecondLine,
                    isLastWord && styles.queryWordTyping,
                  ]}
                >
                  {word}{' '}
                </Text>
              );
            })}
          </View>
        ))}
      </View>

      {/* Dust particles spraying above wave crest */}
      <View style={styles.dustArea} pointerEvents="none">
        {DUST_PARTICLES.map((p) => (
          <DustParticle key={p.id} p={p} />
        ))}
      </View>

      {/* ChatGPT-Style Single Conversation Voice Button Pill */}
      <View style={styles.voiceBtnWrapper}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.chatGptVoiceBtn, isListening && styles.activeListeningBtn]}
          onPress={async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
            const nextState = !isListening;
            setIsListening(nextState);
            if (nextState) {
              // Trigger neural spoken greeting / response
              speakBriefing("I'm listening. How can William assist your execution today?");
            }
          }}
        >
          <View style={[styles.micCircle, isListening && styles.activeMicCircle]}>
            <Feather name={isListening ? "square" : "mic"} size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.chatGptVoiceText}>
            {isListening ? "Listening out loud... (Tap to stop)" : "Tap to start conversation"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEEF2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrapper: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 80,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  queryWord: {
    fontSize: 20,
    fontWeight: '400',
    fontStyle: 'italic',
    color: '#374151',
    letterSpacing: -0.1,
  },
  queryWordSecondLine: {
    fontSize: 20,
    fontWeight: '400',
    fontStyle: 'italic',
    color: '#374151',
  },
  queryWordTyping: {
    color: '#9CA3AF',
  },
  dustArea: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    height: 80,
  },
  dustDot: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#374151',
    shadowColor: '#374151',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  voiceBtnWrapper: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  chatGptVoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 26,
    gap: 10,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  activeListeningBtn: {
    backgroundColor: '#2563EB',
    borderColor: '#60A5FA',
    borderWidth: 1,
  },
  micCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeMicCircle: {
    backgroundColor: '#1E40AF',
  },
  chatGptVoiceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
