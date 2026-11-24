import type { Metadata } from 'next';
import Link from 'next/link';
import { COPY } from '@/lib/content/copy';
import { getPortfolio } from '@/lib/content/get-portfolio';
import { OWNER } from '@/lib/content/portfolio';
import { PortfolioShell } from '@/components/portfolio/PortfolioShell';
import { PageIntro } from '@/components/portfolio/PageIntro';
import { FieldJournal } from '@/components/portfolio/FieldJournal';
import { Instruments } from '@/components/portfolio/Instruments';
import { ExpeditionLog } from '@/components/portfolio/ExpeditionLog';
import { Horizon } from '@/components/portfolio/ContourField';
import { T } from '@/components/portfolio/T';
import s from './about.module.css';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'About',
  description: `${OWNER.fullName} — software developer and scuba diving instructor. The longer story, the tools he uses, and the path so far.`,
  alternates: { canonical: '/about' },
  openGraph: { type: 'profile', url: '/about' },
};

export default async function AboutPage() {
  const portfolio = await getPortfolio();
  const { contact } = portfolio;

  return (
    <PortfolioShell portfolio={portfolio}>
      <PageIntro
        seed={1010}
        eyebrow={
          <>
            <Link href="/">Tamer Akdeniz</Link>
            <span aria-hidden="true">/</span>
            <span>
              <T v={COPY.about.eyebrow} />
            </span>
          </>
        }
        titleA={COPY.about.titleA}
        titleSerif={COPY.about.titleSerif}
        intro={COPY.about.intro}
      >
        <p className={`${s.facts} meta`}>
          <span>{OWNER.fullName}</span>
          <span aria-hidden="true">·</span>
          <T v={OWNER.role} />
          <span aria-hidden="true">·</span>
          <T v={contact.location} />
        </p>
      </PageIntro>

      <FieldJournal portfolio={portfolio} standalone />
      <Instruments skills={portfolio.skills} />
      <ExpeditionLog portfolio={portfolio} standalone />

      <section className={`surface-dark ${s.cta}`} aria-labelledby="about-cta">
        <Horizon className={s.horizon} />
        <div className="wrap">
          <h2 id="about-cta" className="h2">
            <T v={COPY.contact.titleA} />{' '}
            <span className="serif">
              <T v={COPY.contact.titleSerif} />
            </span>
          </h2>
          <div className={s.ctaRow}>
            <a className="btn btn-primary" href={`mailto:${contact.email}`}>
              <T v={COPY.about.cta} />
              <span className="arrow arrow-ne" aria-hidden="true">
                ↗
              </span>
            </a>
            <Link className="tlink hit" href="/#contact">
              <T v={COPY.about.ctaHome} />
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
