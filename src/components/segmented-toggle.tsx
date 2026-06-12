import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';

interface Option<T extends string> {
  value: T;
  label: string;
  /** Fill color when selected */
  color: string;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: ViewStyle;
}

export function SegmentedToggle<T extends string>({ options, value, onChange, style }: Props<T>) {
  return (
    <View style={[styles.row, style]}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[styles.pill, selected ? { backgroundColor: opt.color } : styles.idle]}>
            <Text style={[styles.label, selected ? styles.labelSelected : null]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  idle: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  labelSelected: {
    color: '#FFFFFF',
  },
});
