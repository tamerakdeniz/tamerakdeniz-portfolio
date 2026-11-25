import { timelinePeriod } from './timeline';
import type {
  Backplate,
  EngineeringPillar,
  LocalizedString,
  MediaKind,
  PlateArtKey,
  PlateField,
  PresentationVariant,
  Project,
  SiteData,
  Skill,
  TimelineEntry,
} from '@/types';
import { getCvDownloadHref } from '@/lib/download-file';
import { legacyPresentation } from './legacy-presentation';

export type Lang = 'en' | 'tr';
export type Loc = LocalizedString;

/** Deployment constants and the fallback identity used until `profile` is set in the admin panel. */
export const OWNER = {
  fullName: 'Mustafa Tamer Akdeniz',
  shortName: 'Tamer Akdeniz',
  monogram: 'MTA',
  siteUrl: 'https://tamerakdeniz.com',
  role: { en: 'Software Developer', tr: 'Yazılım Geliştirici' } as Loc,
} as const;

const FALLBACK_FIELD_PHOTO = {
  url: '/img/underwaterme.jpg',
  alt: { en: 'Tamer Akdeniz scuba diving', tr: 'Tamer Akdeniz dalış yaparken' },
};

export const FEATURED_DEFAULT = 3;
export const FEATURED_MAX = 6;

const FALLBACK_CV = '/resume/Mustafa-Tamer-Akdeniz-Resume.pdf';
const FALLBACK_CONTACT = {
  email: 'info@tamerakdeniz.com',
  location: { en: 'Istanbul, TR', tr: 'İstanbul, TR' },
  social: {
    github: 'https://github.com/tamerakdeniz',
    linkedin: 'https://www.linkedin.com/in/tamerakdeniz/',
    instagram: 'https://www.instagram.com/tamerakdnz/',
  },
};

export interface PortfolioMedia {
  id: string;
  kind: MediaKind;
  url: string;
  alt: Loc;
  caption: Loc | null;
  width: number | null;
  height: number | null;
}

export type ResolvedVariant = Exclude<PresentationVariant, 'auto'>;

export interface ResolvedPresentation {
  variant: ResolvedVariant;
  accent: string | null;
  backplate: Backplate;
  inset: number;
  field: PlateField;
  art: PlateArtKey;
}

export interface PortfolioProject {
  id: string;
  slug: string;
  previousSlugs: string[];
  /** 1-based position in the published order. */
  number: number;
  title: Loc;
  name: Loc;
  subtitle: Loc | null;
  summary: Loc;
  description: Loc;
  categories: string[];
  stack: string[];
  /** The project's mark: a logo media item, or the legacy `image`. */
  image: string | null;
  logo: PortfolioMedia | null;
  cover: PortfolioMedia | null;
  desktop: PortfolioMedia[];
  mobile: PortfolioMedia[];
  diagrams: PortfolioMedia[];
  video: PortfolioMedia | null;
  /** True when the project has real interface imagery (screenshots, diagrams, cover or video). */
  hasImagery: boolean;
  presentation: ResolvedPresentation;
  links: { live?: string; demo?: string; source?: string };
  extraLinks: { label: Loc; url: string }[];
  role: Loc | null;
  contribution: Loc | null;
  period: Loc | null;
  status: string | null;
  year: string | null;
  featured: boolean;
  archived: boolean;
  sections: { heading: Loc; body: Loc }[];
}

export interface JourneyEntry {
  id: string;
  type: TimelineEntry['type'];
  title: Loc;
  org: Loc;
  period: Loc;
  description: Loc;
  startYear: string | null;
  endYear: string | null;
  /** Months since year 0 (year * 12 + month), parsed from the English period when possible. */
  start: number | null;
  end: number | null;
  ongoing: boolean;
  url: string | null;
}

export interface PortfolioSkill {
  name: string;
  categories: string[];
}

export interface PortfolioProfile {
  fullName: string;
  shortName: string;
  role: Loc;
  fieldPhoto: { url: string; alt: Loc; caption: Loc | null; note: Loc | null };
  pillars: EngineeringPillar[] | null;
}

