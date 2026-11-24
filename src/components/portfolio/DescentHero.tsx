import { CHAPTERS, COPY } from '@/lib/content/copy';
import { OWNER, type Loc, type Portfolio } from '@/lib/content/portfolio';
import { DepthReadout } from './DepthReadout';
import { Submerge } from './Submerge';
import { T } from './T';
import s from './DescentHero.module.css';

function splitTitle(text: string): [string, string] {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return [text, ''];
  return [words[0], words.slice(1).join(' ')];
}

/** First line is the half-submerged display word; the rest is set in serif, below the surface. */
function titleLines(custom: Loc | null) {
  if (!custom) {
    return {
      a: { en: COPY.hero.titleA.en, tr: COPY.hero.titleA.tr },
      b: {
        en: `${COPY.hero.titleB.en} ${COPY.hero.titleSerif.en}`.trim(),
        tr: `${COPY.hero.titleB.tr} ${COPY.hero.titleSerif.tr}`.trim(),
      },
    };
  }
  const [aEn, bEn] = splitTitle(custom.en);
  const [aTr, bTr] = splitTitle(custom.tr);
  return { a: { en: aEn, tr: aTr }, b: { en: bEn, tr: bTr } };
}

export function DescentHero({ portfolio }: { portfolio: Portfolio }) {
  const { hero, contact, availability, cv } = portfolio;
  const lines = titleLines(hero.title);
  const next = CHAPTERS[1];

  return (
    <section id="surface" className={`${s.hero} surface-dark`} data-hero aria-labelledby="hero-title">
      <div className={s.stage} data-hero-stage>
        <div className={`wrap ${s.frame}`}>
          <h1 id="hero-title" className={s.title}>
            <Submerge className={`${s.kicker} meta`} shift={0.5}>
              {OWNER.fullName}
              <span className={s.slash} aria-hidden="true">
                {' '}
                —{' '}
              </span>
              <span className="sr-only">, </span>
              <T v={OWNER.role} />
            </Submerge>
            <span className={s.titleWrap} data-cut>
              <i className={s.marker} data-waterline aria-hidden="true" />
              <Submerge className={s.lineA} cut="0.52em" shift={0.42}>
                <T v={lines.a} />
              </Submerge>
            </span>
            {(lines.b.en || lines.b.tr) && (
              <span className={`${s.lineB} serif`} data-shift>
                <T v={lines.b} />
              </span>
            )}
          </h1>

          <div className={s.lower} data-shift-lower>
            <p className={s.lede}>
              <T v={hero.description ?? COPY.hero.lede} />
            </p>
            <div className={s.actions}>
              <a className="btn btn-primary" href="#work">
                <T v={COPY.hero.explore} />
                <span className="arrow arrow-se" aria-hidden="true">
                  ↘
                </span>
              </a>
              <a className={`tlink hit ${s.cv}`} href={cv.viewUrl} target="_blank" rel="noopener" data-cv-link>
                <T v={COPY.hero.viewCv} />
                <span className="arrow arrow-ne" aria-hidden="true">
                  ↗
                </span>
              </a>
            </div>
          </div>
        </div>

        <div className={s.descent} aria-hidden="true">
          <span className="meta">
            <T v={COPY.hero.descending} />
          </span>
          <span className={s.descentDepth}>
            <DepthReadout source="hero" scale={next.depth} />
            <span className={s.unit}>m</span>
          </span>
          <span className={`${s.descentNext} serif`}>
            <span className="meta tabular">{next.index}</span> <T v={next.name} />
          </span>
        </div>

        <div className={`wrap ${s.base} meta`}>
          <span>
            <span className="tabular">00</span> / <T v={CHAPTERS[0].name} />
          </span>
          <span className={s.status}>
            <T v={contact.location} />
            {availability && (
              <>
                <span aria-hidden="true"> · </span>
                <T v={availability.label} />
              </>
            )}
          </span>
          <a className={s.scroll} href="#about">
            <T v={COPY.hero.scroll} />
            <span className={s.plumb} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
