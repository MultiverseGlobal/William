/**
 * OrionWaveform — The signature visual of Orion.
 *
 * A single precise hairline that waveforms on voice.
 * Not a looping animation. Not an orb. The real signal.
 *
 * States:
 *   idle       — a perfectly still horizontal line
 *   listening  — line becomes a live sine wave driven by amplitude
 *   processing — line pulses gently: a slow, single breath
 */

import React, { useEffect } from 'react';
import { Dimensions } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import {
  useSharedValue,
  useDerivedValue,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const HEIGHT = 48;
const CENTER_Y = HEIGHT / 2;
const SEGMENTS = 80;

type WaveState = 'idle' | 'listening' | 'processing';

interface OrionWaveformProps {
  state: WaveState;
  amplitude?: number; // 0–1, from microphone level
}

export function OrionWaveform({ state, amplitude = 0 }: OrionWaveformProps) {
  const phase = useSharedValue(0);
  const waveAmplitude = useSharedValue(0);
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    switch (state) {
      case 'idle':
        waveAmplitude.value = withTiming(0, { duration: 800, easing: Easing.out(Easing.ease) });
        opacity.value = withTiming(0.35, { duration: 600 });
        // Stop the phase scroll — still line
        break;

      case 'listening':
        // Phase scrolls continuously — wave moves
        phase.value = withRepeat(
          withTiming(Math.PI * 2, { duration: 2200, easing: Easing.linear }),
          -1,
          false
        );
        waveAmplitude.value = withSpring(amplitude * 18 + 4, { damping: 10, stiffness: 80 });
        opacity.value = withTiming(1, { duration: 300 });
        break;

      case 'processing':
        // Slow, single sine breath — 1 full wave, breathing
        phase.value = withRepeat(
          withTiming(Math.PI * 2, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
          -1,
          true
        );
        waveAmplitude.value = withTiming(6, { duration: 600 });
        opacity.value = withRepeat(
          withTiming(0.7, { duration: 1800 }),
          -1,
          true
        );
        break;
    }
  }, [state, amplitude]);

  const path = useDerivedValue(() => {
    const p = Skia.Path.Make();
    p.moveTo(0, CENTER_Y);

    for (let i = 1; i <= SEGMENTS; i++) {
      const x = (i / SEGMENTS) * width;
      const prevX = ((i - 1) / SEGMENTS) * width;
      const t = (i / SEGMENTS) * Math.PI * 2;
      const prevT = ((i - 1) / SEGMENTS) * Math.PI * 2;

      const y = CENTER_Y + Math.sin(t + phase.value) * waveAmplitude.value;
      const prevY = CENTER_Y + Math.sin(prevT + phase.value) * waveAmplitude.value;

      const cpx = (prevX + x) / 2;
      p.cubicTo(cpx, prevY, cpx, y, x, y);
    }

    return p;
  });

  return (
    <Canvas style={{ width, height: HEIGHT }}>
      <Path
        path={path}
        style="stroke"
        strokeWidth={0.75}
        color={`rgba(240, 240, 240, ${opacity.value})`}
        strokeCap="round"
        strokeJoin="round"
      />
    </Canvas>
  );
}
