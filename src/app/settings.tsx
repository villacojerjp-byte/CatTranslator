import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Radii, Shadow } from '@/constants/theme';
import { useStore } from '@/lib/store';

const TERMS_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL = 'https://example.com/privacy'; // TODO: replace with your hosted privacy policy

export default function Settings() {
  const router = useRouter();
  const { pro, setPro } = useStore();

  return (
    <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color={Colors.textMuted} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {!pro && (
          <Pressable onPress={() => setPro(true)}>
            <LinearGradient
              colors={Colors.blueGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.banner}>
              <View style={styles.bannerText}>
                <Text style={styles.bannerTitle}>Beneficial subscription plans!</Text>
                <Text style={styles.bannerSubtitle}>
                  Popular 1-year subscription — unlock every feature
                </Text>
              </View>
              <Text style={styles.bannerEmoji}>💎</Text>
            </LinearGradient>
          </Pressable>
        )}

        {pro && (
          <View style={styles.proCard}>
            <Text style={styles.proEmoji}>😻</Text>
            <Text style={styles.proText}>Cat Translator Pro is active</Text>
          </View>
        )}

        <View style={styles.group}>
          <Pressable style={styles.row} onPress={() => WebBrowser.openBrowserAsync(TERMS_URL)}>
            <Text style={styles.rowLabel}>Terms of Use</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textFaint} />
          </Pressable>
          <View style={styles.separator} />
          <Pressable style={styles.row} onPress={() => WebBrowser.openBrowserAsync(PRIVACY_URL)}>
            <Text style={styles.rowLabel}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color={Colors.textFaint} />
          </Pressable>
        </View>

        <Text style={styles.version}>Cat Translator · v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerBtn: {
    width: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  body: {
    paddingHorizontal: 20,
    gap: 16,
    paddingBottom: 24,
  },
  banner: {
    borderRadius: Radii.card,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerText: {
    flex: 1,
    gap: 4,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  bannerSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
  },
  bannerEmoji: {
    fontSize: 40,
  },
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    ...Shadow.card,
  },
  proEmoji: {
    fontSize: 28,
  },
  proText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  group: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    ...Shadow.card,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.cardBorder,
    marginLeft: 16,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textFaint,
  },
});
