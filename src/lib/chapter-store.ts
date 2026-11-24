'use client';

import { create } from 'zustand';
import type { ChapterId } from '@/lib/content/copy';

interface ChapterState {
  active: ChapterId | null;
  paletteOpen: boolean;
  setActive: (id: ChapterId | null) => void;
  setPaletteOpen: (open: boolean) => void;
}

export const useChapterStore = create<ChapterState>((set) => ({
  active: null,
  paletteOpen: false,
  setActive: (active) => set((s) => (s.active === active ? s : { active })),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
}));
