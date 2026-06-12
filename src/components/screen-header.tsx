import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { getAvatar } from '@/lib/avatars';
import { useStore } from '@/lib/store';

/** Header used on the main tabs: active cat at left, Settings at right. */
export function ScreenHeader() {
  const router = useRouter();
  const { activeCat } = useStore();
  const avatar = getAvatar(activeCat?.avatarId);

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: avatar.bg }]}>
          <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {activeCat?.name ?? 'Add a cat'}
        </Text>
      </View>
      <Pressable onPress={() => router.push('/settings')} style={styles.settings}>
        <Ionicons name="settings-outline" size={20} color={Colors.textMuted} />
        <Text style={styles.settingsLabel}>Settings</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 20,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
    flexShrink: 1,
  },
  settings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingsLabel: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
