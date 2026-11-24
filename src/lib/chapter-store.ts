'use client';

import { create } from 'zustand';
import type { ChapterId } from '@/lib/content/copy';

interface ChapterState {
  active: ChapterId | null;
  paletteOpen: boolean;
  indexOpen: boolean;
  cvOpen: boolean;
  setActive: (id: ChapterId | null) => void;
  setPaletteOpen: (open: boolean) => void;
  setIndexOpen: (open: boolean) => void;
  setCvOpen: (open: boolean) => void;
}

export const useChapterStore = create<ChapterState>((set) => ({
  active: null,
  paletteOpen: false,
  indexOpen: false,
  cvOpen: false,
  setActive: (active) => set((s) => (s.active === active ? s : { active })),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
  setIndexOpen: (indexOpen) => set({ indexOpen }),
  setCvOpen: (cvOpen) => set({ cvOpen }),
}));
