/**
 * How each existing project image should be presented. Every project image currently
 * published is a logo or app icon (audited against the live data), not an interface
 * screenshot, so the default kind is 'logo'. Logos are never recoloured: the backplate
 * matches the colour baked into the file, or is chosen for contrast when it is transparent.
 */
export type AssetKind = 'logo' | 'photo' | 'screenshot' | 'diagram';
export type Backplate = 'white' | 'black' | 'ink' | 'paper' | 'mist' | 'bleed';

export interface AssetSpec {
  kind: AssetKind;
  plate: Backplate;
  /** Padding inside the print, as a fraction of its width. Lower for logos that already carry margins. */
  inset?: number;
}

const SPECS: Record<string, AssetSpec> = {
  qirushio: { kind: 'logo', plate: 'white', inset: 0.12 },
  'screen-timer': { kind: 'logo', plate: 'white', inset: 0.08 },
  pathyvo: { kind: 'logo', plate: 'bleed', inset: 0 },
  'ai-powered-personal-portfolio': { kind: 'logo', plate: 'white', inset: 0 },
  'workout-planner': { kind: 'logo', plate: 'black', inset: 0.08 },
  'dundar-group': { kind: 'logo', plate: 'white', inset: 0.16 },
  'autonomous-tutor': { kind: 'logo', plate: 'mist', inset: 0.04 },
  fiyatiq: { kind: 'logo', plate: 'white', inset: 0.06 },
  'adana-panjur': { kind: 'logo', plate: 'ink', inset: 0.16 },
  'cevik-forklift': { kind: 'logo', plate: 'black', inset: 0 },
  'wxco-design': { kind: 'logo', plate: 'black', inset: 0 },
  'eren-karot': { kind: 'logo', plate: 'black', inset: 0 },
  'wxco-food': { kind: 'logo', plate: 'white', inset: 0.06 },
  'price-tracking-application': { kind: 'logo', plate: 'white', inset: 0.14 },
  'hbo-max-app': { kind: 'logo', plate: 'black', inset: 0 },
  'todo-gemini': { kind: 'logo', plate: 'mist', inset: 0 },
};

/** Unknown images (added later through the admin panel) get a neutral white print. */
export function assetSpecFor(slug: string): AssetSpec {
  return SPECS[slug] ?? { kind: 'logo', plate: 'white', inset: 0.12 };
}
