import { Redirect } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useStore } from '@/lib/store';

export default function Index() {
  const { hydrated, onboarded } = useStore();

  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: Colors.background }} />;
  }

  return <Redirect href={onboarded ? '/(tabs)' : '/onboarding'} />;
}
