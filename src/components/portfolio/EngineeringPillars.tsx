import Link from 'next/link';
import { COPY, CHAPTERS } from '@/lib/content/copy';
import { buildPillars } from '@/lib/content/pillars';
import type { Portfolio } from '@/lib/content/portfolio';
import { ChapterLabel } from './ChapterLabel';
import { T } from './T';
import s from './EngineeringPillars.module.css';

function Loop() {
  const steps = COPY.engineering.loop;
  return (
    <figure className={s.loop} data-reveal>
      <div className={s.loopTrack}>
        <svg className={`contour ${s.loopArt}`} viewBox="0 0 1000 184" preserveAspectRatio="none" aria-hidden="true">
          <path d="M100 52 L900 52" stroke="var(--ink)" strokeOpacity={0.5} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <path
            d="M907 52 C 995 52, 995 176, 900 176 L 100 176 C 5 176, 5 52, 93 52"
            stroke="var(--focus-light)"
            strokeWidth={1}
            strokeDasharray="4 6"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <ol className={s.steps}>
          {steps.map((step, i) => (
            <li key={step.en} className={s.step}>
              <span className={`${s.node} ${i === 0 ? s.nodeStart : ''}`} aria-hidden="true" />
              <span className="meta tabular">{String(i + 1).padStart(2, '0')}</span>
              <span className={s.stepName}>
                <T v={step} />
              </span>
            </li>
          ))}
        </ol>
      </div>
      <figcaption className={`${s.loopCaption} meta-plain`}>
        <T v={COPY.engineering.loopCaption} />
      </figcaption>
    </figure>
  );
}

export function EngineeringPillars({ portfolio }: { portfolio: Portfolio }) {
  const pillars = buildPillars(portfolio);
  const journey = CHAPTERS.find((c) => c.id === 'journey')!;

  return (
    <section id="engineering" className={`chapter surface-paper ${s.eng}`} aria-labelledby="engineering-title">
      <div className="wrap">
        <ChapterLabel id="engineering" />
        <div className={`grid ${s.head}`}>
          <h2 id="engineering-title" className={`h2 ${s.h}`} data-reveal>
            <T v={COPY.engineering.titleA} /> <span className="serif">
              <T v={COPY.engineering.titleSerif} />
            </span>
          </h2>
          <p className={`${s.intro} muted`} data-reveal>
            <T v={COPY.engineering.intro} />
          </p>
        </div>

        <ol className={s.pillars}>
          {pillars.map((pillar, i) => (
            <li key={pillar.id} className={s.pillar} data-reveal>
              <span className={`${s.num} tabular`} aria-hidden="true">
                4.{i + 1}
              </span>
              <h3 className={s.ptitle}>
                <T v={pillar.title} />
              </h3>
              <p className={s.pbody}>
                <T v={pillar.body} />
              </p>
              {pillar.tech.length > 0 && (
                <p className={`${s.tech} meta`}>{pillar.tech.join('  /  ')}</p>
              )}
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

        <Loop />
      </div>
    </section>
  );
}
