import type { Loc } from './portfolio';

interface LayerDef {
  id: string;
  name: Loc;
  match: RegExp;
}

/** Ordered top (closest to the user) to bottom (closest to the metal). */
const LAYERS: LayerDef[] = [
  {
    id: 'interface',
    name: { en: 'Interface', tr: 'Arayüz' },
    match: /\b(html|css|javascript|vanilla js|typescript|react|next\.?js|vue|svelte|angular|tailwind|kotlin|swift|flutter|jetpack|compose|android|ios|chrome extension|electron|figma)/i,
  },
  {
    id: 'intelligence',
    name: { en: 'Intelligence', tr: 'Zekâ' },
    match: /\b(llm|gemini|openai|gpt|claude|langchain|tensorflow|pytorch|scikit|machine learning|ml|ai)\b/i,
  },
  {
    id: 'services',
    name: { en: 'Services', tr: 'Servisler' },
    match: /\b(python|fastapi|django|flask|node|express|nest|java\b|spring|go\b|golang|rust|c#|\.net|php|laravel|graphql|rest)/i,
  },
  {
    id: 'data',
    name: { en: 'Data', tr: 'Veri' },
    match: /\b(postgres|mysql|sqlite|mongo|redis|supabase|firebase|firestore|prisma|sql)/i,
  },
  {
    id: 'infrastructure',
    name: { en: 'Infrastructure', tr: 'Altyapı' },
    match: /\b(docker|kubernetes|vercel|netlify|google cloud|gcp|aws|azure|cloudflare|github actions|ci\/cd|linux|nginx)/i,
  },
];

const OTHER: Loc = { en: 'Other', tr: 'Diğer' };

export interface Stratum {
  id: string;
  name: Loc;
  items: string[];
}

export function stackStrata(stack: string[]): Stratum[] {
  const groups = new Map<string, string[]>();
  for (const tech of stack) {
    const layer = LAYERS.find((l) => l.match.test(tech));
    const id = layer?.id ?? 'other';
    groups.set(id, [...(groups.get(id) ?? []), tech]);
  }
  const ordered: Stratum[] = LAYERS.filter((l) => groups.has(l.id)).map((l) => ({
    id: l.id,
    name: l.name,
    items: groups.get(l.id)!,
  }));
  if (groups.has('other')) ordered.push({ id: 'other', name: OTHER, items: groups.get('other')! });
  return ordered;
}
