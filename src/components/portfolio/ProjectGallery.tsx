import Image from 'next/image';
import { CONCEPTUAL_PROVENANCE, isConceptualMedia } from '@/lib/content/media-classification';
import type { PortfolioMedia } from '@/lib/content/portfolio';
import { T } from './T';
import s from './ProjectGallery.module.css';

/** Every screenshot and diagram of a project, at its own proportions, with its caption. */
export function ProjectGallery({ media }: { media: PortfolioMedia[] }) {
  if (!media.length) return null;
  return (
    <ul className={s.gallery}>
      {media.map((m) => {
        const ratio = m.width && m.height ? `${m.width} / ${m.height}` : m.kind === 'mobile' ? '9 / 19' : '16 / 10';
        const caption = m.caption ?? (isConceptualMedia(m) ? CONCEPTUAL_PROVENANCE : null);
        return (
          <li key={m.id} className={s.item} data-kind={m.kind}>
            <figure className={s.figure}>
              <span className={s.frame} style={{ aspectRatio: ratio }}>
                <Image
                  src={m.url}
                  alt={m.alt.en}
                  fill
                  sizes={m.kind === 'mobile' ? '(min-width: 1024px) 20vw, 45vw' : '(min-width: 1024px) 60vw, 92vw'}
                  className={s.img}
                />
              </span>
              {caption && (
                <figcaption className={`${s.caption} meta-plain`}>
                  <T v={caption} />
                </figcaption>
              )}
            </figure>
          </li>
        );
      })}
    </ul>
  );
}