export interface Portfolio {
  profile: PortfolioProfile;
  hero: { title: Loc | null; description: Loc | null; moreLabel: Loc | null };
  about: { title: Loc | null; paragraphs: { en: string[]; tr: string[] }; portrait: string | null };
  contact: {
    email: string;
    location: Loc;
    social: { github?: string; linkedin?: string; instagram?: string; upwork?: string };
  };
  availability: { status: string; label: Loc } | null;
  cv: { viewUrl: string; downloadUrl: string; fileName: string; variants?: Partial<Record<Lang, { viewUrl: string; downloadUrl: string; fileName: string }>> };
  /** Published and listed, in admin order. */
  projects: PortfolioProject[];
  /** Selected projects for the home page (see `selectFeatured`). */
  featured: PortfolioProject[];
  /** Listed projects that are not featured. */
  archive: PortfolioProject[];
  /** Published but archived: reachable by URL only. */
  unlisted: PortfolioProject[];
  /** Former slug → current slug, for permanent redirects. */
  redirects: Record<string, string>;
  journey: JourneyEntry[];
  skills: PortfolioSkill[];
  /** Whether the assistant has content to answer from. */
  assistant: boolean;
}

function toArray<T>(value: T[] | Record<string, T> | null | undefined): T[] {
  if (!value) return [];
  const list = Array.isArray(value) ? value : Object.values(value);
  return list.filter((item): item is T => item != null);
}

function loc(value: Partial<Loc> | null | undefined): Loc | null {
  const en = value?.en?.trim() ?? '';
  const tr = value?.tr?.trim() ?? '';
  if (!en && !tr) return null;
  return { en: en || tr, tr: tr || en };
}

function mapLoc(value: Loc, fn: (s: string) => string): Loc {
  return { en: fn(value.en), tr: fn(value.tr) };
}

export function safeUrl(value: string | null | undefined): string | undefined {
  const raw = value?.trim();
  if (!raw) return undefined;
  if (raw.startsWith('/')) return raw;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}

const TR_MAP: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', İ: 'i', ö: 'o', ş: 's', ü: 'u' };

export function slugify(input: string): string {
  return input
    .replace(/[çğıİöşü]/gi, (ch) => TR_MAP[ch] ?? TR_MAP[ch.toLowerCase()] ?? ch)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** "Qirushio – AI-Powered Quiz" → ["Qirushio", "AI-Powered Quiz"] */
function splitTitle(title: string): [string, string | null] {
  const match = title.match(/^(.+?)(?:\s+[–—-]\s+|:\s+)(.+)$/);
  return match ? [match[1].trim(), match[2].trim()] : [title.trim(), null];
}

/** The slug a project is published under, before collision suffixes. Shared with the admin form. */
export function baseSlug(p: { slug?: string; title?: { en?: string }; id: string }): string {
  return slugify(p.slug || splitTitle(p.title?.en ?? '')[0]) || p.id;
}

function firstSentence(text: string): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  const match = clean.match(/^.+?[.!?](?=\s|$)/);
  return match ? match[0] : clean;
}

function categoriesOf(value: string | string[] | undefined): string[] {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((c) => c.trim()).filter(Boolean);
}

const MEDIA_KINDS: MediaKind[] = ['cover', 'logo', 'desktop', 'mobile', 'diagram', 'video'];
const VARIANTS: ResolvedVariant[] = ['editorial', 'technical', 'mobile', 'immersive', 'minimal'];
const BACKPLATES: Backplate[] = ['white', 'black', 'ink', 'paper', 'mist', 'bleed'];
const FIELDS: PlateField[] = ['night', 'paper', 'violet', 'ink'];
const ARTS: PlateArtKey[] = ['none', 'timer', 'day', 'route'];

const oneOf = <T extends string>(value: unknown, allowed: readonly T[]): T | undefined =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;

const positive = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) && n > 0 ? Math.round(n) : null);

function buildMedia(p: Project, name: Loc): PortfolioMedia[] {
  return toArray(p.media)
    .map((m, i) => {
      const url = safeUrl(m?.url);
      const kind = oneOf(m?.kind, MEDIA_KINDS);
      if (!url || !kind) return null;
      return {
        item: {
          id: m.id || `${kind}-${i}`,
          kind,
          url,
          alt: loc(m.alt) ?? mapLoc(name, (n) => `${n} — ${kind}`),
          caption: loc(m.caption),
          width: positive(m.width),
          height: positive(m.height),
        },
        order: typeof m.order === 'number' ? m.order : i,
      };
    })
    .filter((x): x is { item: PortfolioMedia; order: number } => !!x)
    .sort((a, b) => a.order - b.order)
    .map((x) => x.item);
}

