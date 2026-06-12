import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { SoundTile } from '@/components/sound-tile';
import { Colors, Radii } from '@/constants/theme';
import { playSound, stopPlayback } from '@/lib/audio';
import { CAT_SOUNDS } from '@/lib/sounds';

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => stopPlayback, []);

  const tileSize = Math.min(104, (width - 40 - 2 * 18) / 3);

  const onTilePress = async (id: string, source: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (playingId === id) {
      stopPlayback();
      setPlayingId(null);
      return;
    }
    setPlayingId(id);
    await playSound(source, () => setPlayingId((cur) => (cur === id ? null : cur)));
  };

  return (
    <SafeAreaView style={styles.fill} edges={['top']}>
      <ScreenHeader />
      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {CAT_SOUNDS.map((sound) => (
          <SoundTile
            key={sound.id}
            sound={sound}
            size={tileSize}
            playing={playingId === sound.id}
            onPress={() => onTilePress(sound.id, sound.source)}
          />
        ))}
      </ScrollView>

      <View style={styles.recordWrap} pointerEvents="box-none">
        <Pressable
          onPress={() => {
            stopPlayback();
            setPlayingId(null);
            router.push('/translate');
          }}>
          {({ pressed }) => (
            <LinearGradient
              colors={Colors.blueGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={[styles.recordBtn, pressed && styles.pressed]}>
              <View style={styles.recordInner}>
                <Ionicons name="mic" size={26} color={Colors.tabActive} />
              </View>
            </LinearGradient>
          )}
        </Pressable>
        <Text style={styles.recordHint}>Tap to translate</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 130,
    rowGap: 18,
  },
  recordWrap: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 6,
  },
  recordBtn: {
    width: 190,
    height: 64,
    borderRadius: Radii.pill + 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B5FE0',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  pressed: {
    opacity: 0.85,
  },
  recordInner: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordHint: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
