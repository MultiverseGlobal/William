import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  AccessibilityInfo,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
  withRepeat,
} from 'react-native-reanimated';
import { Canvas, BlurMask, RadialGradient, vec, Circle } from '@shopify/react-native-skia';
import { Colors } from '../theme/colors';
import { OrionLogo } from './OrionLogo';

const { width } = Dimensions.get('window');

interface SplashEntryProps {
  onComplete: () => void;
  isColdStart?: boolean;
}

export function SplashEntry({ onComplete, isColdStart = true }: SplashEntryProps) {
  const containerOpacity = useSharedValue(1);
  const orbScale       = useSharedValue(isColdStart ? 0.55 : 1);
  const orbOpacity     = useSharedValue(isColdStart ? 0   : 1);
  const wordOpacity    = useSharedValue(0);
  const wordY          = useSharedValue(isColdStart ? 14 : 0);
  
  // Skia shared values for breathing cyan singularity
  const rScale = useSharedValue(isColdStart ? 0.4 : 0.8);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced || !isColdStart) {
        orbOpacity.value = 1;
        orbScale.value = 1;
        wordOpacity.value = 1;
        wordY.value = 0;
        containerOpacity.value = 1;

        setTimeout(() => {
          containerOpacity.value = withTiming(0, { duration: 280 }, (finished) => {
            if (finished) runOnJS(onComplete)();
          });
        }, isColdStart ? 400 : 180);
        return;
      }

      // Cold start full sequence
      orbOpacity.value = withTiming(1, { duration: 600 });
      orbScale.value = withSpring(1, { damping: 12, stiffness: 80 });
      rScale.value = withSequence(
        withTiming(1.15, { duration: 900 }),
        withTiming(1.0, { duration: 600 })
      );

      wordOpacity.value = withDelay(600, withTiming(1, { duration: 420 }));
      wordY.value = withDelay(600, withTiming(0, { duration: 420 }));

      containerOpacity.value = withDelay(1620, withTiming(0, { duration: 460 }, (finished) => {
        if (finished) runOnJS(onComplete)();
      }));
    });
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const orbStyle = useAnimatedStyle(() => ({
    opacity: orbOpacity.value,
    transform: [{ scale: orbScale.value }],
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordOpacity.value,
    transform: [{ translateY: wordY.value }],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      {/* Skia Breathing Cyan Singularity */}
      <View style={StyleSheet.absoluteFill}>
        <Canvas style={styles.canvas}>
          <Circle cx={width / 2} cy={300} r={90}>
            <RadialGradient
              c={vec(width / 2, 300)}
              r={90}
              colors={['rgba(0,240,255,0.4)', 'transparent']}
            />
            <BlurMask blur={30} style="normal" />
          </Circle>
        </Canvas>
      </View>

      <Animated.View style={[styles.orbContainer, orbStyle]}>
        <OrionLogo size={72} animated={false} />
      </Animated.View>

      <Animated.View style={[styles.wordmarkContainer, wordmarkStyle]}>
        <Text style={styles.wordmark} accessibilityRole="header">
          orion
        </Text>
        <View style={styles.taglineDot} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.bg,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    flex: 1,
  },
  orbContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmarkContainer: {
    alignItems: 'center',
    marginTop: 28,
    gap: 8,
  },
  wordmark: {
    fontSize: 32,
    fontWeight: '300',
    color: Colors.textPrimary,
    letterSpacing: 6,
    textTransform: 'lowercase',
  },
  taglineDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
});
