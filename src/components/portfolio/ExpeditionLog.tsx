import { COPY, JOURNEY_TYPES } from '@/lib/content/copy';
import type { Loc, Portfolio } from '@/lib/content/portfolio';
import { ChapterMark } from './ChapterMark';
import { DiveComputer, type LogItem } from './DiveComputer';
import { T } from './T';
import s from './ExpeditionLog.module.css';

const SPLIT_AT = 240;

/** Splits long text after the first sentence that crosses SPLIT_AT characters. */
function splitText(text: string): [string, string] {
  if (text.length <= SPLIT_AT + 80) return [text, ''];
  const re = /[.!?](\s|$)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (match.index >= SPLIT_AT) return [text.slice(0, match.index + 1), text.slice(match.index + 1).trim()];
  }
  return [text, ''];
}

function Description({ value }: { value: Loc }) {
  const render = (text: string) => {
    const [head, rest] = splitText(text);
    return (
      <>
        <p>{head}</p>
        {rest && (
          <details className={s.more}>
            <summary className="meta">
              <T v={COPY.journey.more} />
            </summary>
            <p>{rest}</p>
          </details>
        )}
      </>
    );
  };
  if (value.en === value.tr) return <div className={s.desc}>{render(value.en)}</div>;
  return (
    <div className={s.desc}>
      <div data-l="en">{render(value.en)}</div>
      <div data-l="tr" lang="tr">
        {render(value.tr)}
      </div>
    </div>
  );
}

/** 05 Journey: a dive log. Newest first; scrolling deeper goes further back in time. */
export function ExpeditionLog({ portfolio, standalone = false }: { portfolio: Portfolio; standalone?: boolean }) {
  const { journey, cv, contact } = portfolio;
  if (journey.length === 0) return null;

  const items: LogItem[] = journey.map((j) => ({
    id: j.id,
    type: j.type,
    title: j.title,
    org: j.org,
    period: j.period,
    start: j.start,
    end: j.end,
    ongoing: j.ongoing,
  }));

  return (
    <section id="journey" className={`chapter surface-dark ${s.journey}`} aria-labelledby="journey-title">
      <div className="wrap">
        <div className={s.head}>
          {!standalone && <ChapterMark id="journey" />}
          <h2 id="journey-title" className={s.title}>
            <T v={COPY.journey.titleA} />{' '}
            <span className="serif">
              <T v={COPY.journey.titleSerif} />
            </span>
          </h2>
          <p className={`${s.intro} muted`}>
            <T v={COPY.journey.intro} />
          </p>
        </div>

        <div className={s.layout}>
          <div className={s.side}>
            <DiveComputer items={items} />
          </div>

          <ol className={s.log}>
            {journey.map((entry, i) => (
              <li key={entry.id} className={s.entry} data-log-entry={entry.id}>
                <p className={`${s.meta} meta tabular`}>
                  <span className={s.no}>{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <T v={entry.period} />
                  </span>
                  <span className={s.type} data-type={entry.type}>
                    <T v={JOURNEY_TYPES[entry.type] ?? { en: entry.type, tr: entry.type }} />
                  </span>
                </p>
                <h3 className={s.entryTitle}>
                  <T v={entry.title} />
                </h3>
                <p className={s.org}>
                  <T v={entry.org} />
                </p>
                <Description value={entry.description} />
              </li>
            ))}
          </ol>
        </div>

        <div className={s.foot}>
          <a className="btn btn-primary" href={cv.downloadUrl} download={cv.fileName}>
            <T v={COPY.journey.downloadCv} />
            <span className="arrow" aria-hidden="true">
              ↓
            </span>
          </a>
          {contact.social.linkedin && (
            <a className="tlink hit" href={contact.social.linkedin} target="_blank" rel="noopener">
              <T v={COPY.journey.linkedin} />
              <span className="arrow arrow-ne" aria-hidden="true">
                {' '}
                ↗
              </span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
