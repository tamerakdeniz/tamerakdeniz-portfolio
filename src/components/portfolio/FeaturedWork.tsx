import Link from 'next/link';
import { COPY } from '@/lib/content/copy';
import type { Portfolio, PortfolioProject } from '@/lib/content/portfolio';
import { ChapterLabel } from './ChapterLabel';
import { ProjectPlate } from './ProjectPlate';
import { ExternalLinks, KindText, StackText } from './ProjectBits';
import { T } from './T';
import s from './FeaturedWork.module.css';

const LAYOUTS = ['wide', 'split', 'offset'] as const;

function Caption({ project, total, layout }: { project: PortfolioProject; total: number; layout: string }) {
  const headingId = `work-${project.slug}`;
  return (
    <div className={s.caption}>
      <p className={`${s.count} meta tabular`}>
        <span>{String(project.number).padStart(2, '0')}</span>
        <span className={s.of}>/ {String(total).padStart(2, '0')}</span>
      </p>
      <h3 id={headingId} className={`h3 ${s.name} ${layout === 'split' ? s.nameXL : ''}`}>
        <Link href={`/projects/${project.slug}`} className={s.nameLink}>
          <T v={project.name} />
        </Link>
      </h3>
      {project.subtitle && (
        <p className={`serif ${s.subtitle}`}>
          <T v={project.subtitle} />
        </p>
      )}

      <dl className={s.facts}>
        <div>
          <dt className="meta">
            <T v={COPY.work.oneLine} />
          </dt>
          <dd className={s.summary}>
            <T v={project.summary} />
          </dd>
        </div>
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
              <StackText project={project} />
            </dd>
          </div>
        )}
      </dl>

      <div className={s.actions}>
        <Link className={`btn btn-primary ${s.cta}`} href={`/projects/${project.slug}`} aria-describedby={headingId}>
          <T v={COPY.work.caseStudy} />
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </Link>
        <ExternalLinks project={project} className={s.ext} />
      </div>
    </div>
  );
}

export function FeaturedWork({ portfolio }: { portfolio: Portfolio }) {
  const { featured, projects } = portfolio;
  if (featured.length === 0) return null;

  return (
    <section id="work" className={`chapter surface-dark ${s.work}`} aria-labelledby="work-title">
      <div className="wrap">
        <ChapterLabel id="work" />
        <div className={`grid ${s.head}`}>
          <h2 id="work-title" className={`h2 ${s.title}`} data-reveal>
            <T v={COPY.work.titleA} /> <span className="serif">
              <T v={COPY.work.titleSerif} />
            </span>
          </h2>
          <div className={s.intro} data-reveal>
            <p className="muted">
              <T v={COPY.work.intro} />
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
      </div>

      <ol className={s.list}>
        {featured.map((project, i) => {
          const layout = LAYOUTS[i % LAYOUTS.length];
          return (
            <li
              key={project.id}
              className={`${s.item} ${s[layout]} ${layout === 'offset' ? 'surface-paper' : 'surface-dark'}`}
              aria-labelledby={`work-${project.slug}`}
            >
              <div className="wrap">
                <div className={`grid ${s.spread}`}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className={`${s.plateLink} plate-hover`}
                    tabIndex={-1}
                    aria-hidden="true"
                    data-reveal
                  >
                    <ProjectPlate
                      project={project}
                      shape={layout === 'wide' ? 'wide' : layout === 'split' ? 'square' : 'tall'}
                      tone={layout === 'offset' ? 'deep' : 'paper'}
                    />
                  </Link>
                  <Caption project={project} total={featured.length} layout={layout} />
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