/** `auto` picks a layout from the imagery a project actually has. */
function resolveVariant(requested: ResolvedVariant | undefined, media: { desktop: number; mobile: number; diagrams: number; cover: boolean; video: boolean }): ResolvedVariant {
  if (requested) return requested;
  if (media.diagrams) return 'technical';
  if (media.mobile && !media.desktop) return 'mobile';
  if (media.desktop) return 'editorial';
  if (media.cover || media.video) return 'immersive';
  return 'minimal';
}

const HEX = /^#[0-9a-f]{6}$/i;

function buildProjects(raw: Project[]): PortfolioProject[] {
  const published = raw
    .filter((p) => p.published)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const used = new Set<string>();

  return published.map((p, i) => {
    const title = loc(p.title) ?? { en: 'Untitled', tr: 'Adsız' };
    const [nameEn, subEn] = splitTitle(title.en);
    const [nameTr, subTr] = splitTitle(title.tr);
    const name = { en: nameEn, tr: nameTr };
    const description = loc(p.description) ?? { en: '', tr: '' };

    let slug = baseSlug(p);
    if (used.has(slug)) slug = `${slug}-${p.id}`;
    used.add(slug);

    const media = buildMedia(p, name);
    const of = (kind: MediaKind) => media.filter((m) => m.kind === kind);
    const legacyImage = safeUrl(p.image);
    const logo =
      of('logo')[0] ??
      (legacyImage ? { id: 'legacy-image', kind: 'logo' as const, url: legacyImage, alt: name, caption: null, width: null, height: null } : null);
    const cover = of('cover')[0] ?? null;
    const desktop = of('desktop');
    const mobile = of('mobile');
    const diagrams = of('diagram');
    const video = of('video')[0] ?? null;

    const legacy = legacyPresentation(slug);
    const pres = p.presentation ?? {};
    const hasImagery = !!(cover || desktop.length || mobile.length || diagrams.length || video);
    const presentation: ResolvedPresentation = {
      variant: resolveVariant(oneOf(pres.variant, VARIANTS), {
        desktop: desktop.length,
        mobile: mobile.length,
        diagrams: diagrams.length,
        cover: !!cover,
        video: !!video,
      }),
      accent: pres.accent && HEX.test(pres.accent) ? pres.accent : null,
      backplate: oneOf(pres.backplate, BACKPLATES) ?? legacy.backplate,
      inset: typeof pres.inset === 'number' ? Math.min(0.3, Math.max(0, pres.inset)) : legacy.inset,
      field: oneOf(pres.field, FIELDS) ?? legacy.field ?? 'ink',
      art: oneOf(pres.art, ARTS) ?? legacy.art ?? 'none',
    };

    return {
      id: p.id,
      slug,
      previousSlugs: toArray(p.previousSlugs)
        .map((s) => slugify(String(s)))
        .filter((s) => s && s !== slug),
      number: i + 1,
      title,
      name,
      subtitle: subEn || subTr ? { en: subEn ?? subTr ?? '', tr: subTr ?? subEn ?? '' } : null,
      summary: mapLoc(description, firstSentence),
      description,
      categories: categoriesOf(p.category),
      stack: toArray(p.techStack).map((s) => String(s).trim()).filter(Boolean),
      image: logo?.url ?? null,
      logo,
      cover,
      desktop,
      mobile,
      diagrams,
      video,
      hasImagery,
      presentation,
      links: {
        live: safeUrl(p.liveUrl),
        demo: safeUrl(p.demoUrl),
        source: safeUrl(p.githubUrl),
      },
      extraLinks: toArray(p.links)
        .map((l) => ({ label: loc(l?.label), url: safeUrl(l?.url) }))
        .filter((l): l is { label: Loc; url: string } => !!l.label && !!l.url),
      role: loc(p.role),
      contribution: loc(p.contribution),
      period: loc(p.period),
      status: p.status?.trim() || null,
      year: p.year?.trim() || null,
      featured: p.featured === true,
      archived: p.archived === true,
      sections: toArray(p.sections)
        .map((s) => ({ heading: loc(s.heading), body: loc(s.body) }))
        .filter((s): s is { heading: Loc; body: Loc } => !!s.heading && !!s.body),
    };
  });
}

