import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TOKENS } from '../constants/tokens';
import { useWilliamStore } from '../store/useWilliamStore';
import { Starfield } from '../components/Starfield';
import { CommandOrb } from '../components/CommandOrb';
import { ZoomCard } from '../components/ZoomCard';
import { Feather, Ionicons } from '@expo/vector-icons';
import {
  setupNotificationListeners,
  simulatePushNotificationTap,
  simulateUrgentInterrupt,
} from '../services/notificationService';

export default function HomeScreen() {
  const {
    isZoomed,
    activeItem,
    pendingCount,
    headline,
    triggerZoom,
    dismissZoom,
    handlePushNotification,
  } = useWilliamStore();

  const [inputQuery, setInputQuery] = useState('');
  const [onboardStep, setOnboardStep] = useState(0); // 0 = normal active, 1 = onboarding welcome, 2 = calendar connect

  // Animation for headline opacity fading to 0.15 during zoom
  const headlineOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    setupNotificationListeners();
  }, []);

  useEffect(() => {
    Animated.timing(headlineOpacity, {
      toValue: isZoomed ? 0.15 : 1,
      duration: TOKENS.animation.entranceDuration,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
    }).start();
  }, [isZoomed, headlineOpacity]);

  const handleSendQuery = () => {
    if (!inputQuery.trim()) return;
    const queryText = inputQuery.trim();
    setInputQuery('');

    // Trigger Zoom Card for the query
    triggerZoom({
      id: 'query-' + Date.now(),
      title: 'Query Result',
      subtitle: `Prompt: "${queryText}"`,
      body: `William processed your request: "${queryText}". All context synchronized with Chief of Staff engine.`,
      type: 'mission',
      actionLabel: 'Acknowledged',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={TOKENS.colors.background} />

      {/* Animated Starfield Background */}
      <Starfield />

      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.brandTitleContainer}>
          <Text style={styles.brandTitle}>WILLIAM</Text>
        </View>

        {/* Top-Right Notification Pill */}
        {pendingCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => triggerZoom()}
            style={styles.notificationPill}
          >
            <View style={styles.dot} />
            <Text style={styles.notificationText}>{pendingCount} new</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main Centered Content */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.mainContent}
      >
        {/* Centered Glowing Command Orb */}
        <View style={styles.orbContainer}>
          <CommandOrb isZoomed={isZoomed} onPress={() => triggerZoom()} />
        </View>

        {/* Dynamic Headline & Greeting */}
        <Animated.View style={[styles.textSection, { opacity: headlineOpacity }]}>
          <Text style={styles.greetingLine}>Good morning, Kenshi</Text>
          <Text style={styles.dynamicHeadline}>{headline}</Text>
        </Animated.View>

        {/* Simulation Shortcut Buttons (For testing Urgent Interrupt & Push Deep-Link) */}
        {!isZoomed && (
          <View style={styles.simRow}>
            <TouchableOpacity
              onPress={() => simulateUrgentInterrupt()}
              style={styles.simBtn}
            >
              <Text style={styles.simBtnText}>⚡ Test Urgent Interrupt</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => simulatePushNotificationTap()}
              style={styles.simBtn}
            >
              <Text style={styles.simBtnText}>🔔 Test Push Deep-Link</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Persistent Input Bar */}
        <View style={styles.inputBarWrapper}>
          <View style={styles.inputBar}>
            <TextInput
              style={styles.inputField}
              value={inputQuery}
              onChangeText={setInputQuery}
              placeholder="Ask anything..."
              placeholderTextColor={TOKENS.colors.textFaint}
              onSubmitEditing={handleSendQuery}
              returnKeyType="send"
            />
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSendQuery}
              style={styles.sendAffordance}
            >
              <Ionicons
                name="radio-button-on"
                size={18}
                color={TOKENS.colors.accent}
              />

            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Zoom Card Component */}
      <ZoomCard
        visible={isZoomed}
        item={activeItem}
        onDismiss={dismissZoom}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: TOKENS.colors.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    height: 54,
    zIndex: 20,
  },
  brandTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 12,
    fontFamily: TOKENS.fonts.data,
    color: TOKENS.colors.textFaint,
    letterSpacing: 2,
    fontWeight: '700',
  },
  notificationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TOKENS.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: TOKENS.colors.border,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: TOKENS.colors.accent,
  },
  notificationText: {
    fontSize: 12,
    fontFamily: TOKENS.fonts.data,
    color: TOKENS.colors.textPrimary,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  orbContainer: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSection: {
    alignItems: 'center',
    textAlign: 'center',
    paddingHorizontal: 16,
    marginTop: 10,
  },
  greetingLine: {
    fontSize: 13,
    color: TOKENS.colors.textMuted,
    marginBottom: 8,
    textAlign: 'center',
  },
  dynamicHeadline: {
    fontSize: 26,
    color: TOKENS.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
    fontWeight: '300',
    maxWidth: 320,
  },
  simRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  simBtn: {
    backgroundColor: TOKENS.colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: TOKENS.colors.border,
  },
  simBtnText: {
    fontSize: 10,
    color: TOKENS.colors.textMuted,
    fontFamily: TOKENS.fonts.data,
  },
  inputBarWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: TOKENS.colors.surface,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: TOKENS.colors.border,
    paddingHorizontal: 18,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: TOKENS.colors.textPrimary,
    paddingVertical: 2,
  },
  sendAffordance: {
    padding: 6,
  },
});
