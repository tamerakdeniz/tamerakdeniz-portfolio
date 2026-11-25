import type { Loc } from '@/lib/content/portfolio';
import { ContourBand } from './ContourField';
import { T } from './T';
import s from './PageIntro.module.css';

export function PageIntro({
  eyebrow,
  titleA,
  titleSerif,
  intro,
  seed,
  children,
}: {
  eyebrow: React.ReactNode;
  titleA: Loc;
  titleSerif: Loc;
  intro?: Loc;
  seed: number;
  children?: React.ReactNode;
}) {
  return (
    <header className={`surface-dark ${s.intro}`}>
      <ContourBand seed={seed} count={9} height={200} amplitude={20} tone="tidal" opacity={0.3} className={s.band} draw={false} />
      <div className="wrap">
        <p className={`${s.eyebrow} meta muted`} data-enter style={{ '--i': 0 } as React.CSSProperties}>
          {eyebrow}
        </p>
        <div className={`editorial-grid ${s.grid}`}>
          <h1 className={`display ${s.h}`} data-enter style={{ '--i': 1 } as React.CSSProperties}>
            <T v={titleA} />{' '}
            <span className="serif">
              <T v={titleSerif} />
            </span>
          </h1>
          {intro && (
            <p className={`lede muted ${s.lede}`} data-enter style={{ '--i': 2 } as React.CSSProperties}>
              <T v={intro} />
            </p>
          )}
          {children && (
            <div className={s.aside} data-enter style={{ '--i': 3 } as React.CSSProperties}>
              {children}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