/**
 * Featured policy: projects marked `featured` in the admin, in featured order, up to the
 * configured count. Without any marked project, the first projects in archive order are used,
 * which is how the site behaved before the flag existed.
 */
export function selectFeatured(listed: PortfolioProject[], raw: Project[], count: number): PortfolioProject[] {
  const n = Number.isFinite(count) ? Math.min(FEATURED_MAX, Math.max(0, Math.round(count))) : FEATURED_DEFAULT;
  const marked = listed.filter((p) => p.featured);
  if (!marked.length) return listed.slice(0, n);
  const orderOf = new Map(raw.map((r) => [r.id, typeof r.featuredOrder === 'number' ? r.featuredOrder : Infinity]));
  return [...marked]
    .sort((a, b) => (orderOf.get(a.id) ?? Infinity) - (orderOf.get(b.id) ?? Infinity) || a.number - b.number)
    .slice(0, n);
}

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** "Mar 2026", "April 2025", "2023" → months since year 0. */
function parseMonth(text: string, endOfYear = false): number | null {
  const match = text.match(/([a-zçğıöşü]+)?\.?\s*((?:19|20)\d{2})/i);
  if (!match) return null;
  const year = Number(match[2]);
  const month = match[1] ? MONTHS.indexOf(match[1].slice(0, 3).toLowerCase()) : -1;
  return year * 12 + (month >= 0 ? month : endOfYear ? 11 : 0);
}

export function parsePeriod(period: string, now = new Date()): { start: number | null; end: number | null } {
  const [from, to] = period.split(/\s+[–—-]\s+|\s+to\s+/i);
  const start = from ? parseMonth(from) : null;
  let end: number | null = null;
  if (to && /present|now|current|günümüz|devam/i.test(to)) end = now.getFullYear() * 12 + now.getMonth();
  else if (to) end = parseMonth(to, true);
  else end = start;
  return { start, end };
}

