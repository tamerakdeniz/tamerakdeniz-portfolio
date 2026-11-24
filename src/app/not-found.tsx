import type { Metadata } from 'next';
import Link from 'next/link';
import { COPY } from '@/lib/content/copy';
import { getPortfolio } from '@/lib/content/get-portfolio';
import { PortfolioShell } from '@/components/portfolio/PortfolioShell';
import { ContourBand } from '@/components/portfolio/ContourField';
import { T } from '@/components/portfolio/T';
import s from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Uncharted water',
  robots: { index: false },
};

export default async function NotFound() {
  const portfolio = await getPortfolio();
  return (
    <PortfolioShell portfolio={portfolio}>
      <section className={`surface-dark ${s.lost}`} aria-labelledby="lost-title">
        <ContourBand seed={404} count={26} height={520} amplitude={34} compress={1.04} tone="tidal" opacity={0.26} className={s.field} draw={false} />
        <div className="wrap">
          <p className={`${s.code} meta tabular`} data-enter>
            404 <span aria-hidden="true">·</span> ?? m
          </p>
          <h1 id="lost-title" className={`display ${s.h}`} data-enter style={{ '--i': 1 } as React.CSSProperties}>
            <span className="serif">
              <T v={COPY.notFound.title} />
            </span>
          </h1>
          <p className={`lede muted ${s.body}`} data-enter style={{ '--i': 2 } as React.CSSProperties}>
            <T v={COPY.notFound.body} />
          </p>
          <div className={s.actions} data-enter style={{ '--i': 3 } as React.CSSProperties}>
            <Link className="btn btn-primary" href="/">
              <span className="arrow arrow-up" aria-hidden="true">
                ↑
              </span>
              <T v={COPY.notFound.home} />
            </Link>
            <Link className="tlink hit" href="/projects">
              <T v={COPY.notFound.archive} />
              <span className="arrow" aria-hidden="true">
                {' '}
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </PortfolioShell>
  );
}
