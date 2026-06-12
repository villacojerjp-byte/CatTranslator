import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/pill-button';
import { Colors } from '@/constants/theme';

interface Page {
  emoji: string;
  bgGradient: readonly [string, string, string];
  title: string;
  subtitle: string;
}

const PAGES: Page[] = [
  {
    emoji: '🧡🐈',
    bgGradient: ['#3A2E2A', '#241C19', Colors.darkBg],
    title: 'Be closer to your pet!',
    subtitle: 'Find out what your feline friend is thinking or trying to communicate',
  },
  {
    emoji: '🐱🐱',
    bgGradient: ['#2E2A3A', '#1E1A28', Colors.darkBg],
    title: 'Start decoding their meows & purrs into understandable language',
    subtitle: "Get a better understanding of your cat's needs and desires",
  },
  {
    emoji: '😽💋',
    bgGradient: ['#3A2A33', '#241A20', Colors.darkBg],
    title: "Confess your love to your pet in the cat's language",
    subtitle: "Translate your speech into your pet's language",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [page, setPage] = useState(0);
  const current = PAGES[page];

  const next = () => {
    if (page < PAGES.length - 1) {
      setPage(page + 1);
    } else {
      router.replace('/paywall');
    }
  };

  const back = () => setPage(Math.max(0, page - 1));

  return (
    <LinearGradient colors={current.bgGradient} style={styles.fill}>
      <View style={[styles.content, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{current.emoji}</Text>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.subtitle}>{current.subtitle}</Text>

          <View style={styles.dots}>
            {PAGES.map((_, i) => (
              <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
            ))}
          </View>

          <View style={styles.ctaRow}>
            {page > 0 && (
              <Pressable onPress={back} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color={Colors.text} />
              </Pressable>
            )}
            <View style={styles.ctaFlex}>
              <PillButton title="Continue" variant="purple" onPress={next} />
            </View>
          </View>

          <View style={styles.links}>
            <Text style={styles.link}>Terms of Use</Text>
            <Text style={styles.link}>Restore</Text>
            <Text style={styles.link}>Privacy Policy</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 110,
    letterSpacing: 6,
  },
  bottom: {
    gap: 14,
  },
  title: {
    color: Colors.yellow,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
    lineHeight: 22,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: Colors.yellow,
    width: 20,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  backBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaFlex: {
    flex: 1,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 6,
  },
  link: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
  },
});
