import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';

/** Deterministic pseudo-random bar heights so a given seed always looks the same. */
function barHeights(seed: string, count: number): number[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h = (h ^ seed.charCodeAt(i)) * 16777619;
  }
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    out.push(0.25 + (h % 1000) / 1333); // 0.25..1.0
  }
  return out;
}

interface StaticProps {
  seed: string;
  color?: string;
  barCount?: number;
  height?: number;
  style?: ViewStyle;
}

/** Static bar waveform used in player rows and history cards. */
export function Waveform({ seed, color = '#4D7DF2', barCount = 28, height = 32, style }: StaticProps) {
  const bars = useMemo(() => barHeights(seed, barCount), [seed, barCount]);
  return (
    <View style={[styles.row, { height }, style]}>
      {bars.map((b, i) => (
        <View key={i} style={[styles.bar, { height: Math.max(4, b * height), backgroundColor: color }]} />
      ))}
    </View>
  );
}

interface LiveProps {
  color: string;
  barCount?: number;
  height?: number;
  style?: ViewStyle;
}

/** Animated waveform shown while recording. */
export function LiveWaveform({ color, barCount = 24, height = 44, style }: LiveProps) {
  const [anims] = useState(() =>
    Array.from({ length: barCount }, () => new Animated.Value(0.3))
  );

  useEffect(() => {
    const loops = anims.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 1,
            duration: 280 + ((i * 37) % 220),
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(v, {
            toValue: 0.25,
            duration: 280 + ((i * 53) % 220),
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: false,
          }),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [anims]);

  return (
    <View style={[styles.row, { height }, style]}>
      {anims.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: v.interpolate({ inputRange: [0, 1], outputRange: [6, height] }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
});

export const WaveformColors = { blue: Colors.tabActive };
