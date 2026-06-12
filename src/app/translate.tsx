import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
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
import { PlayRow } from '@/components/play-row';
import { SegmentedToggle } from '@/components/segmented-toggle';
import { LiveWaveform } from '@/components/waveform';
import { Colors, modeColor, modeSoftColor, Radii, Shadow, type Mode } from '@/constants/theme';
import { stopPlayback } from '@/lib/audio';
import { getAvatar } from '@/lib/avatars';
import { newId, useStore } from '@/lib/store';
import { getSound } from '@/lib/sounds';
import { translateCatToHuman, translateHumanToCat } from '@/lib/translate';

type Phase = 'idle' | 'recording' | 'result';

interface Result {
  mode: Mode;
  label: string;
  translateText: string;
  sourceText?: string;
  recordingUri?: string;
  soundIds?: string[];
}

export default function Translate() {
  const router = useRouter();
  const { activeCat, addHistory } = useStore();
  const avatar = getAvatar(activeCat?.avatarId);

  const [mode, setMode] = useState<Mode>('cat');
  const [phase, setPhase] = useState<Phase>('idle');
  const [result, setResult] = useState<Result | null>(null);
  const [text, setText] = useState('');

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const accent = modeColor(mode);
  const soft = modeSoftColor(mode);

  const [pulse] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (phase !== 'recording') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [phase, pulse]);

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const startRecording = async () => {
    const permission = await AudioModule.requestRecordingPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Microphone needed',
        'Allow microphone access in Settings to record and translate sounds.'
      );
      return;
    }
    stopPlayback();
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPhase('recording');
  };

  const stopRecording = async () => {
    const durationMs = recorderState.durationMillis ?? 0;
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    const uri = recorder.uri ?? undefined;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (mode === 'cat') {
      const { phrase } = translateCatToHuman(durationMs, uri ?? '');
      setResult({
        mode,
        label: phrase,
        translateText: phrase,
        recordingUri: uri,
      });
    } else {
      const { soundIds } = translateHumanToCat({ durationMs });
      setResult({
        mode,
        label: 'Voice message',
        translateText: soundIds.map(() => 'Meow!').join(' '),
        recordingUri: uri,
        soundIds,
      });
    }
    setPhase('result');
  };

  const translateText = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const { soundIds } = translateHumanToCat({ text: trimmed });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setResult({
      mode,
      label: trimmed.slice(0, 40),
      translateText: soundIds
        .map((id) => getSound(id)?.label ?? 'Meow')
        .map((l) => `Meow (${l.toLowerCase()})`)
        .join(' · '),
      sourceText: trimmed,
      soundIds,
    });
    setPhase('result');
  };

  const save = () => {
    if (!result) return;
    addHistory({
      id: newId(),
      mode: result.mode,
      label: result.label,
      sourceText: result.sourceText,
      recordingUri: result.recordingUri,
      soundIds: result.soundIds,
      createdAt: new Date().toISOString(),
      catId: activeCat?.id,
    });
    router.back();
  };

  const reset = () => {
    stopPlayback();
    setResult(null);
    setText('');
    setPhase('idle');
  };

  const switchMode = (next: Mode) => {
    if (phase === 'recording') return;
    setMode(next);
    reset();
  };

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0.15] });

  return (
    <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            if (phase === 'recording') return;
            router.back();
          }}
          hitSlop={12}
          style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={Colors.textMuted} />
        </Pressable>
        <Text style={styles.headerTitle}>Translator</Text>
        <View style={styles.closeBtn} />
      </View>

      <SegmentedToggle
        style={styles.toggle}
        value={mode}
        onChange={switchMode}
        options={[
          { value: 'cat', label: 'Cat', color: Colors.cat },
          { value: 'people', label: 'People', color: Colors.people },
        ]}
      />

      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {phase === 'idle' && (
          <View style={styles.body}>
            <View style={styles.centerArea}>
              <Pressable onPress={startRecording}>
                <View style={[styles.bigCircle, { backgroundColor: soft }]}>
                  <View style={[styles.midCircle, { backgroundColor: `${accent}33` }]}>
                    <View style={[styles.micCircle, { backgroundColor: accent }]}>
                      <Ionicons name="mic" size={30} color="#FFFFFF" />
                    </View>
                  </View>
                </View>
              </Pressable>
              <Text style={styles.caption}>
                {mode === 'cat'
                  ? "Tap and record your cat's meow"
                  : 'Tap and record your message for the cat'}
              </Text>
            </View>

            {mode === 'people' && (
              <View style={styles.textBox}>
                <TextInput
                  style={styles.input}
                  value={text}
                  onChangeText={setText}
                  placeholder="Or type a message…"
                  placeholderTextColor={Colors.textFaint}
                  returnKeyType="done"
                  onSubmitEditing={translateText}
                />
                <PillButton title="Translate" variant="green" onPress={translateText} />
              </View>
            )}
          </View>
        )}

        {phase === 'recording' && (
          <View style={styles.body}>
            <View style={styles.centerArea}>
              <Animated.View
                style={[
                  styles.bigCircle,
                  { backgroundColor: soft, transform: [{ scale: ringScale }], opacity: ringOpacity },
                ]}
              />
              <View style={[styles.recordingOverlay]} pointerEvents="none">
                <View style={[styles.midCircle, { backgroundColor: `${accent}33` }]}>
                  <View style={[styles.micCircle, { backgroundColor: accent }]}>
                    <Ionicons name="mic" size={30} color="#FFFFFF" />
                  </View>
                </View>
              </View>
              <Text style={styles.caption}>Sound recording in progress</Text>
              <LiveWaveform color={accent} style={styles.liveWave} />
            </View>
            <View style={styles.footer}>
              <PillButton
                title="Stop recording"
                variant={mode === 'cat' ? 'cat' : 'people'}
                onPress={stopRecording}
              />
            </View>
          </View>
        )}

        {phase === 'result' && result && (
          <ScrollView contentContainerStyle={styles.resultScroll}>
            <Text style={styles.resultTitle}>
              The translation <Text style={{ color: accent }}>is done</Text>
            </Text>

            <View style={styles.card}>
              <Text style={styles.cardLabel}>Recorded sound:</Text>
              {result.recordingUri ? (
                <PlayRow
                  thumbEmoji={mode === 'cat' ? avatar.emoji : '🧑'}
                  thumbBg={mode === 'cat' ? avatar.bg : Colors.pastelPeach}
                  accent={accent}
                  uri={result.recordingUri}
                  waveformSeed={result.recordingUri}
                />
              ) : null}
              {result.soundIds && result.soundIds.length > 0 && (
                <>
                  {result.recordingUri ? <Text style={styles.cardLabel}>Cat version:</Text> : null}
                  <PlayRow
                    thumbEmoji={avatar.emoji}
                    thumbBg={avatar.bg}
                    accent={accent}
                    soundIds={result.soundIds}
                    waveformSeed={result.soundIds.join(',')}
                  />
                </>
              )}

              <View style={styles.divider}>
                <Ionicons name="arrow-down" size={18} color={Colors.textFaint} />
              </View>

              <Text style={styles.cardLabel}>Translate:</Text>
              <View style={styles.translateBox}>
                <Text style={styles.translateText}>{result.translateText}</Text>
              </View>
            </View>

            <Pressable onPress={reset}>
              <Text style={styles.rerecord}>Re-record</Text>
            </Pressable>

            <PillButton
              title="Save translate"
              variant={mode === 'cat' ? 'cat' : 'people'}
              onPress={save}
            />
          </ScrollView>
        )}
      </KeyboardAvoidingView>
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
    paddingVertical: 10,
  },
  closeBtn: {
    width: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
  },
  toggle: {
    marginHorizontal: 20,
    marginBottom: 8,
  },
  body: {
    flex: 1,
  },
  centerArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  bigCircle: {
    width: 290,
    height: 290,
    borderRadius: 145,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  midCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  liveWave: {
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  textBox: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
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
  resultScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radii.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    gap: 12,
    ...Shadow.card,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  divider: {
    alignItems: 'center',
  },
  translateBox: {
    backgroundColor: Colors.inset,
    borderRadius: Radii.inset,
    padding: 14,
  },
  translateText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
  },
  rerecord: {
    textAlign: 'center',
    color: Colors.tabActive,
    fontSize: 15,
    fontWeight: '600',
  },
});
