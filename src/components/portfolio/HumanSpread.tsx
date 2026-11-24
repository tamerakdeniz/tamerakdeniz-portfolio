import Image from 'next/image';
import Link from 'next/link';
import { COPY } from '@/lib/content/copy';
import type { Portfolio } from '@/lib/content/portfolio';
import { ChapterLabel } from './ChapterLabel';
import { ContourBand } from './ContourField';
import { T, TBlocks } from './T';
import s from './HumanSpread.module.css';

export function HumanSpread({ portfolio, standalone = false }: { portfolio: Portfolio; standalone?: boolean }) {
  const { about } = portfolio;

  return (
    <section
      id={standalone ? 'story' : 'about'}
      className={`chapter surface-paper ${s.human}`}
      aria-labelledby="about-title"
    >
      <ContourBand seed={11} count={5} height={120} amplitude={18} tone="ink" opacity={0.18} className={s.band} />
      <div className="wrap">
        {standalone ? (
          <p className="chapter-label meta">
            <strong>
              <T v={COPY.about.story} />
            </strong>
          </p>
        ) : (
          <ChapterLabel id="about" />
        )}

        <div className={`grid ${s.grid}`}>
          <figure className={s.diver} data-reveal>
            <div className={s.diverFrame}>
              <Image
                src="/img/underwaterme.jpg"
                alt="Tamer Akdeniz scuba diving, seen from below against open blue water"
                fill
                sizes="(min-width: 1024px) 38vw, (min-width: 768px) 60vw, 100vw"
                className={s.img}
              />
            </div>
            <figcaption className={`${s.caption} meta-plain`}>
              <T v={COPY.human.diverCaption} />
            </figcaption>
          </figure>

          <div className={s.text}>
            <h2 id="about-title" className="h2" data-reveal>
              <T v={COPY.human.titleA} /> <span className="serif">
                <T v={COPY.human.titleSerif} />
              </span>
            </h2>

            <TBlocks
              en={about.paragraphs.en}
              tr={about.paragraphs.tr}
              render={(paragraphs) =>
                paragraphs.length > 0 && (
                  <div className={s.body}>
                    <p className={`lede ${s.lead}`} data-reveal>
                      {paragraphs[0]}
                    </p>
                    {paragraphs.length > 1 && (
                      <div className={`prose ${s.prose}`} data-reveal>
                        {paragraphs.slice(1).map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }
            />

            <p className={s.parallel} data-reveal>
              <T v={COPY.human.parallel} />
            </p>

            {!standalone && (
              <Link className={`tlink ${s.more}`} href="/about">
                <T v={COPY.human.more} />
                <span className="arrow" aria-hidden="true">
                  {' '}
                  →
                </span>
              </Link>
            )}
          </div>

          {about.portrait && (
            <figure className={s.portrait} data-reveal>
              <div className={s.portraitFrame}>
                <Image
                  src={about.portrait}
                  alt="Portrait of Tamer Akdeniz"
                  fill
                  sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 60vw"
                  className={s.img}
                />
              </div>
              <figcaption className={`${s.caption} meta-plain`}>
                <T v={COPY.human.portraitCaption} />
              </figcaption>
            </figure>
          )}
        </div>
      </div>
    </section>
  );
}
