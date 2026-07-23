import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { WilliamFileCard } from '../store/useWilliamStore';
import { speakBriefing } from '../services/audioService';

const { height } = Dimensions.get('window');

interface ZoomCardProps {
  visible: boolean;
  fileCard: WilliamFileCard | null;
  onDismiss: () => void;
  onAction?: (actionName: string) => void;
}

export const ZoomCard: React.FC<ZoomCardProps> = ({
  visible,
  fileCard,
  onDismiss,
  onAction,
}) => {
  const translateY = useSharedValue(height);

  useEffect(() => {
    if (visible) {
      // Trigger subtle haptic on card open
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      translateY.value = withTiming(0, {
        duration: 380,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
    } else {
      translateY.value = withTiming(height, {
        duration: 300,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      });
    }
  }, [visible, translateY]);

  // Swipe-down pan responder
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.value = gestureState.dy;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.5) {
          onDismiss();
        } else {
          translateY.value = withSpring(0);
        }
      },
    })
  ).current;

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible || !fileCard) return null;

  return (
    <Animated.View
      style={[styles.cardContainer, animatedCardStyle]}
      {...panResponder.panHandlers}
    >
      {/* Handle Bar */}
      <View style={styles.handleBar} />

      <View style={styles.content}>
        {/* Header Badge */}
        <View style={styles.headerRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>EXECUTIVE BRIEF</Text>
          </View>
          <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
            <Feather name="x" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Title & Metadata */}
        <Text style={styles.title}>{fileCard.name}</Text>
        <Text style={styles.subtitle}>{fileCard.format} • {fileCard.size}</Text>
        <Text style={styles.timestampText}>Created {fileCard.timestamp}</Text>

        {/* Summary Content Box */}
        <View style={styles.bodyBox}>
          <Text style={styles.bodyText}>
            This executive briefing contains synthesized metrics, team deliverables, and market intelligence compiled by William.
          </Text>
        </View>

        {/* Executive Action Buttons */}
        <View style={styles.actionsGroup}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              speakBriefing(`${fileCard.name}. This executive briefing contains synthesized metrics, team deliverables, and market intelligence compiled by William.`);
            }}
            style={styles.listenActionBtn}
          >
            <Feather name="volume-2" size={16} color="#2563EB" />
            <Text style={styles.listenActionText}>Listen Aloud</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
              onAction?.('Accept Action Item');
              onDismiss();
            }}
            style={styles.primaryActionBtn}
          >
            <Feather name="check-circle" size={16} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Execute</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 20,
    zIndex: 100,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  content: {
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  typeBadgeText: {
    fontSize: 10,
    color: '#2563EB',
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  title: {
    fontSize: 22,
    color: '#111827',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  timestampText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  bodyBox: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 6,
  },
  bodyText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  listenActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  listenActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  primaryActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
