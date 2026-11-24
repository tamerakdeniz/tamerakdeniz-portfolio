import { COPY } from '@/lib/content/copy';
import { OWNER, type Loc, type Portfolio } from '@/lib/content/portfolio';
import { HeroContours } from './ContourField';
import { PointerDrift } from './PointerDrift';
import { T } from './T';
import s from './EditorialHero.module.css';

/** Splits an admin-provided title into two lines and sets the final word in serif. */
function CustomTitle({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  const last = words.pop() ?? '';
  const mid = Math.ceil(words.length / 2);
  const lineA = words.slice(0, mid).join(' ');
  const lineB = words.slice(mid).join(' ');
  return (
    <>
      <span className={s.line}>{lineA || last}</span>
      {lineA && (
        <span className={s.line}>
          {lineB && `${lineB} `}
          <span className="serif">{last}</span>
        </span>
      )}
    </>
  );
}

function Title({ custom }: { custom: Loc | null }) {
  if (custom) {
    return (
      <>
        <span data-l="en" className={s.lines}>
          <CustomTitle text={custom.en} />
        </span>
        <span data-l="tr" lang="tr" className={s.lines}>
          <CustomTitle text={custom.tr} />
        </span>
      </>
    );
  }
  return (
    <>
      <span data-l="en" className={s.lines}>
        <span className={s.line}>{COPY.hero.titleA.en}</span>
        <span className={s.line}>
          {COPY.hero.titleB.en} <span className="serif">{COPY.hero.titleSerif.en}</span>
        </span>
      </span>
      <span data-l="tr" lang="tr" className={s.lines}>
        <span className={s.line}>{COPY.hero.titleA.tr}</span>
        <span className={s.line}>
          <span className="serif">{COPY.hero.titleSerif.tr}</span>
        </span>
      </span>
    </>
  );
}

export function EditorialHero({ portfolio }: { portfolio: Portfolio }) {
  const { hero, contact, availability, cv } = portfolio;

  return (
    <section id="surface" className={`${s.hero} surface-dark`} aria-labelledby="hero-title">
      <div className={`wrap ${s.frame}`}>
        <div className={`grid ${s.grid}`}>
          <div className={s.copy}>
            <h1 id="hero-title" className={s.title}>
              <span className={`${s.kicker} meta`} data-enter style={{ '--i': 0 } as React.CSSProperties}>
                {OWNER.fullName}
                <span className={s.slash} aria-hidden="true">
                  /
                </span>
                <span className="sr-only">, </span>
                <T v={OWNER.role} />
              </span>
              <span className={`display ${s.display}`} data-enter style={{ '--i': 1 } as React.CSSProperties}>
                <Title custom={hero.title} />
              </span>
            </h1>

            <p className={`lede ${s.lede}`} data-enter style={{ '--i': 2 } as React.CSSProperties}>
              <T v={hero.description ?? COPY.hero.lede} />
            </p>

            <div className={s.actions} data-enter style={{ '--i': 3 } as React.CSSProperties}>
              <a className="btn btn-primary" href="#work">
                <T v={COPY.hero.explore} />
                <span className="arrow arrow-se" aria-hidden="true">
                  ↘
                </span>
              </a>
              <a className={`tlink ${s.cv}`} href={cv.viewUrl} target="_blank" rel="noopener">
                <T v={COPY.hero.viewCv} />
                <span className="arrow arrow-ne" aria-hidden="true">
                  {' '}
                  ↗
                </span>
              </a>
            </div>
          </div>

          <figure className={s.art}>
            <PointerDrift className={s.drift}>
              <HeroContours className={s.contours} />
            </PointerDrift>
            <figcaption className={`${s.figcaption} meta-plain`}>
              <T v={COPY.hero.figure} />
            </figcaption>
          </figure>
        </div>

        <div className={`${s.base} meta`}>
          <span>
            <span className="tabular">00</span> / <T v={{ en: 'Surface', tr: 'Yüzey' }} />
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
            <span className="arrow" aria-hidden="true">
              ↓
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
