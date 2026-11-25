import type { Backplate, PlateArtKey, PlateField } from '@/types';

/**
 * Presentation defaults for records created before projects carried a `presentation` field.
 * Every project image published at that point was a logo or app icon, so these only describe
 * how each logo sits on its plate. A value saved through the admin panel always wins.
 */
interface LegacySpec {
  backplate: Backplate;
  /** Padding inside the print, as a fraction of its width. */
  inset: number;
  art?: PlateArtKey;
  field?: PlateField;
}

const SPECS: Record<string, LegacySpec> = {
  qirushio: { backplate: 'white', inset: 0.12, art: 'timer', field: 'night' },
  'screen-timer': { backplate: 'white', inset: 0.08, art: 'day', field: 'paper' },
  pathyvo: { backplate: 'bleed', inset: 0, art: 'route', field: 'violet' },
  'ai-powered-personal-portfolio': { backplate: 'white', inset: 0 },
  'workout-planner': { backplate: 'black', inset: 0.08 },
  'dundar-group': { backplate: 'white', inset: 0.16 },
  'autonomous-tutor': { backplate: 'mist', inset: 0.04 },
  fiyatiq: { backplate: 'white', inset: 0.06 },
  'adana-panjur': { backplate: 'ink', inset: 0.16 },
  'cevik-forklift': { backplate: 'black', inset: 0 },
  'wxco-design': { backplate: 'black', inset: 0 },
  'eren-karot': { backplate: 'black', inset: 0 },
  'wxco-food': { backplate: 'white', inset: 0.06 },
  'price-tracking-application': { backplate: 'white', inset: 0.14 },
  'hbo-max-app': { backplate: 'black', inset: 0 },
  'todo-gemini': { backplate: 'mist', inset: 0 },
};

const DEFAULT: LegacySpec = { backplate: 'white', inset: 0.12 };

export function legacyPresentation(slug: string): LegacySpec {
  return SPECS[slug] ?? DEFAULT;
}
