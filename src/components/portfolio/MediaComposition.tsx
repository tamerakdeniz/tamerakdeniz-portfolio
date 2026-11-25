import Image from 'next/image';
import { MotionVideo } from './MotionVideo';
import type { PortfolioMedia, PortfolioProject } from '@/lib/content/portfolio';
import s from './MediaComposition.module.css';

/**
 * Real project imagery laid out by presentation variant, inside a PlateFigure frame.
 * Data-driven: any project that gets screenshots in the admin panel uses this, no new code.
 * Scroll motion reads `--local` (0–1) from the pinned work stack; elsewhere it rests at 1.
 */
export function MediaComposition({
  project,
  priority = false,
  sizes = '(min-width: 1024px) 40vw, 90vw',
}: {
  project: PortfolioProject;
  priority?: boolean;
  sizes?: string;
}) {
  const { variant } = project.presentation;
  const primary = project.desktop[0] ?? project.cover ?? project.mobile[0] ?? project.diagrams[0] ?? null;
  if (!primary && !project.video) return null;

  if (variant === 'mobile' && project.mobile.length) {
    const screens = project.mobile.slice(0, 3);
    return (
      <div className={s.mobile} data-count={screens.length}>
        {screens.map((m, i) => (
          <span key={m.id} className={s.phone} style={{ '--i': i } as React.CSSProperties}>
            <Shot media={m} sizes="(min-width: 1024px) 12vw, 30vw" priority={priority && i === 0} fit="cover" />
          </span>
        ))}
        <Label media={screens[0]} index={1} />
      </div>
    );
  }

  if (variant === 'technical' && project.diagrams.length) {
    const support = project.desktop[0] ?? project.mobile[0] ?? null;
    return (
      <div className={s.technical}>
        <span className={s.diagram}>
          <Shot media={project.diagrams[0]} sizes={sizes} priority={priority} fit="contain" />
        </span>
        {support && (
          <span className={s.inset}>
            <Shot media={support} sizes="(min-width: 1024px) 14vw, 36vw" fit="cover" />
          </span>
        )}
        <span className={s.cross} aria-hidden="true" />
        <Label media={project.diagrams[0]} index={1} />
      </div>
    );
  }

  if (variant === 'immersive' || (!project.desktop.length && !project.mobile.length)) {
    const still = project.cover ?? project.desktop[0] ?? primary;
    return (
      <div className={s.immersive}>
        {project.video ? (
          <MotionVideo className={s.video} src={project.video.url} poster={still?.url} label={project.video.alt.en} />
        ) : (
          still && <Shot media={still} sizes={sizes} priority={priority} fit="cover" />
        )}
        <span className={s.vignette} aria-hidden="true" />
        {still && <Label media={still} index={1} />}
      </div>
    );
  }

  const main = project.desktop[0] ?? primary!;
  const second = project.desktop[1] ?? project.mobile[0] ?? null;
  return (
    <div className={s.editorial} data-second={second ? (second.kind === 'mobile' ? 'mobile' : 'desktop') : undefined}>
      <span className={s.main}>
        <Shot media={main} sizes={sizes} priority={priority} fit="cover" />
      </span>
      {second && (
        <span className={s.second}>
          <Shot media={second} sizes="(min-width: 1024px) 14vw, 36vw" fit="cover" />
        </span>
      )}
      <Label media={main} index={1} />
    </div>
  );
}

function Shot({
  media,
  sizes,
  priority = false,
  fit,
}: {
  media: PortfolioMedia;
  sizes: string;
  priority?: boolean;
  fit: 'cover' | 'contain';
}) {
  return (
    <Image
      src={media.url}
      alt={media.alt.en}
      fill
      sizes={sizes}
      priority={priority}
      className={s.img}
      data-fit={fit}
    />
  );
}

const KIND: Record<PortfolioMedia['kind'], string> = {
  cover: 'Cover',
  logo: 'Mark',
  desktop: 'Desktop',
  mobile: 'Mobile',
  diagram: 'Diagram',
  video: 'Motion',
};

function Label({ media, index }: { media: PortfolioMedia; index: number }) {
  return (
    <span className={`${s.label} meta tabular`} aria-hidden="true">
      Fig. {String(index).padStart(2, '0')} · {KIND[media.kind]}
    </span>
  );
}
