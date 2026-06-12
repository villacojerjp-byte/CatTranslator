import type { Mode } from '@/constants/theme';
import { CAT_SOUNDS } from '@/lib/sounds';

const CAT_PHRASES = [
  'I am hungry!',
  'Pet me, human!',
  'I love you so much',
  'Let me sleep…',
  'Play with me!',
  'Open the door right now',
  'Where is my food?',
  'I missed you',
  "Don't touch my belly",
  'I want a treat',
  'Everything here belongs to me',
  'I saw a bird outside!',
  'Clean my litter box, please',
  'I demand attention',
  'You are my favorite human',
];

function hashString(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  return Math.abs(h);
}

export interface CatTranslation {
  phrase: string;
}

/**
 * "Translates" a cat recording into human language. Deterministic for the
 * same recording (duration + uri are the seed) so re-playing feels stable.
 */
export function translateCatToHuman(durationMs: number, uri: string): CatTranslation {
  const seed = hashString(`${Math.round(durationMs / 100)}:${uri}`);
  return { phrase: CAT_PHRASES[seed % CAT_PHRASES.length] };
}

export interface PeopleTranslation {
  /** ids into CAT_SOUNDS, played back-to-back as the cat version */
  soundIds: string[];
}

const KEYWORD_SOUNDS: { pattern: RegExp; soundId: string }[] = [
  { pattern: /\b(food|hungry|eat|dinner|breakfast|treat)\b/i, soundId: 'hungry' },
  { pattern: /\b(love|kiss|cute|beautiful|miss)\b/i, soundId: 'love' },
  { pattern: /\b(play|toy|ball|fun)\b/i, soundId: 'playful' },
  { pattern: /\b(sleep|nap|bed|tired|night)\b/i, soundId: 'sleepy' },
  { pattern: /\b(hello|hi|hey|morning)\b/i, soundId: 'hello' },
  { pattern: /\b(no|stop|bad|don'?t)\b/i, soundId: 'angry' },
  { pattern: /\b(good|nice|relax|calm)\b/i, soundId: 'purr' },
  { pattern: /\b(come|here|look)\b/i, soundId: 'attention' },
  { pattern: /\b(what|why|how|where)\b/i, soundId: 'curious' },
];

/**
 * "Translates" a human message (typed text, or a voice recording described by
 * its duration) into a sequence of cat sounds.
 */
export function translateHumanToCat(input: { text?: string; durationMs?: number }): PeopleTranslation {
  const ids: string[] = [];

  if (input.text) {
    for (const { pattern, soundId } of KEYWORD_SOUNDS) {
      if (pattern.test(input.text) && !ids.includes(soundId)) {
        ids.push(soundId);
      }
      if (ids.length >= 3) break;
    }
    if (ids.length === 0) {
      const seed = hashString(input.text);
      ids.push(CAT_SOUNDS[seed % CAT_SOUNDS.length].id);
    }
  } else {
    // Voice: scale the number of meows with how long the human spoke.
    const duration = input.durationMs ?? 1500;
    const count = Math.max(1, Math.min(4, Math.round(duration / 1800)));
    const seed = hashString(String(Math.round(duration / 100)));
    const friendly = ['hello', 'love', 'playful', 'curious', 'greeting', 'attention', 'purr'];
    for (let i = 0; i < count; i++) {
      ids.push(friendly[(seed + i * 7) % friendly.length]);
    }
  }

  return { soundIds: ids };
}

export function defaultLabel(mode: Mode, translation: { phrase?: string; sourceText?: string }): string {
  if (mode === 'cat') return translation.phrase ?? 'Meow';
  return translation.sourceText?.slice(0, 40) || 'Voice message';
}
