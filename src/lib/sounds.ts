import { Colors } from '@/constants/theme';

export interface CatSound {
  id: string;
  label: string;
  catEmoji: string;
  badge: string;
  tint: string;
  source: number;
}

export const CAT_SOUNDS: CatSound[] = [
  {
    id: 'hello',
    label: 'Hello',
    catEmoji: '😺',
    badge: '👋',
    tint: Colors.pastelBlue,
    source: require('../../assets/sounds/meow-hello.wav'),
  },
  {
    id: 'hungry',
    label: 'Hungry',
    catEmoji: '😼',
    badge: '🍗',
    tint: Colors.pastelPink,
    source: require('../../assets/sounds/meow-hungry.wav'),
  },
  {
    id: 'love',
    label: 'Love',
    catEmoji: '😻',
    badge: '❤️',
    tint: Colors.pastelPeach,
    source: require('../../assets/sounds/meow-love.wav'),
  },
  {
    id: 'angry',
    label: 'Angry',
    catEmoji: '😾',
    badge: '💢',
    tint: Colors.pastelPeach,
    source: require('../../assets/sounds/angry.wav'),
  },
  {
    id: 'sad',
    label: 'Sad',
    catEmoji: '😿',
    badge: '💧',
    tint: Colors.pastelBlue,
    source: require('../../assets/sounds/meow-sad.wav'),
  },
  {
    id: 'sleepy',
    label: 'Sleepy',
    catEmoji: '😴',
    badge: '💤',
    tint: Colors.pastelPink,
    source: require('../../assets/sounds/meow-sleepy.wav'),
  },
  {
    id: 'playful',
    label: 'Playful',
    catEmoji: '😸',
    badge: '🎾',
    tint: Colors.pastelPink,
    source: require('../../assets/sounds/chirp-playful.wav'),
  },
  {
    id: 'purr',
    label: 'Purr',
    catEmoji: '😌',
    badge: '✨',
    tint: Colors.pastelPeach,
    source: require('../../assets/sounds/purr.wav'),
  },
  {
    id: 'attention',
    label: 'Attention',
    catEmoji: '🙀',
    badge: '📢',
    tint: Colors.pastelBlue,
    source: require('../../assets/sounds/meow-attention.wav'),
  },
  {
    id: 'curious',
    label: 'Curious',
    catEmoji: '🐱',
    badge: '❓',
    tint: Colors.pastelPeach,
    source: require('../../assets/sounds/meow-curious.wav'),
  },
  {
    id: 'scared',
    label: 'Scared',
    catEmoji: '🙀',
    badge: '⚡',
    tint: Colors.pastelBlue,
    source: require('../../assets/sounds/yowl-scared.wav'),
  },
  {
    id: 'greeting',
    label: 'Trill',
    catEmoji: '😽',
    badge: '🎵',
    tint: Colors.pastelPink,
    source: require('../../assets/sounds/trill-greeting.wav'),
  },
];

export function getSound(id: string): CatSound | undefined {
  return CAT_SOUNDS.find((s) => s.id === id);
}
