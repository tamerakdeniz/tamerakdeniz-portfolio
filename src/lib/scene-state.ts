/**
 * Shared, mutable state for the home page's single scroll/scene lifecycle.
 * Written by the ScrollDirector, read every frame by the ocean scene and instruments.
 * Deliberately not React state: it changes every frame and must never trigger renders.
 */
export interface SceneState {
  /** 0–1 normalized progress through the seven chapters (metaphorical depth). */
  depth: number;
  /** 0–1 progress through the hero descent. */
  hero: number;
  /** Waterline as a fraction of the scene canvas height from the top (may go negative). */
  water: number;
  /** Waterline in CSS pixels from the top of the viewport. */
  waterPx: number;
  /** Scroll position in viewport heights. */
  scroll: number;
  /** Smoothed scroll velocity, viewport heights per frame. */
  velocity: number;
  /** Depth the Expedition Index is previewing, or -1. */
  preview: number;
  /** Pointer in -1..1, y up. */
  pointer: { x: number; y: number };
  /** Recent pointer movement; drives surface ripples. */
  energy: number;
  /** True while any input happened recently. */
  lastInput: number;
}

export const scene: SceneState = {
  depth: 0,
  hero: 0,
  water: 0.46,
  waterPx: 360,
  scroll: 0,
  velocity: 0,
  preview: -1,
  pointer: { x: 0.35, y: 0.1 },
  energy: 0,
  lastInput: 0,
};

type FrameListener = (state: SceneState) => void;
const listeners = new Set<FrameListener>();

/** Instruments (rail, hero clip) subscribe here instead of running their own loops. */
export function onSceneFrame(listener: FrameListener) {
  listeners.add(listener);
  listener(scene);
  return () => {
    listeners.delete(listener);
  };
}

export function emitSceneFrame() {
  listeners.forEach((l) => l(scene));
}

export function motionAllowed() {
  if (typeof window === 'undefined') return false;
  if (document.documentElement.dataset.motion === 'off') return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
