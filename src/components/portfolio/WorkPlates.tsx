import Link from 'next/link';
import { COPY } from '@/lib/content/copy';
import type { Portfolio, PortfolioProject } from '@/lib/content/portfolio';
import { ChapterMark } from './ChapterMark';
import { PlateFigure, plateField } from './PlateFigure';
import { ExternalLinks, KindText, StackText } from './ProjectBits';
import { T } from './T';
import { WorkStack } from './WorkStack';
import s from './WorkPlates.module.css';

function longest(project: PortfolioProject) {
  return Math.max(project.name.en.length, (project.name.tr ?? '').length);
}

function Plate({ project, i, total }: { project: PortfolioProject; i: number; total: number }) {
  const field = plateField(project);
  const accent = project.presentation.accent;
  const headingId = `work-${project.slug}`;
  const surface = field === 'paper' ? 'surface-paper' : 'surface-dark';
  const side = i % 2 === 1 ? s.artLeft : s.artRight;

  return (
    <li
      className={`${s.plate} ${surface} ${side}`}
      data-field={field}
      data-plate-i={i}
      style={{ '--i': i, ...(accent ? { '--plate-accent': accent } : {}) } as React.CSSProperties}
      aria-labelledby={headingId}
    >
      <div className={s.inner}>
        <p className={`${s.strip} meta tabular`} aria-hidden="true">
          <span>
            <T v={COPY.work.plate} /> 2.{i + 1}
          </span>
          <span className={s.stripRule} />
          <span>
            {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
        </p>

        <div className={s.text}>
          <p className={`${s.count} meta tabular`}>
            <span className="sr-only">
              <T v={COPY.work.plate} />{' '}
            </span>
            {String(i + 1).padStart(2, '0')}
            <span className={s.of}> / {String(total).padStart(2, '0')}</span>
          </p>
          <h3 id={headingId} className={s.name} data-long={longest(project) > 14 ? '' : undefined}>
            <Link href={`/projects/${project.slug}`} className={s.nameLink}>
              <T v={project.name} />
            </Link>
          </h3>
          {project.subtitle && (
            <p className={`serif ${s.subtitle}`}>
              <T v={project.subtitle} />
            </p>
          )}
          <p className={s.summary}>
            <T v={project.summary} />
          </p>
          <dl className={s.facts}>
            {project.categories.length > 0 && (
              <div>
                <dt className="meta">
                  <T v={COPY.work.kind} />
                </dt>
                <dd>
                  <KindText project={project} />
                </dd>
              </div>
            )}
            {project.stack.length > 0 && (
              <div>
                <dt className="meta">
                  <T v={COPY.work.builtWith} />
                </dt>
                <dd className="meta-plain">
                  <StackText project={project} limit={6} />
                </dd>
              </div>
            )}
          </dl>
          <div className={s.actions}>
            <Link className="btn btn-primary" href={`/projects/${project.slug}`} aria-describedby={headingId}>
              <T v={COPY.work.caseStudy} />
              <span className="arrow" aria-hidden="true">
                →
              </span>
            </Link>
            <ExternalLinks project={project} className={s.ext} />
          </div>
        </div>

        <div className={s.figureSlot}>
          <PlateFigure project={project} />
        </div>
      </div>
    </li>
  );
}

/** 02 Selected Work: a pinned stack of plates, each revealed by a rising mask. */
export function WorkPlates({ portfolio }: { portfolio: Portfolio }) {
  const { featured, projects } = portfolio;

  return (
    <section id="work" className={`chapter surface-dark ${s.work}`} aria-labelledby="work-title">
      <div className={`wrap ${s.head}`}>
        <ChapterMark id="work" />
        <h2 id="work-title" className={s.title}>
          <T v={COPY.work.titleA} />{' '}
          <span className="serif">
            <T v={COPY.work.titleSerif} />
          </span>
        </h2>
        <div className={s.intro}>
          <p className="muted">
            <T v={featured.length ? COPY.work.intro : COPY.work.noFeatured} />
          </p>
          <Link className="tlink hit" href="/projects">
            <T v={COPY.work.archive} /> ({projects.length})
            <span className="arrow" aria-hidden="true">
              {' '}
              →
            </span>
          </Link>
        </div>
      </div>

      {featured.length > 0 && (
        <WorkStack count={featured.length} className={s.stack}>
          <ol className={s.viewport}>
            {featured.map((project, i) => (
              <Plate key={project.id} project={project} i={i} total={featured.length} />
            ))}
          </ol>
        </WorkStack>
      )}
    </section>
  );
}
