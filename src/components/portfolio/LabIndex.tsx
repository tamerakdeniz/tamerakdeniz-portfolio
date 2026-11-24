import Link from 'next/link';
import { COPY } from '@/lib/content/copy';
import type { Portfolio, PortfolioProject } from '@/lib/content/portfolio';
import { ChapterLabel } from './ChapterLabel';
import { ContourBand } from './ContourField';
import { KindText, StackText } from './ProjectBits';
import { LabAssistant } from './LabAssistant';
import { T } from './T';
import s from './LabIndex.module.css';

export function AccessText({ project }: { project: PortfolioProject }) {
  const live = !!(project.links.live || project.links.demo);
  const source = !!project.links.source;
  if (!live && !source) return <>—</>;
  return (
    <>
      {live && <T v={COPY.lab.accessLive} />}
      {live && source && ' + '}
      {source && <T v={COPY.lab.accessSource} />}
    </>
  );
}

export function IndexRows({ projects, headingLevel = 3 }: { projects: PortfolioProject[]; headingLevel?: 3 | 2 }) {
  const Heading = `h${headingLevel}` as 'h3' | 'h2';
  return (
    <div className={s.table}>
      <div className={`${s.row} ${s.headRow} meta`} aria-hidden="true">
        <span>
          <T v={COPY.lab.colNo} />
        </span>
        <span>
          <T v={COPY.lab.colProject} />
        </span>
        <span className={s.cKind}>
          <T v={COPY.lab.colKind} />
        </span>
        <span className={s.cStack}>
          <T v={COPY.lab.colStack} />
        </span>
        <span className={s.cAccess}>
          <T v={COPY.lab.colAccess} />
        </span>
        <span />
      </div>
      <ol className={s.rows}>
        {projects.map((p) => (
          <li key={p.id} className={s.row}>
            <span className={`${s.no} meta tabular`}>{String(p.number).padStart(2, '0')}</span>
            <Heading className={s.title}>
              <Link href={`/projects/${p.slug}`} className={s.rowLink}>
                <T v={p.name} />
              </Link>
              {p.subtitle && (
                <span className={s.sub}>
                  <T v={p.subtitle} />
                </span>
              )}
            </Heading>
            <span className={`${s.cKind} ${s.cell}`}>
              <span className="sr-only">
                <T v={COPY.lab.colKind} />:{' '}
              </span>
              <KindText project={p} limit={2} />
            </span>
            <span className={`${s.cStack} ${s.cell} meta-plain`}>
              <span className="sr-only">
                <T v={COPY.lab.colStack} />:{' '}
              </span>
              <StackText project={p} limit={3} />
            </span>
            <span className={`${s.cAccess} ${s.cell} meta`}>
              <span className="sr-only">
                <T v={COPY.lab.colAccess} />:{' '}
              </span>
              <AccessText project={p} />
            </span>
            <span className={s.go} aria-hidden="true">
              →
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function LabIndex({ portfolio }: { portfolio: Portfolio }) {
  return (
    <section id="lab" className={`chapter surface-dark ${s.lab}`} aria-labelledby="lab-title">
      <ContourBand seed={303} count={22} height={220} amplitude={14} compress={1.06} tone="tidal" opacity={0.32} className={s.field} />
      <div className="wrap">
        <ChapterLabel id="lab" />
        <div className={`grid ${s.head}`}>
          <h2 id="lab-title" className={`h2 ${s.h}`} data-reveal>
            <T v={COPY.lab.titleA} /> <span className="serif">
              <T v={COPY.lab.titleSerif} />
            </span>
          </h2>
          <p className={`${s.intro} muted`} data-reveal>
            <T v={COPY.lab.intro} />
          </p>
        </div>

        {portfolio.archive.length > 0 && <IndexRows projects={portfolio.archive} />}

        <p className={s.archive}>
          <Link className="tlink hit" href="/projects">
            <T v={COPY.lab.archive} />
            <span className="arrow" aria-hidden="true">
              {' '}
              →
            </span>
          </Link>
        </p>

        {portfolio.chatContext && (
          <div className={`grid ${s.instrument}`}>
            <div className={s.instrumentText}>
              <p className="meta muted">03.2</p>
              <h3 className="h3">
                <T v={COPY.lab.assistantTitle} />
              </h3>
              <p className="muted">
                <T v={COPY.lab.assistantBody} />
              </p>
            </div>
            <div className={s.instrumentPanel}>
              <LabAssistant context={portfolio.chatContext} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
