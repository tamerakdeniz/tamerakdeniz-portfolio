import { COPY } from '@/lib/content/copy';
import type { PortfolioProject } from '@/lib/content/portfolio';
import { compositionLead } from '@/lib/content/composition';
import { CONCEPTUAL_PROVENANCE, isConceptualMedia } from '@/lib/content/media-classification';
import { AssetPlate } from './AssetPlate';
import { MediaComposition } from './MediaComposition';
import { PLATE_ART } from './PlateArt';
import { T } from './T';
import s from './PlateFigure.module.css';

/**
 * A project's figure, chosen from its data:
 * 1. real imagery (screenshots, diagram, cover, video) → MediaComposition in the chosen variant;
 * 2. conceptual art selected in the admin (legacy defaults for three projects) with the mark;
 * 3. the mark alone on its backplate, or the project's initial.
 */
export function PlateFigure({
  project,
  priority = false,
  showProvenance = false,
  sizes = '(min-width: 1024px) 14vw, 30vw',
  className,
}: {
  project: PortfolioProject;
  priority?: boolean;
  showProvenance?: boolean;
  sizes?: string;
  className?: string;
}) {
  const pres = project.presentation;
  const imagery = project.hasImagery && pres.variant !== 'minimal';
  const art = !imagery && pres.art !== 'none' ? PLATE_ART[pres.art] : null;
  const field = imagery && pres.field === 'paper' ? 'ink' : pres.field;
  const surface = field === 'paper' ? 'surface-paper' : 'surface-dark';
  const lead = imagery ? compositionLead(project) : null;
  const conceptualLead = isConceptualMedia(lead);
  const firstCaption = lead?.caption ?? null;
  const caption = imagery
    ? conceptualLead
      ? firstCaption ?? (showProvenance ? CONCEPTUAL_PROVENANCE : null)
      : firstCaption ?? COPY.work.imagery
    : art
      ? COPY.work.conceptual
      : COPY.work.markOnly;
  const style = pres.accent ? ({ '--plate-accent': pres.accent } as React.CSSProperties) : undefined;

  return (
    <figure className={`${s.figure} ${className ?? ''}`} style={style}>
      <div
        className={`${s.art} ${surface}`}
        data-field={field}
        data-print={imagery ? 'media' : art ? art.print : 'solo'}
        data-variant={imagery ? pres.variant : undefined}
      >
        {imagery ? (
          <MediaComposition project={project} priority={priority} />
        ) : (
          <>
            {art ? <art.Art /> : null}
            {project.image ? (
              <span className={s.print}>
                <AssetPlate
                  kind="logo"
                  src={project.image}
                  alt={`${project.name.en} — ${COPY.work.markCaption.en}`}
                  plate={pres.backplate}
                  inset={art?.print === 'round' ? Math.max(pres.inset, 0.18) : pres.inset}
                  aspect="1 / 1"
                  sizes={sizes}
                  priority={priority}
                />
              </span>
            ) : (
              !art && (
                <span className={s.initial} aria-hidden="true">
                  {project.name.en.slice(0, 1)}
                </span>
              )
            )}
          </>
        )}
        {imagery && project.logo && (
          <span className={s.chip}>
            <AssetPlate
              kind="logo"
              src={project.logo.url}
              alt=""
              plate={pres.backplate}
              inset={pres.inset}
              aspect="1 / 1"
              sizes="48px"
            />
          </span>
        )}
        <span className={s.reg} aria-hidden="true" />
      </div>
      {art && art.legend.length > 0 && (
        <ul className={`${s.legend} meta`} aria-hidden="true">
          {art.legend.map((item) => (
            <li key={item.v.en} style={item.color ? ({ '--c': item.color } as React.CSSProperties) : undefined}>
              <T v={item.v} />
            </li>
          ))}
        </ul>
      )}
      {caption && (
        <figcaption className={`${s.caption} meta-plain`}>
          <T v={caption} />
        </figcaption>
      )}
    </figure>
  );
}

export function plateField(project: PortfolioProject) {
  const { field, variant } = project.presentation;
  return project.hasImagery && variant !== 'minimal' && field === 'paper' ? 'ink' : field;
}
