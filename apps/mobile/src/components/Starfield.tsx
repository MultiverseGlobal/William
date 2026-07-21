import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { TOKENS } from '../constants/tokens';

const { width, height } = Dimensions.get('window');

const STARS = Array.from({ length: 14 }).map((_, i) => ({
  id: i,
  x: Math.random() * width,
  y: Math.random() * height,
  size: Math.random() * 2 + 1.5,
  speed: Math.random() * 8000 + 6000,
  initialOpacity: Math.random() * 0.4 + 0.2,
}));

export const Starfield: React.FC = () => {
  const animValues = useRef(STARS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = animValues.map((anim, i) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: STARS[i].speed,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: STARS[i].speed,
            useNativeDriver: true,
          }),
        ])
      );
    });

    animations.forEach((a) => a.start());
  }, [animValues]);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {STARS.map((star, i) => {
        const opacity = animValues[i].interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [star.initialOpacity, star.initialOpacity + 0.4, star.initialOpacity],
        });
        const translateY = animValues[i].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -15],
        });

        return (
          <Animated.View
            key={star.id}
            style={[
              styles.star,
              {
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                borderRadius: star.size / 2,
                opacity,
                transform: [{ translateY }],
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  star: {
    position: 'absolute',
    backgroundColor: TOKENS.colors.textPrimary,
  },
});
