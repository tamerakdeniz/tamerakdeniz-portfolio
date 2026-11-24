import type { Metadata } from 'next';
import Link from 'next/link';
import { COPY } from '@/lib/content/copy';
import { getPortfolio } from '@/lib/content/get-portfolio';
import { PortfolioShell } from '@/components/portfolio/PortfolioShell';
import { PageIntro } from '@/components/portfolio/PageIntro';
import { LabExplorer } from '@/components/portfolio/LabExplorer';
import { T } from '@/components/portfolio/T';
import s from './projects.module.css';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Project archive',
  description:
    'Every published project by Mustafa Tamer Akdeniz — web products, AI experiments, client sites, tools and practice apps — each with its own project file.',
  alternates: { canonical: '/projects' },
};

export default async function ProjectsPage() {
  const portfolio = await getPortfolio();

  return (
    <PortfolioShell portfolio={portfolio}>
      <PageIntro
        seed={404}
        eyebrow={
          <>
            <Link href="/">Tamer Akdeniz</Link>
            <span aria-hidden="true">/</span>
            <span>
              <T v={COPY.nav.archive} />
            </span>
          </>
        }
        titleA={COPY.archive.titleA}
        titleSerif={COPY.archive.titleSerif}
        intro={COPY.archive.intro}
      />
      <section className={`surface-dark ${s.section}`} aria-label="Projects">
        <div className="wrap">
          {portfolio.projects.length > 0 ? (
            <LabExplorer projects={portfolio.projects} headingLevel={2} listLabel={COPY.lab.projectsLabel} />
          ) : (
            <p className="lede">
              <T v={COPY.archive.empty} />
            </p>
          )}
        </div>
      </section>
    </PortfolioShell>
  );
}
