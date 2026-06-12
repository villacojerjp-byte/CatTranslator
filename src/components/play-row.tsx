import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Waveform } from '@/components/waveform';
import { playSequence, playSound, stopPlayback } from '@/lib/audio';
import { getSound } from '@/lib/sounds';

interface Props {
  /** Emoji shown in the little square source thumbnail */
  thumbEmoji: string;
  thumbBg: string;
  /** Accent color of the circular play button */
  accent: string;
  /** Recorded file uri, or bundled sound ids — whichever is present plays */
  uri?: string;
  soundIds?: string[];
  waveformSeed: string;
}

export function PlayRow({ thumbEmoji, thumbBg, accent, uri, soundIds, waveformSeed }: Props) {
  const [playing, setPlaying] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const onPress = async () => {
    if (playing) {
      stopPlayback();
      setPlaying(false);
      return;
    }
    const done = () => {
      if (mounted.current) setPlaying(false);
    };
    setPlaying(true);
    if (uri) {
      await playSound({ uri }, done);
    } else if (soundIds && soundIds.length > 0) {
      const sources = soundIds
        .map((id) => getSound(id)?.source)
        .filter((s): s is number => s != null);
      await playSequence(sources, done);
    } else {
      done();
    }
  };

  return (
    <View style={styles.row}>
      <View style={[styles.thumb, { backgroundColor: thumbBg }]}>
        <Text style={styles.thumbEmoji}>{thumbEmoji}</Text>
      </View>
      <Waveform seed={waveformSeed} style={styles.wave} />
      <Pressable onPress={onPress} style={[styles.playBtn, { backgroundColor: accent }]}>
        <Ionicons name={playing ? 'stop' : 'play'} size={18} color="#FFFFFF" style={playing ? undefined : styles.playIcon} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbEmoji: {
    fontSize: 24,
  },
  wave: {
    flex: 1,
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    marginLeft: 2,
  },
});
