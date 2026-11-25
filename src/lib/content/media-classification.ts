import type { MediaClassification, ProjectMedia } from '@/types';

export const MEDIA_CLASSIFICATIONS = [
  'authentic-web',
  'authentic-native',
  'simulated-demo',
  'ai-concept',
  'editorial-illustration',
  'architecture-diagram',
  'logo',
  'video',
] as const;

export const CONCEPTUAL_PROVENANCE = {
  en: 'Concept art',
  tr: 'Kavramsal görsel',
} as const;

const notices = {
  'simulated-demo': { en: 'Simulated demonstration', tr: 'Simüle edilmiş gösterim' },
  'architecture-diagram': { en: 'Architecture diagram', tr: 'Mimari diyagram' },
} as const;

const BOILERPLATE_CONCEPT_RE =
  /^(?:(?:ai[- ]generated\s+)?conceptual\s+(?:art(?:work)?|illustration|drawing)|editorial\s+illustration|kavramsal\s+(?:görsel|çizim)|yapay\s+zek[aâ]\s+ile\s+üretilmiş\s+kavramsal\s+(?:görsel|çizim)|editoryal\s+illüstrasyon)(?:\s*[—–;,-]\s*(?:not\s+a\s+product\s+screenshot|ürün\s+ekran\s+görüntüsü\s+değildir))?\.?$/i;

export function isConceptualMedia(media: { classification?: MediaClassification | null } | null | undefined): boolean {
  return media?.classification === 'ai-concept' || media?.classification === 'editorial-illustration';
}

function cleanConceptText(text: string | undefined): string {
  const trimmed = text?.trim() ?? '';
  if (!trimmed || BOILERPLATE_CONCEPT_RE.test(trimmed)) return '';
  return trimmed;
}

function withPrefix(prefix: string, body: string | undefined): string {
  const trimmed = body?.trim() ?? '';
  if (!trimmed) return prefix;
  if (trimmed.toLowerCase().startsWith(prefix.toLowerCase())) return trimmed;
  return `${prefix}. ${trimmed}`;
}

export function classifiedCaption(media: ProjectMedia) {
  if (isConceptualMedia(media)) {
    const en = cleanConceptText(media.caption?.en);
    const tr = cleanConceptText(media.caption?.tr);
    if (!en && !tr) return undefined;
    return { en: en || tr, tr: tr || en };
  }
  const notice =
    media.classification && media.classification in notices
      ? notices[media.classification as keyof typeof notices]
      : null;
  if (!notice) return media.caption;
  return {
    en: withPrefix(notice.en, media.caption?.en),
    tr: withPrefix(notice.tr, media.caption?.tr || media.caption?.en),
  };
}
