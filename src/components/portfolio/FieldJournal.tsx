import Image from 'next/image';
import Link from 'next/link';
import { COPY } from '@/lib/content/copy';
import type { Portfolio } from '@/lib/content/portfolio';
import { ChapterMark } from './ChapterMark';
import { InView } from './InView';
import { T, TBlocks } from './T';
import s from './FieldJournal.module.css';

/** A hand-drawn arrow, drawn on when its annotation enters the viewport. */
function Scribble({ d, className }: { d: string; className?: string }) {
  return (
    <svg className={`${s.scribble} ${className ?? ''}`} viewBox="0 0 120 80" aria-hidden="true">
      <path d={d} pathLength={1} />
    </svg>
  );
}

/**
 * 01 — The Human. A two-page field journal floating in the water column: the real
 * photographs taped in, annotated by hand, with the owner's own words on the facing page.
 */
export function FieldJournal({ portfolio, standalone = false }: { portfolio: Portfolio; standalone?: boolean }) {
  const { about } = portfolio;
  const photo = portfolio.profile.fieldPhoto;

  return (
    <section
      id={standalone ? 'story' : 'about'}
      className={`${s.human} ${standalone ? s.standalone : ''} surface-dark`}
      aria-labelledby="about-title"
      data-scrub="view"
    >
      <div className="wrap">
        {!standalone && <ChapterMark id="about" className={s.mark} />}

        <article className={`${s.sheet} surface-paper`}>
          <div className={s.pageL}>
            <p className={`${s.running} meta`}>
              <span>
                <T v={COPY.human.journal} />
              </span>
              <span className="tabular">
                <T v={COPY.human.page} />
              </span>
            </p>

            {about.title && (
              <p className={`${s.greeting} hand`}>
                <T v={about.title} />
              </p>
            )}

            <h2 id="about-title" className={`h2 ${s.title}`}>
              <T v={COPY.human.titleA} />{' '}
              <span className="serif">
                <T v={COPY.human.titleSerif} />
              </span>
            </h2>

            <TBlocks
              en={about.paragraphs.en}
              tr={about.paragraphs.tr}
              render={(paragraphs) =>
                paragraphs.length > 0 && (
                  <div className={s.body}>
                    <p className={s.lead}>{paragraphs[0]}</p>
                    {paragraphs.length > 1 && (
                      <div className={`prose ${s.prose}`}>
                        {paragraphs.slice(1).map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
            />

            <blockquote className={s.parallel}>
              <p className="serif">
                <T v={COPY.human.parallel} />
              </p>
            </blockquote>

            {!standalone && (
              <Link className={`tlink hit ${s.more}`} href="/about">
                <T v={COPY.human.more} />
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            )}
          </div>

          <div className={s.pageR}>
            <InView className={s.diver} threshold={0.35}>
              <figure className={s.print}>
                <span className={s.tape} aria-hidden="true" />
                <span className={s.frame}>
                  <Image
                    src={photo.url}
                    alt={photo.alt.en}
                    fill
                    sizes="(min-width: 1024px) 34vw, (min-width: 768px) 70vw, 92vw"
                    className={s.img}
                  />
                </span>
                <figcaption className={`${s.caption} meta-plain`}>
                  <T v={photo.caption ?? COPY.human.diverCaption} />
                </figcaption>
              </figure>
              <p className={`${s.note} ${s.noteDiver} hand`}>
                <Scribble d="M110 8 C 80 6, 50 18, 34 40 S 18 66, 10 72 M10 72 L 24 70 M10 72 L 12 58" />
                <T v={photo.note ?? COPY.human.diverNote} />
              </p>
            </InView>

            {about.portrait && (
              <InView className={s.portrait} threshold={0.4}>
                <figure className={s.print}>
                  <span className={`${s.tape} ${s.tapeB}`} aria-hidden="true" />
                  <span className={`${s.frame} ${s.frameSquare}`}>
                    <Image
                      src={about.portrait}
                      alt={portfolio.profile.fullName}
                      fill
                      sizes="(min-width: 1024px) 16vw, 44vw"
                      className={s.img}
                    />
                  </span>
                </figure>
                <p className={`${s.note} ${s.notePortrait} hand`}>
                  <Scribble d="M8 70 C 30 66, 52 52, 64 34 S 90 10, 112 12 M112 12 L 98 6 M112 12 L 102 22" />
                  {portfolio.profile.shortName}
                </p>
              </InView>
            )}
          </div>
        </article>
      </div>
    </section>
  );
}