function buildJourney(raw: TimelineEntry[]): JourneyEntry[] {
  return raw
    .filter((t) => t.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((t, i) => {
      const structured = timelinePeriod(t);
      const period = loc(structured.period) ?? { en: '', tr: '' };
      const years = period.en.match(/\b(19|20)\d{2}\b/g) ?? [];
      const ongoing = structured.ongoing;
      const parsed = parsePeriod(period.en);
      return {
        id: t.id || `journey-${i}`,
        type: t.type,
        title: loc(t.title) ?? { en: '', tr: '' },
        org: loc(t.company) ?? { en: '', tr: '' },
        period,
        description: loc(t.description) ?? { en: '', tr: '' },
        startYear: years[0] ?? null,
        endYear: ongoing ? null : (years[years.length - 1] ?? null),
        start: structured.start ?? parsed.start,
        end: ongoing ? new Date().getFullYear() * 12 + new Date().getMonth() : structured.end ?? parsed.end,
        url: safeUrl(t.url) ?? null,
        ongoing,
      };
    });
}

function buildSkills(raw: Skill[]): PortfolioSkill[] {
  return raw
    .filter((s) => s.published !== false && s.name?.trim())
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((s) => ({ name: s.name.trim(), categories: categoriesOf(s.category) }));
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const AVAILABILITY_LABELS: Record<string, Loc> = {
  available: { en: 'Open to work', tr: 'Çalışmaya açık' },
  'open-to-offers': { en: 'Open to offers', tr: 'Tekliflere açık' },
  working: { en: 'Currently working', tr: 'Şu anda çalışıyor' },
};

function buildProfile(data: SiteData | null): PortfolioProfile {
  const profile = data?.profile;
  const photo = profile?.fieldPhoto;
  const photoUrl = safeUrl(photo?.url);
  const pillars: EngineeringPillar[] = [];
  toArray(profile?.pillars).forEach((p, i) => {
    const title = loc(p.title);
    const body = loc(p.body);
    if (!title || !body) return;
    pillars.push({ id: p.id || `pillar-${i}`, title, body, tech: toArray(p.tech).map((t) => String(t).trim()).filter(Boolean) });
  });
  return {
    fullName: profile?.fullName?.trim() || OWNER.fullName,
    shortName: profile?.shortName?.trim() || OWNER.shortName,
    role: loc(profile?.role) ?? OWNER.role,
    fieldPhoto: photoUrl
      ? { url: photoUrl, alt: loc(photo?.alt) ?? FALLBACK_FIELD_PHOTO.alt, caption: loc(photo?.caption), note: loc(photo?.note) }
      : { ...FALLBACK_FIELD_PHOTO, caption: null, note: null },
    pillars: pillars.length ? pillars : null,
  };
}

export function buildPortfolio(data: SiteData | null): Portfolio {
  const rawProjects = toArray(data?.projects);
  const published = buildProjects(rawProjects);
  const projects = published.filter((p) => !p.archived).map((p, i) => ({ ...p, number: i + 1 }));
  const unlisted = published.filter((p) => p.archived);
  const featured = selectFeatured(projects, rawProjects, data?.display?.featuredCount ?? FEATURED_DEFAULT);
  const featuredIds = new Set(featured.map((p) => p.id));
  const redirects: Record<string, string> = {};
  const liveSlugs = new Set(published.map((p) => p.slug));
  for (const p of published) {
    for (const old of p.previousSlugs) if (!liveSlugs.has(old)) redirects[old] = p.slug;
  }

  const aboutEntries = toArray(data?.aboutEntries);
  const activeAbout =
    aboutEntries.find((e) => e.id === data?.activeAboutId) ?? aboutEntries[0] ?? null;
  const aboutContent = loc(activeAbout?.content);

  const cvFiles = toArray(data?.cvFiles);
  const activeCv = cvFiles.find((f) => f.id === data?.activeCvId) ?? cvFiles[0] ?? null;
  const cvUrl = safeUrl(activeCv?.dataUrl) ?? FALLBACK_CV;
  const cvName = activeCv?.name?.trim() || 'Mustafa-Tamer-Akdeniz-Resume.pdf';
  const cvVariants: Portfolio['cv']['variants'] = {};
  for (const language of ['en', 'tr'] as const) {
    const file = activeCv?.language === language ? activeCv : cvFiles.find((f) => f.language === language);
    const url = safeUrl(file?.dataUrl);
    if (file && url) cvVariants[language] = { viewUrl: url, downloadUrl: getCvDownloadHref(url, file.name), fileName: file.name };
  }

  const contactInfo = data?.contactInfo;
  const social = contactInfo?.social;

  const status = data?.availability?.status;
  const custom = loc(data?.availability?.customLabel);
  const availabilityLabel = custom ?? (status ? AVAILABILITY_LABELS[status] : undefined);

  return {
    profile: buildProfile(data),
    hero: {
      title: loc(data?.homeHero?.title),
      description: loc(data?.homeHero?.description),
      moreLabel: loc(data?.homeHero?.moreLabel),
    },
    about: {
      title: loc(activeAbout?.title),
      paragraphs: {
        en: aboutContent ? splitParagraphs(aboutContent.en) : [],
        tr: aboutContent ? splitParagraphs(aboutContent.tr) : [],
      },
      portrait: safeUrl(activeAbout?.avatar?.imageUrl) ?? null,
    },
    contact: {
      email: contactInfo?.email?.trim() || FALLBACK_CONTACT.email,
      location: loc(contactInfo?.location) ?? FALLBACK_CONTACT.location,
      social: contactInfo
        ? {
            github: safeUrl(social?.github),
            linkedin: safeUrl(social?.linkedin),
            instagram: safeUrl(social?.instagram),
            upwork: safeUrl(social?.upwork),
          }
        : FALLBACK_CONTACT.social,
    },
    availability: status && availabilityLabel ? { status, label: availabilityLabel } : null,
    cv: { viewUrl: cvUrl, downloadUrl: getCvDownloadHref(cvUrl, cvName), fileName: cvName, variants: cvVariants },
    projects,
    featured,
    archive: projects.filter((p) => !featuredIds.has(p.id)),
    unlisted,
    redirects,
    journey: buildJourney(toArray(data?.timeline)),
    skills: buildSkills(toArray(data?.skills)),
    assistant: !!data,
  };
}

export function pick(value: Loc | null | undefined, lang: Lang): string {
  if (!value) return '';
  return value[lang] || value.en;
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
