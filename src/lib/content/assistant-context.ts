import { pick, type Lang, type Portfolio } from './portfolio';

export const MAX_CONTEXT_CHARS = 12_000;
const MAX_DESC_CHARS = 280;

const clip = (text: string, max = MAX_DESC_CHARS) => (text.length > max ? `${text.slice(0, max)}…` : text);

/**
 * The assistant's knowledge, built on the server from the same published, listed content the
 * site renders. Drafts, archived projects and contact submissions never reach it.
 */
export function buildAssistantContext(portfolio: Portfolio, lang: Lang): string {
  const l = (v: Parameters<typeof pick>[0]) => pick(v, lang);
  const { profile, hero, about, contact, projects, skills, journey, availability } = portfolio;
  const parts: string[] = [];

  parts.push(`Name: ${profile.fullName}`, `Role: ${l(profile.role)}`);
  if (hero.title) parts.push(`Title: ${l(hero.title)}`);
  if (hero.description) parts.push(`Bio: ${l(hero.description)}`);
  const aboutText = (about.paragraphs[lang].length ? about.paragraphs[lang] : about.paragraphs.en).join(' ');
  if (aboutText) parts.push(`About: ${clip(aboutText, 900)}`);

  parts.push(`Email: ${contact.email}`, `Location: ${l(contact.location)}`);
  for (const [platform, url] of Object.entries(contact.social)) if (url) parts.push(`${platform}: ${url}`);

  parts.push(`\nProjects (${projects.length}):`);
  for (const p of projects) {
    const cats = p.categories.join(', ');
    const role = p.role ? ` Role: ${l(p.role)}.` : '';
    parts.push(`- ${l(p.title)}: ${clip(l(p.description))}${role} [${p.stack.join(', ')}] [${cats}]`);
  }

  const skillNames = skills.map((s) => s.name);
  if (skillNames.length) parts.push(`\nSkills: ${skillNames.join(', ')}`);

  if (journey.length) {
    parts.push('\nExperience & Education:');
    for (const j of journey) parts.push(`- [${j.type}] ${l(j.title)} @ ${l(j.org)} (${l(j.period)})`);
  }

  if (availability) parts.push(`\nAvailability: ${l(availability.label)}`);

  const text = parts.join('\n');
  return text.length > MAX_CONTEXT_CHARS ? `${text.slice(0, MAX_CONTEXT_CHARS)}…` : text;
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  text: string;
}

/** Accepts only well-formed recent turns; everything else from the client is dropped. */
export function sanitizeHistory(raw: unknown, maxTurns = 4, maxChars = 500): ChatTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is ChatTurn =>
        !!m && typeof m === 'object' && (m.role === 'user' || m.role === 'assistant') && typeof m.text === 'string'
    )
    .slice(-maxTurns)
    .map((m) => ({ role: m.role, text: m.text.slice(0, maxChars) }));
}
