import { COPY, JOURNEY_TYPES } from '@/lib/content/copy';
import type { JourneyEntry, Loc, Portfolio } from '@/lib/content/portfolio';
import { ChapterLabel } from './ChapterLabel';
import { T } from './T';
import s from './JourneyLog.module.css';

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

function Years({ entry }: { entry: JourneyEntry }) {
  if (!entry.startYear) return null;
  const end = entry.ongoing ? null : entry.endYear;
  return (
    <span className={`${s.years} tabular`} aria-hidden="true">
      <span>{entry.startYear}</span>
      {entry.ongoing ? (
        <span className={s.yearEnd}>
          — <T v={COPY.journey.now} />
        </span>
      ) : (
        end && end !== entry.startYear && <span className={s.yearEnd}>— {end}</span>
      )}
    </span>
  );
}

export function JourneyLog({ portfolio }: { portfolio: Portfolio }) {
  const { journey, cv, contact } = portfolio;
  if (journey.length === 0) return null;

  return (
    <section id="journey" className={`chapter surface-dark ${s.journey}`} aria-labelledby="journey-title">
      <div className="wrap">
        <ChapterLabel id="journey" />
        <div className={`grid ${s.head}`}>
          <h2 id="journey-title" className={`h2 ${s.h}`} data-reveal>
            <T v={COPY.journey.titleA} /> <span className="serif">
              <T v={COPY.journey.titleSerif} />
            </span>
          </h2>
          <p className={`${s.intro} muted`} data-reveal>
            <T v={COPY.journey.intro} />
          </p>
        </div>

        <ol className={s.log}>
          {journey.map((entry) => (
            <li key={entry.id} className={s.entry} data-reveal>
              <Years entry={entry} />
              <span className={s.node} aria-hidden="true" />
              <div className={s.body}>
                <p className={`${s.type} meta`}>
                  <T v={JOURNEY_TYPES[entry.type] ?? { en: entry.type, tr: entry.type }} />
                  <span aria-hidden="true"> · </span>
                  <span className={s.period}>
                    <T v={entry.period} />
                  </span>
                </p>
                <h3 className={s.title}>
                  <T v={entry.title} />
                </h3>
                <p className={s.org}>
                  <T v={entry.org} />
                </p>
                <Description value={entry.description} />
              </div>
            </li>
          ))}
        </ol>

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
