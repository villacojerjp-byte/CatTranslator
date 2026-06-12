import type { Mode } from '@/constants/theme';

export type Gender = 'male' | 'female';

export interface Cat {
  id: string;
  name: string;
  gender: Gender;
  age: string;
  breed: string;
  avatarId: string;
}

export interface TranslationEntry {
  id: string;
  mode: Mode;
  /** Short result label, e.g. "I am hungry!" */
  label: string;
  /** For people mode: the original spoken/typed message */
  sourceText?: string;
  /** file:// uri of the user's recording, if voice was used */
  recordingUri?: string;
  /** Bundled sound ids to replay the generated cat sounds (people mode) */
  soundIds?: string[];
  createdAt: string; // ISO date
  catId?: string;
}

export type { Mode };
