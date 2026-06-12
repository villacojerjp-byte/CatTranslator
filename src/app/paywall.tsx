import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PillButton } from '@/components/pill-button';
import { Colors } from '@/constants/theme';
import { useStore } from '@/lib/store';

const TESTIMONIALS = [
  {
    name: 'Emily R.',
    text: 'My cat actually responds to the meows! We finally understand each other.',
  },
  {
    name: 'Jacob T.',
    text: "Funniest app I've downloaded all year — and my kitten loves the sounds.",
  },
  {
    name: 'Sofia M.',
    text: 'The soundboard calms my cat down every single time. Worth it!',
  },
  {
    name: 'Liam K.',
    text: 'I tell my cat I love her every morning now. 10/10.',
  },
];

const BENEFITS = [
  { emoji: '🐈', label: 'Adding multiple pets', bg: Colors.pastelPink },
  { emoji: '🚫', label: 'Without advertising', bg: Colors.pastelBlue },
  { emoji: '🎮', label: 'Unlock all features', bg: Colors.pastelGreen },
];

export default function Paywall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeOnboarding, setPro } = useStore();

  const finish = (pro: boolean) => {
    setPro(pro);
    completeOnboarding();
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient colors={['#2A2138', '#1B1526', Colors.darkBg]} style={styles.fill}>
      <View style={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
        <Pressable onPress={() => finish(false)} style={styles.close} hitSlop={12}>
          <Ionicons name="close" size={22} color="rgba(255,255,255,0.5)" />
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.carousel}
          contentContainerStyle={styles.carouselContent}>
          {TESTIMONIALS.map((t) => (
            <View key={t.name} style={styles.reviewCard}>
              <Text style={styles.stars}>★★★★★</Text>
              <Text style={styles.reviewText}>{t.text}</Text>
              <Text style={styles.reviewName}>{t.name}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>😻</Text>
        </View>

        <View style={styles.bottom}>
          <Text style={styles.title}>Unlimited access for Cat Translator Pro</Text>
          <Text style={styles.subtitle}>Start speaking your cat&apos;s language!</Text>

          <View style={styles.benefits}>
            {BENEFITS.map((b) => (
              <View key={b.label} style={styles.benefit}>
                <View style={[styles.benefitIcon, { backgroundColor: b.bg }]}>
                  <Text style={styles.benefitEmoji}>{b.emoji}</Text>
                </View>
                <Text style={styles.benefitLabel}>{b.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.smallPrint}>
            Three days free, and then $7.99/week. Auto renewable. Cancel any time.
          </Text>

          <PillButton title="Start" variant="purple" onPress={() => finish(true)} />

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
  close: {
    alignSelf: 'flex-start',
    padding: 4,
  },
  carousel: {
    flexGrow: 0,
    marginTop: 8,
    marginHorizontal: -24,
  },
  carouselContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  reviewCard: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  stars: {
    color: '#F5B400',
    fontSize: 13,
    letterSpacing: 2,
  },
  reviewText: {
    color: Colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  reviewName: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroEmoji: {
    fontSize: 96,
  },
  bottom: {
    gap: 12,
  },
  title: {
    color: Colors.yellow,
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 32,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 16,
  },
  benefits: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  benefit: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  benefitIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitEmoji: {
    fontSize: 24,
  },
  benefitLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  smallPrint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  links: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  link: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
  },
});
