import { COPY } from '@/lib/content/copy';
import type { Portfolio } from '@/lib/content/portfolio';
import { SiteHeader } from './SiteHeader';
import { SiteFooter } from './SiteFooter';
import { DepthRail } from './DepthRail';
import { T } from './T';
import type { ChromeData } from './chrome-types';

export function chromeFrom(portfolio: Portfolio): ChromeData {
  return {
    cvUrl: portfolio.cv.viewUrl,
    email: portfolio.contact.email,
    projects: portfolio.projects.map((p) => ({ slug: p.slug, name: p.name, number: p.number })),
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
      <SiteHeader mode={mode} chrome={chromeFrom(portfolio)} />
      {home && <DepthRail />}
      <main id="main" tabIndex={-1} className={home ? 'has-rail' : undefined} style={{ flex: '1 0 auto', outline: 'none' }}>
        {children}
      </main>
      <div className={home ? 'has-rail' : undefined}>
        <SiteFooter paper={mode === 'resume'} />
      </div>
    </>
  );
}
