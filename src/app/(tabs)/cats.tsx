import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { Colors, Radii, Shadow } from '@/constants/theme';
import { getAvatar } from '@/lib/avatars';
import { useStore } from '@/lib/store';

export default function Cats() {
  const router = useRouter();
  const { cats, activeCatId, setActiveCat } = useStore();

  return (
    <SafeAreaView style={styles.fill} edges={['top']}>
      <ScreenHeader />
      <Text style={styles.title}>Cats</Text>
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {cats.map((cat) => {
          const avatar = getAvatar(cat.avatarId);
          const active = cat.id === activeCatId;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setActiveCat(cat.id)}
              style={[styles.card, active && styles.cardActive]}>
              <View style={[styles.avatar, { backgroundColor: avatar.bg }]}>
                <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardName}>{cat.name}</Text>
                {!!cat.breed && <Text style={styles.cardBreed}>{cat.breed}</Text>}
              </View>
              {active && (
                <View style={styles.activeBadge}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              )}
              <Pressable
                hitSlop={8}
                onPress={() => router.push({ pathname: '/cat-form', params: { id: cat.id } })}
                style={styles.editBtn}>
                <Ionicons name="pencil" size={16} color={Colors.textMuted} />
              </Pressable>
            </Pressable>
          );
        })}

        <Pressable onPress={() => router.push('/cat-form')} style={styles.addRow}>
          <View style={styles.addIcon}>
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.addLabel}>Add new cat</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    ...Shadow.card,
  },
  cardActive: {
    borderColor: Colors.tabActive,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  cardBreed: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  activeBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.tabActive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.inset,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F2B431',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F2B431',
  },
});
