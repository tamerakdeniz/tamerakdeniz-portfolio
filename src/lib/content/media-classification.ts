import type { ProjectMedia } from '@/types';
export const MEDIA_CLASSIFICATIONS = ['authentic-web','authentic-native','simulated-demo','ai-concept','editorial-illustration','architecture-diagram','logo','video'] as const;
const notices = {
  'simulated-demo': { en: 'Simulated demonstration', tr: 'Simüle edilmiş gösterim' },
  'ai-concept': { en: 'AI-generated conceptual artwork — not a product screenshot', tr: 'Yapay zekâ ile üretilmiş kavramsal çizim — ürün ekran görüntüsü değildir' },
  'editorial-illustration': { en: 'Editorial illustration — not a product screenshot', tr: 'Editoryal illüstrasyon — ürün ekran görüntüsü değildir' },
  'architecture-diagram': { en: 'Architecture diagram', tr: 'Mimari diyagram' },
};
export function classifiedCaption(media: ProjectMedia) {
  const notice = media.classification && media.classification in notices ? notices[media.classification as keyof typeof notices] : null;
  if (!notice) return media.caption;
  return { en: [notice.en, media.caption?.en].filter(Boolean).join('. '), tr: [notice.tr, media.caption?.tr || media.caption?.en].filter(Boolean).join('. ') };
}
