import { COPY } from '@/lib/content/copy';
import type { Portfolio } from '@/lib/content/portfolio';
import { SceneLayer } from '@/components/scene/SceneLayer';
import { ExpeditionChrome } from './ExpeditionChrome';
import { SiteFooter } from './SiteFooter';
import { T } from './T';
import type { ChromeData } from './chrome-types';

export function chromeFrom(portfolio: Portfolio): ChromeData {
  const years = portfolio.journey.flatMap((j) => [j.startYear, j.endYear ?? String(new Date().getFullYear())]);
  const numeric = years.filter((y): y is string => !!y).map(Number);
  return {
    cvLanguage: portfolio.cv.language,
    cvVariants: portfolio.cv.variants,
    cvUrl: portfolio.cv.viewUrl,
    cvDownloadUrl: portfolio.cv.downloadUrl,
    cvFileName: portfolio.cv.fileName,
    email: portfolio.contact.email,
    projects: portfolio.projects.map((p) => ({ slug: p.slug, name: p.name, number: p.number })),
    featured: portfolio.featured.map((p) => ({ slug: p.slug, name: p.name, image: p.image })),
    archiveCount: portfolio.projects.length,
    journeySpan: numeric.length ? `${Math.min(...numeric)}–${Math.max(...numeric)}` : null,
    journeyCount: portfolio.journey.length,
    hasAssistant: portfolio.assistant,
    ownerName: portfolio.profile.fullName,
    fieldPhoto: portfolio.profile.fieldPhoto.url,
  };
}

export function PortfolioShell({
  portfolio,
  mode = 'page',
  children,
}: {
  portfolio: Portfolio;
  mode?: 'home' | 'page' | 'resume';
  children: React.ReactNode;
}) {
  const home = mode === 'home';
  return (
    <>
      <a className="skip-link" href="#main" data-chrome>
        <T v={COPY.skip} />
      </a>
      {home && <SceneLayer />}
      <ExpeditionChrome mode={mode} chrome={chromeFrom(portfolio)} />
      <main
        id="main"
        tabIndex={-1}
        className={`${home ? 'has-rail expedition' : 'page-main'}`}
        style={{ flex: '1 0 auto', outline: 'none' }}
      >
        {children}
      </main>
      <div className={home ? 'has-rail footer-holder' : 'footer-holder'}>
        <SiteFooter paper={mode === 'resume'} ownerName={portfolio.profile.fullName} />
      </div>
    </>
  );
}
