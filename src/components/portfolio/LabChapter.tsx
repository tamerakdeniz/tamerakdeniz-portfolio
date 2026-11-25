import Link from 'next/link';
import { COPY } from '@/lib/content/copy';
import type { Portfolio } from '@/lib/content/portfolio';
import { ChapterMark } from './ChapterMark';
import { LabAssistant } from './LabAssistant';
import { LabExplorer } from './LabExplorer';
import { T } from './T';
import s from './LabChapter.module.css';

/** 03 Lab: every other experiment in one console, with the assistant as its first row. */
export function LabChapter({ portfolio }: { portfolio: Portfolio }) {
  return (
    <section id="lab" className={`chapter surface-dark ${s.lab}`} aria-labelledby="lab-title">
      <div className="wrap">
        <div className={s.head}>
          <ChapterMark id="lab" />
          <h2 id="lab-title" className={s.title}>
            <T v={COPY.lab.titleA} />{' '}
            <span className="serif">
              <T v={COPY.lab.titleSerif} />
            </span>
          </h2>
          <div className={s.intro}>
            <p className="muted">
              <T v={COPY.lab.intro} />
            </p>
            <Link className="tlink hit" href="/projects">
              <T v={COPY.lab.archive} />
              <span className="arrow" aria-hidden="true">
                {' '}
                →
              </span>
            </Link>
          </div>
        </div>

        <LabExplorer
          projects={portfolio.archive}
          listLabel={portfolio.assistant ? COPY.lab.rowsLabel : COPY.lab.projectsLabel}
          assistant={portfolio.assistant ? <LabAssistant key="assistant" /> : undefined}
        />
      </div>
    </section>
  );
}
