import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import { TOKENS } from '../constants/tokens';

interface CommandOrbProps {
  isZoomed: boolean;
  onPress?: () => void;
}

export const CommandOrb: React.FC<CommandOrbProps> = ({ isZoomed, onPress }) => {
  // Breathing animation
  const breatheAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  // Zoom animation (scale 1.6x & translate upward)
  const zoomScale = useRef(new Animated.Value(1)).current;
  const zoomTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Breathing loop
    const breathe = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(breatheAnim, {
            toValue: 1.06,
            duration: 3000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.7,
            duration: 3000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(breatheAnim, {
            toValue: 0.94,
            duration: 3000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.35,
            duration: 3000,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    breathe.start();
  }, [breatheAnim, glowAnim]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(zoomScale, {
        toValue: isZoomed ? 1.6 : 1,
        duration: TOKENS.animation.entranceDuration,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(zoomTranslateY, {
        toValue: isZoomed ? -75 : 0,
        duration: TOKENS.animation.entranceDuration,
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, [isZoomed, zoomScale, zoomTranslateY]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.touchContainer}
    >
      <Animated.View
        style={[
          styles.orbWrapper,
          {
            transform: [
              { translateY: zoomTranslateY },
              { scale: Animated.multiply(breatheAnim, zoomScale) },
            ],
          },
        ]}
      >
        {/* Soft Radial Glow Bloom Background */}
        <Animated.View
          style={[
            styles.glowBloom,
            {
              opacity: glowAnim,
            },
          ]}
        />

        {/* Outer Ring */}
        <View style={styles.outerRing} />

        {/* Middle Concentric Ring */}
        <View style={styles.middleRing} />

        {/* Inner Core Ring */}
        <View style={styles.innerCore} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  orbWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glowBloom: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: TOKENS.colors.accent,
    opacity: 0.4,
    // Soft shadow bloom
    shadowColor: TOKENS.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: 40,
    elevation: 20,
  },
  outerRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: 'rgba(201, 151, 76, 0.35)',
  },
  middleRing: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    borderColor: 'rgba(201, 151, 76, 0.65)',
    backgroundColor: 'rgba(201, 151, 76, 0.08)',
  },
  innerCore: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: TOKENS.colors.accent,
    shadowColor: TOKENS.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 15,
  },
});
