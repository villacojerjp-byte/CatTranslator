import { Colors } from '@/constants/theme';

export interface CatAvatar {
  id: string;
  emoji: string;
  bg: string;
}

const tints = [
  Colors.pastelBlue,
  Colors.pastelPink,
  Colors.pastelPeach,
  Colors.pastelGreen,
  Colors.pastelLilac,
];

const emojis = ['😺', '😸', '😻', '😽', '🐱', '😼', '🙀', '😹', '😾', '😿', '🐈', '🐈‍⬛'];

export const AVATARS: CatAvatar[] = emojis.map((emoji, i) => ({
  id: `avatar-${i + 1}`,
  emoji,
  bg: tints[i % tints.length],
}));

export function getAvatar(id: string | undefined): CatAvatar {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}
