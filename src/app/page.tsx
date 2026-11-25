import { getPortfolio } from '@/lib/content/get-portfolio';
import { OWNER } from '@/lib/content/portfolio';
import { PortfolioShell } from '@/components/portfolio/PortfolioShell';
import { DescentHero } from '@/components/portfolio/DescentHero';
import { FieldJournal } from '@/components/portfolio/FieldJournal';
import { WorkPlates } from '@/components/portfolio/WorkPlates';
import { LabChapter } from '@/components/portfolio/LabChapter';
import { EngineeringChapter } from '@/components/portfolio/EngineeringChapter';
import { ExpeditionLog } from '@/components/portfolio/ExpeditionLog';
import { ContactSignal } from '@/components/portfolio/ContactSignal';
import { JsonLd } from '@/components/portfolio/JsonLd';

export const revalidate = 60;

export default async function HomePage() {
  const portfolio = await getPortfolio();
  const sameAs = Object.values(portfolio.contact.social).filter(Boolean);

  return (
    <PortfolioShell portfolio={portfolio} mode="home">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: portfolio.profile.fullName,
          alternateName: portfolio.profile.shortName,
          url: OWNER.siteUrl,
          jobTitle: portfolio.profile.role.en,
          email: `mailto:${portfolio.contact.email}`,
          sameAs,
        }}
      />
      <DescentHero portfolio={portfolio} />
      <FieldJournal portfolio={portfolio} />
      <WorkPlates portfolio={portfolio} />
      <LabChapter portfolio={portfolio} />
      <EngineeringChapter portfolio={portfolio} />
      <ExpeditionLog portfolio={portfolio} />
      <ContactSignal portfolio={portfolio} />
    </PortfolioShell>
  );
}
