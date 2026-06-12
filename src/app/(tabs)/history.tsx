import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PillButton } from '@/components/pill-button';
import { PlayRow } from '@/components/play-row';
import { ScreenHeader } from '@/components/screen-header';
import { SegmentedToggle } from '@/components/segmented-toggle';
import { Colors, modeColor, Radii, Shadow, type Mode } from '@/constants/theme';
import { stopPlayback } from '@/lib/audio';
import { getAvatar } from '@/lib/avatars';
import { useStore } from '@/lib/store';
import type { TranslationEntry } from '@/lib/types';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function History() {
  const router = useRouter();
  const { history, cats, deleteHistory } = useStore();
  const [mode, setMode] = useState<Mode>('cat');

  useEffect(() => stopPlayback, []);

  const sections = useMemo(() => {
    const filtered = history.filter((h) => h.mode === mode);
    const byDate = new Map<string, TranslationEntry[]>();
    for (const entry of filtered) {
      const key = formatDate(entry.createdAt);
      const list = byDate.get(key) ?? [];
      list.push(entry);
      byDate.set(key, list);
    }
    return Array.from(byDate.entries());
  }, [history, mode]);

  const confirmDelete = (entry: TranslationEntry) => {
    Alert.alert('Delete translation?', `"${entry.label}" will be removed from history.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteHistory(entry.id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.fill} edges={['top']}>
      <ScreenHeader />
      <SegmentedToggle
        style={styles.toggle}
        value={mode}
        onChange={setMode}
        options={[
          { value: 'cat', label: 'Cat', color: Colors.cat },
          { value: 'people', label: 'People', color: Colors.people },
        ]}
      />

      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🐱</Text>
          <Text style={styles.emptyText}>You still don&apos;t have any translations</Text>
          <PillButton
            title="Start Translation"
            variant="blue"
            style={styles.emptyCta}
            onPress={() => router.push('/translate')}
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {sections.map(([date, entries]) => (
            <View key={date} style={styles.section}>
              <Text style={styles.dateLabel}>{date}:</Text>
              {entries.map((entry) => {
                const cat = cats.find((c) => c.id === entry.catId);
                const avatar = getAvatar(cat?.avatarId);
                return (
                  <Pressable
                    key={entry.id}
                    onLongPress={() => confirmDelete(entry)}
                    style={styles.card}>
                    <Text style={styles.cardLabel}>{entry.label}</Text>
                    <PlayRow
                      thumbEmoji={entry.mode === 'cat' ? avatar.emoji : '🧑'}
                      thumbBg={entry.mode === 'cat' ? avatar.bg : Colors.pastelPeach}
                      accent={modeColor(entry.mode)}
                      uri={entry.recordingUri}
                      soundIds={entry.recordingUri ? undefined : entry.soundIds}
                      waveformSeed={entry.id}
                    />
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  toggle: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 72,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  emptyCta: {
    alignSelf: 'stretch',
    marginTop: 8,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 18,
  },
  section: {
    gap: 10,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    gap: 10,
    ...Shadow.card,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
});
