import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Colors, Radii } from '@/constants/theme';

type Variant = 'purple' | 'blue' | 'green' | 'cat' | 'people' | 'outline';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

const SOLID: Record<string, string> = {
  purple: Colors.purple,
  cat: Colors.cat,
  people: Colors.people,
};

export function PillButton({ title, onPress, variant = 'blue', disabled, style, icon }: Props) {
  const gradient =
    variant === 'blue' ? Colors.blueGradient : variant === 'green' ? Colors.greenGradient : null;

  const content = (
    <View style={styles.content}>
      {icon}
      <Text style={[styles.label, variant === 'outline' && styles.labelOutline]}>{title}</Text>
    </View>
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.base, style, (pressed || disabled) && styles.pressed]}>
      {gradient ? (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.fill}>
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.fill,
            variant === 'outline'
              ? styles.outline
              : { backgroundColor: SOLID[variant] ?? Colors.purple },
          ]}>
          {content}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: Radii.pill,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.75,
  },
  fill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outline: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: Radii.pill,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  labelOutline: {
    color: Colors.text,
  },
});
