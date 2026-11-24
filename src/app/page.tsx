import { getPortfolio } from '@/lib/content/get-portfolio';
import { OWNER } from '@/lib/content/portfolio';
import { PortfolioShell } from '@/components/portfolio/PortfolioShell';
import { EditorialHero } from '@/components/portfolio/EditorialHero';
import { HumanSpread } from '@/components/portfolio/HumanSpread';
import { FeaturedWork } from '@/components/portfolio/FeaturedWork';
import { LabIndex } from '@/components/portfolio/LabIndex';
import { EngineeringPillars } from '@/components/portfolio/EngineeringPillars';
import { JourneyLog } from '@/components/portfolio/JourneyLog';
import { ContactHorizon } from '@/components/portfolio/ContactHorizon';
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
          name: OWNER.fullName,
          alternateName: OWNER.shortName,
          url: OWNER.siteUrl,
          jobTitle: OWNER.role.en,
          email: `mailto:${portfolio.contact.email}`,
          sameAs,
        }}
      />
      <EditorialHero portfolio={portfolio} />
      <HumanSpread portfolio={portfolio} />
      <FeaturedWork portfolio={portfolio} />
      <LabIndex portfolio={portfolio} />
      <EngineeringPillars portfolio={portfolio} />
      <JourneyLog portfolio={portfolio} />
      <ContactHorizon portfolio={portfolio} />
    </PortfolioShell>
  );
}
