import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import type { CatSound } from '@/lib/sounds';

interface Props {
  sound: CatSound;
  playing: boolean;
  onPress: () => void;
  size: number;
}

/** Circular pastel soundboard tile with a cat face and an emotion badge. */
export function SoundTile({ sound, playing, onPress, size }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.wrap}>
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: sound.tint },
          playing && styles.playing,
        ]}>
        <Text style={{ fontSize: size * 0.42 }}>{sound.catEmoji}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeEmoji}>{sound.badge}</Text>
        </View>
      </View>
      {playing ? (
        <View style={styles.playingPill}>
          <Text style={styles.playingText}>playing</Text>
        </View>
      ) : (
        <Text style={styles.label}>{sound.label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 6,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  playing: {
    borderWidth: 2,
    borderColor: Colors.cat,
  },
  badge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1F2430',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  badgeEmoji: {
    fontSize: 13,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  playingPill: {
    backgroundColor: Colors.cat,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  playingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
