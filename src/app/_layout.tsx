import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { Colors } from '@/constants/theme';
import { StoreProvider } from '@/lib/store';

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.background,
    card: Colors.card,
    text: Colors.text,
    primary: Colors.tabActive,
  },
};

export default function RootLayout() {
  return (
    <StoreProvider>
      <ThemeProvider value={AppTheme}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.background } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
          <Stack.Screen name="paywall" options={{ animation: 'fade' }} />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="translate" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
          <Stack.Screen name="cat-form" options={{ presentation: 'modal' }} />
        </Stack>
      </ThemeProvider>
    </StoreProvider>
  );
}
