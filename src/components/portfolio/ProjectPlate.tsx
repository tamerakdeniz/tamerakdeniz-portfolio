import Image from 'next/image';
import { seedFrom } from '@/lib/contours';
import { COPY } from '@/lib/content/copy';
import type { PortfolioProject } from '@/lib/content/portfolio';
import { T } from './T';
import s from './ProjectPlate.module.css';

/**
 * The project's real mark on a paper mat, ringed by contours seeded from its slug.
 * No invented UI: when a project has no image, the plate is purely typographic.
 */
export function ProjectPlate({
  project,
  shape = 'wide',
  tone = 'paper',
  priority = false,
  figure = '2',
}: {
  project: PortfolioProject;
  shape?: 'wide' | 'square' | 'tall';
  tone?: 'paper' | 'deep';
  priority?: boolean;
  figure?: string;
}) {
  const seed = seedFrom(project.slug);
  const initials = project.name.en
    .split(/[\s-]+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <div className={`${s.plate} ${s[shape]} ${tone === 'deep' ? s.deep : ''}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static, cacheable SVG; next/image adds nothing here */}
      <img className={s.rings} src={`/contours/specimen/${seed}`} alt="" loading="lazy" decoding="async" />
      <div className={s.mark}>
        {project.image ? (
          <Image
            src={project.image}
            alt={`${project.name.en} project mark`}
            fill
            sizes="(min-width: 1024px) 300px, 45vw"
            className={s.img}
            priority={priority}
          />
        ) : (
          <span className={s.initials} aria-hidden="true">
            {initials}
          </span>
        )}
      </div>
      <span className={`${s.corner} ${s.tl} meta`} aria-hidden="true">
        Fig. {figure}.{project.number}
      </span>
      <span className={`${s.corner} ${s.br} meta`} aria-hidden="true">
        <T v={COPY.work.markCaption} />
      </span>
    </div>
  );
}
