import { createAudioPlayer, setAudioModeAsync, type AudioSource } from 'expo-audio';

let activePlayer: ReturnType<typeof createAudioPlayer> | null = null;
let sequenceToken = 0;

async function playbackMode() {
  await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });
}

function stopActive() {
  if (activePlayer) {
    try {
      activePlayer.remove();
    } catch {
      // already released
    }
    activePlayer = null;
  }
}

/** Play a single source, stopping anything already playing. */
export async function playSound(source: AudioSource, onFinish?: () => void): Promise<void> {
  sequenceToken += 1;
  stopActive();
  await playbackMode();
  const player = createAudioPlayer(source);
  activePlayer = player;
  const sub = player.addListener('playbackStatusUpdate', (status) => {
    if (status.didJustFinish) {
      sub.remove();
      if (activePlayer === player) {
        stopActive();
      }
      onFinish?.();
    }
  });
  player.play();
}

/** Play several bundled sources back-to-back (used for generated cat speech). */
export async function playSequence(sources: AudioSource[], onFinish?: () => void): Promise<void> {
  sequenceToken += 1;
  const token = sequenceToken;
  stopActive();
  await playbackMode();

  const playNext = (index: number) => {
    if (token !== sequenceToken) return; // superseded by another playback
    if (index >= sources.length) {
      onFinish?.();
      return;
    }
    const player = createAudioPlayer(sources[index]);
    activePlayer = player;
    const sub = player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) {
        sub.remove();
        if (activePlayer === player) {
          try {
            player.remove();
          } catch {
            // already released
          }
          activePlayer = null;
        }
        playNext(index + 1);
      }
    });
    player.play();
  };

  playNext(0);
}

export function stopPlayback() {
  sequenceToken += 1;
  stopActive();
}
