import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from 'react-native';
import { TOKENS } from '../constants/tokens';
import { CardItem } from '../store/useWilliamStore';
import { Feather } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

interface ZoomCardProps {
  visible: boolean;
  item: CardItem | null;
  onDismiss: () => void;
}

export const ZoomCard: React.FC<ZoomCardProps> = ({ visible, item, onDismiss }) => {
  const translateY = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: TOKENS.animation.entranceDuration,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: height,
        duration: TOKENS.animation.entranceDuration,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  // Swipe-down pan responder
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 80 || gestureState.vy > 0.5) {
          onDismiss();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;


  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ translateY }],
        },
      ]}
      {...panResponder.panHandlers}
    >
      {/* Handle Pill */}
      <View style={styles.handleBar} />

      {item && (
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.typeBadge}>
              <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
            </View>
            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
              <Feather name="x" size={18} color={TOKENS.colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>

          {/* Body */}
          <View style={styles.bodyBox}>
            <Text style={styles.bodyText}>{item.body}</Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onDismiss}
            style={styles.actionBtn}
          >
            <Text style={styles.actionBtnText}>
              {item.actionLabel || 'Got it'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: TOKENS.colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: TOKENS.colors.border,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    elevation: 25,
    zIndex: 100,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: TOKENS.colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  content: {
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeBadge: {
    backgroundColor: TOKENS.colors.elevated,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: TOKENS.colors.border,
  },
  typeBadgeText: {
    fontSize: 10,
    fontFamily: TOKENS.fonts.data,
    color: TOKENS.colors.accent,
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 6,
  },
  title: {
    fontSize: 22,
    fontFamily: TOKENS.fonts.display,
    color: TOKENS.colors.textPrimary,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    fontFamily: TOKENS.fonts.data,
    color: TOKENS.colors.textMuted,
  },
  bodyBox: {
    backgroundColor: TOKENS.colors.elevated,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TOKENS.colors.border,
    marginVertical: 4,
  },
  bodyText: {
    fontSize: 14,
    color: TOKENS.colors.textPrimary,
    lineHeight: 20,
  },
  actionBtn: {
    backgroundColor: TOKENS.colors.accent,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
});
