import Link from 'next/link';
import { CHAPTERS, COPY } from '@/lib/content/copy';
import { buildPillars } from '@/lib/content/pillars';
import type { Portfolio } from '@/lib/content/portfolio';
import { ArchitectureMap } from './ArchitectureMap';
import { ChapterMark } from './ChapterMark';
import { T } from './T';
import s from './EngineeringChapter.module.css';

/** 04 Engineering: the drafting table — this site's own architecture, then the three areas. */
export function EngineeringChapter({ portfolio }: { portfolio: Portfolio }) {
  const pillars = buildPillars(portfolio);
  const journey = CHAPTERS.find((c) => c.id === 'journey')!;

  return (
    <section id="engineering" className={`chapter surface-paper ${s.eng}`} aria-labelledby="engineering-title">
      <div className="wrap">
        <div className={s.head}>
          <ChapterMark id="engineering" />
          <h2 id="engineering-title" className={s.title}>
            <T v={COPY.engineering.titleA} />{' '}
            <span className="serif">
              <T v={COPY.engineering.titleSerif} />
            </span>
          </h2>
          <p className={`${s.intro} muted`}>
            <T v={COPY.engineering.mapIntro} />
          </p>
        </div>

        <ArchitectureMap />

        <div className={s.pillarsHead}>
          <h3 className={s.pillarsTitle}>
            <T v={COPY.engineering.pillarsTitle} />
          </h3>
          <p className="muted">
            <T v={COPY.engineering.intro} />
          </p>
        </div>

        <ol className={s.pillars}>
          {pillars.map((pillar, i) => (
            <li key={pillar.id} className={s.pillar}>
              <span className={`${s.num} meta tabular`} aria-hidden="true">
                4.{i + 2}
              </span>
              <h4 className={s.ptitle}>
                <T v={pillar.title} />
              </h4>
              <p className={s.pbody}>
                <T v={pillar.body} />
              </p>
              {pillar.tech.length > 0 && <p className={`${s.tech} meta-plain`}>{pillar.tech.join(' / ')}</p>}
              {(pillar.related.length > 0 || pillar.journeyLink) && (
                <div className={s.related}>
                  <p className="meta muted">
                    <T v={COPY.engineering.related} />
                  </p>
                  <ul>
                    {pillar.related.map((p) => (
                      <li key={p.id}>
                        <Link className="tlink hit" href={`/projects/${p.slug}`}>
                          <T v={p.name} />
                        </Link>
                      </li>
                    ))}
                    {pillar.journeyLink && (
                      <li>
                        <a className="tlink hit" href="#journey">
                          Telco CRM <span className="muted">(<T v={journey.name} />)</span>
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
