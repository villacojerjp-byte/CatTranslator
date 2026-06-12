import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { Cat, TranslationEntry } from '@/lib/types';

const STORAGE_KEY = 'cat-translator/state/v1';

interface PersistedState {
  onboarded: boolean;
  pro: boolean;
  cats: Cat[];
  activeCatId: string | null;
  history: TranslationEntry[];
}

const DEFAULT_CAT: Cat = {
  id: 'default-cat',
  name: 'My Love Cat',
  gender: 'female',
  age: '',
  breed: '',
  avatarId: 'avatar-3',
};

const INITIAL_STATE: PersistedState = {
  onboarded: false,
  pro: false,
  cats: [DEFAULT_CAT],
  activeCatId: DEFAULT_CAT.id,
  history: [],
};

interface StoreValue extends PersistedState {
  hydrated: boolean;
  activeCat: Cat | null;
  completeOnboarding: () => void;
  setPro: (pro: boolean) => void;
  addCat: (cat: Cat) => void;
  updateCat: (cat: Cat) => void;
  deleteCat: (id: string) => void;
  setActiveCat: (id: string) => void;
  addHistory: (entry: TranslationEntry) => void;
  deleteHistory: (id: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as Partial<PersistedState>;
            setState({ ...INITIAL_STATE, ...parsed });
          } catch {
            // corrupted state: start fresh
          }
        }
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
    }, 150);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [state, hydrated]);

  const completeOnboarding = useCallback(() => {
    setState((s) => ({ ...s, onboarded: true }));
  }, []);

  const setPro = useCallback((pro: boolean) => {
    setState((s) => ({ ...s, pro }));
  }, []);

  const addCat = useCallback((cat: Cat) => {
    setState((s) => ({ ...s, cats: [...s.cats, cat], activeCatId: s.activeCatId ?? cat.id }));
  }, []);

  const updateCat = useCallback((cat: Cat) => {
    setState((s) => ({ ...s, cats: s.cats.map((c) => (c.id === cat.id ? cat : c)) }));
  }, []);

  const deleteCat = useCallback((id: string) => {
    setState((s) => {
      const cats = s.cats.filter((c) => c.id !== id);
      const activeCatId = s.activeCatId === id ? (cats[0]?.id ?? null) : s.activeCatId;
      return { ...s, cats, activeCatId };
    });
  }, []);

  const setActiveCat = useCallback((id: string) => {
    setState((s) => ({ ...s, activeCatId: id }));
  }, []);

  const addHistory = useCallback((entry: TranslationEntry) => {
    setState((s) => ({ ...s, history: [entry, ...s.history] }));
  }, []);

  const deleteHistory = useCallback((id: string) => {
    setState((s) => ({ ...s, history: s.history.filter((h) => h.id !== id) }));
  }, []);

  const value = useMemo<StoreValue>(() => {
    const activeCat = state.cats.find((c) => c.id === state.activeCatId) ?? state.cats[0] ?? null;
    return {
      ...state,
      hydrated,
      activeCat,
      completeOnboarding,
      setPro,
      addCat,
      updateCat,
      deleteCat,
      setActiveCat,
      addHistory,
      deleteHistory,
    };
  }, [
    state,
    hydrated,
    completeOnboarding,
    setPro,
    addCat,
    updateCat,
    deleteCat,
    setActiveCat,
    addHistory,
    deleteHistory,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
