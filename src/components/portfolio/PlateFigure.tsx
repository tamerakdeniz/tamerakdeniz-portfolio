import { assetSpecFor } from '@/lib/content/assets';
import { COPY } from '@/lib/content/copy';
import type { PortfolioProject } from '@/lib/content/portfolio';
import { AssetPlate } from './AssetPlate';
import { plateArtFor } from './PlateArt';
import { T } from './T';
import s from './PlateFigure.module.css';

/**
 * A project's figure: bespoke conceptual art with its mark for the projects that have it,
 * otherwise the mark alone on a matched backplate inside the same frame.
 */
export function PlateFigure({
  project,
  priority = false,
  sizes = '(min-width: 1024px) 14vw, 30vw',
  className,
}: {
  project: PortfolioProject;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const { Art, field, print, legend, bespoke } = plateArtFor(project.slug);
  const spec = assetSpecFor(project.slug);
  const surface = field === 'paper' ? 'surface-paper' : 'surface-dark';

  return (
    <figure className={`${s.figure} ${className ?? ''}`}>
      <div className={`${s.art} ${surface}`} data-field={field} data-print={bespoke ? print : 'solo'}>
        {bespoke && <Art />}
        {project.image ? (
          <span className={s.print}>
            <AssetPlate
              kind={spec.kind}
              src={project.image}
              alt={`${project.name.en} — ${COPY.work.markCaption.en}`}
              plate={spec.plate}
              inset={print === 'round' && bespoke ? Math.max(spec.inset ?? 0.12, 0.18) : spec.inset}
              aspect="1 / 1"
              sizes={sizes}
              priority={priority}
            />
          </span>
        ) : (
          !bespoke && (
            <span className={s.initial} aria-hidden="true">
              {project.name.en.slice(0, 1)}
            </span>
          )
        )}
        <span className={s.reg} aria-hidden="true" />
      </div>
      {legend.length > 0 && (
        <ul className={`${s.legend} meta`} aria-hidden="true">
          {legend.map((item) => (
            <li key={item.v.en} style={item.color ? ({ '--c': item.color } as React.CSSProperties) : undefined}>
              <T v={item.v} />
            </li>
          ))}
        </ul>
      )}
      <figcaption className={`${s.caption} meta-plain`}>
        <T v={bespoke ? COPY.work.conceptual : COPY.work.markOnly} />
      </figcaption>
    </figure>
  );
}
