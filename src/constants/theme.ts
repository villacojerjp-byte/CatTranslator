export const Colors = {
  // App surfaces
  background: '#FAFBFE',
  card: '#FFFFFF',
  cardBorder: '#EEF1F7',
  inset: '#F4F6FB',

  // Text
  text: '#1F2430',
  textMuted: '#8A93A6',
  textFaint: '#B7BECC',

  // Mode accents
  cat: '#E8485C',
  catSoft: '#FBE7EE',
  people: '#ED8A5A',
  peopleSoft: '#FDF0E3',

  // Primary action gradients
  blueGradient: ['#4D7DF2', '#3B5FE0'] as const,
  greenGradient: ['#4CD98A', '#35C97A'] as const,

  // Onboarding / paywall (dark world)
  purple: '#6C4BF4',
  purpleLight: '#7B5CFF',
  yellow: '#FFD83D',
  darkBg: '#16121F',

  // Pastel tints for tiles & avatars
  pastelBlue: '#E4EEFB',
  pastelPink: '#FBE7EE',
  pastelPeach: '#FDF0E3',
  pastelGreen: '#E3F6EB',
  pastelLilac: '#EFE9FB',

  // Tab bar
  tabActive: '#4D7DF2',
  tabInactive: '#A6ADBD',
} as const;

export const Radii = {
  card: 20,
  pill: 28,
  inset: 14,
} as const;

export const Shadow = {
  card: {
    shadowColor: '#1F2430',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
} as const;

export type Mode = 'cat' | 'people';

export function modeColor(mode: Mode): string {
  return mode === 'cat' ? Colors.cat : Colors.people;
}

export function modeSoftColor(mode: Mode): string {
  return mode === 'cat' ? Colors.catSoft : Colors.peopleSoft;
}
