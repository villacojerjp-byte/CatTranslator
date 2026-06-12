import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PillButton } from '@/components/pill-button';
import { SegmentedToggle } from '@/components/segmented-toggle';
import { Colors, Radii } from '@/constants/theme';
import { AVATARS, getAvatar } from '@/lib/avatars';
import { newId, useStore } from '@/lib/store';
import type { Gender } from '@/lib/types';

export default function CatForm() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { cats, addCat, updateCat, deleteCat, setActiveCat } = useStore();
  const editing = cats.find((c) => c.id === id);

  const [name, setName] = useState(editing?.name ?? '');
  const [gender, setGender] = useState<Gender>(editing?.gender ?? 'female');
  const [age, setAge] = useState(editing?.age ?? '');
  const [breed, setBreed] = useState(editing?.breed ?? '');
  const [avatarId, setAvatarId] = useState(editing?.avatarId ?? AVATARS[0].id);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSelection, setPickerSelection] = useState(avatarId);

  const avatar = getAvatar(avatarId);

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name needed', 'Give your cat a name first.');
      return;
    }
    if (editing) {
      updateCat({ ...editing, name: trimmed, gender, age, breed, avatarId });
    } else {
      const cat = { id: newId(), name: trimmed, gender, age, breed, avatarId };
      addCat(cat);
      setActiveCat(cat.id);
    }
    router.back();
  };

  const confirmDelete = () => {
    if (!editing) return;
    Alert.alert('Delete cat?', `${editing.name} and their profile will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteCat(editing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerBtn}>
          <Ionicons name="close" size={24} color={Colors.textMuted} />
        </Pressable>
        <Text style={styles.headerTitle}>{editing ? editing.name : 'Add a cat'}</Text>
        {editing ? (
          <Pressable onPress={confirmDelete} hitSlop={12} style={styles.headerBtn}>
            <Ionicons name="trash-outline" size={22} color={Colors.cat} />
          </Pressable>
        ) : (
          <View style={styles.headerBtn} />
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          <Pressable
            onPress={() => {
              setPickerSelection(avatarId);
              setPickerOpen(true);
            }}
            style={styles.avatarWrap}>
            <View style={[styles.avatar, { backgroundColor: avatar.bg }]}>
              <Text style={styles.avatarEmoji}>{avatar.emoji}</Text>
            </View>
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </Pressable>

          <Text style={styles.fieldLabel}>Translation name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Whiskers"
            placeholderTextColor={Colors.textFaint}
          />

          <SegmentedToggle
            value={gender}
            onChange={setGender}
            options={[
              { value: 'male', label: 'Male', color: Colors.tabActive },
              { value: 'female', label: 'Female', color: Colors.cat },
            ]}
          />

          <Text style={styles.fieldLabel}>Cat&apos;s age</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            placeholder="e.g. 3 years"
            placeholderTextColor={Colors.textFaint}
          />

          <Text style={styles.fieldLabel}>Breed (optional)</Text>
          <TextInput
            style={styles.input}
            value={breed}
            onChangeText={setBreed}
            placeholder="e.g. Tabby"
            placeholderTextColor={Colors.textFaint}
          />
        </ScrollView>

        <View style={styles.footer}>
          <PillButton title="Save" variant="green" onPress={save} />
        </View>
      </KeyboardAvoidingView>

      <Modal visible={pickerOpen} transparent animationType="slide">
        <View style={styles.sheetBackdrop}>
          <Pressable style={styles.backdropTouch} onPress={() => setPickerOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choose an avatar</Text>
              <Pressable onPress={() => setPickerOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={Colors.textMuted} />
              </Pressable>
            </View>
            <View style={styles.avatarGrid}>
              {AVATARS.map((a) => {
                const selected = a.id === pickerSelection;
                return (
                  <Pressable
                    key={a.id}
                    onPress={() => setPickerSelection(a.id)}
                    style={[
                      styles.gridAvatar,
                      { backgroundColor: a.bg },
                      selected && styles.gridAvatarSelected,
                    ]}>
                    <Text style={styles.gridAvatarEmoji}>{a.emoji}</Text>
                  </Pressable>
                );
              })}
            </View>
            <PillButton
              title="Save"
              variant="green"
              onPress={() => {
                setAvatarId(pickerSelection);
                setPickerOpen(false);
              }}
            />
          </View>
        </View>
      </Modal>
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
  form: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  avatarWrap: {
    alignSelf: 'center',
    marginVertical: 8,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 56,
  },
  cameraBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.tabActive,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 4,
  },
  input: {
    height: 52,
    borderRadius: Radii.inset,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(31,36,48,0.45)',
    justifyContent: 'flex-end',
  },
  backdropTouch: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    gap: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  gridAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridAvatarSelected: {
    borderWidth: 3,
    borderColor: '#35C97A',
  },
  gridAvatarEmoji: {
    fontSize: 36,
  },
});
