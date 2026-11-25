import type { Metadata, Viewport } from 'next';
import { Caveat, IBM_Plex_Mono, Instrument_Serif, Space_Grotesk } from 'next/font/google';
import '@/styles/globals.css';
import '@/styles/tokens.css';
import { BOOT_SCRIPT } from '@/lib/lang-boot';
import { getPortfolio } from '@/lib/content/get-portfolio';
import { OWNER } from '@/lib/content/portfolio';

const display = Space_Grotesk({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-display-family',
  display: 'swap',
});

const serif = Instrument_Serif({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-serif-family',
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-mono-family',
  display: 'swap',
});

const hand = Caveat({
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600'],
  variable: '--font-hand-family',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const { profile, hero, about } = await getPortfolio();
  const description = hero.description?.en || about.paragraphs.en[0] || `${profile.fullName} — ${profile.role.en}`;
  const title = `${profile.fullName} — ${profile.role.en}`;
  const images = [{ url: profile.fieldPhoto.url, alt: profile.fieldPhoto.alt.en }];
  return {
    metadataBase: new URL(OWNER.siteUrl),
    title: { default: title, template: `%s — ${profile.fullName}` },
    description,
    authors: [{ name: profile.fullName, url: OWNER.siteUrl }],
    creator: profile.fullName,
    alternates: { canonical: '/' },
    openGraph: { type: 'website', url: OWNER.siteUrl, siteName: profile.fullName, title, description, images },
    twitter: { card: 'summary_large_image', title, description, images },
    icons: { icon: '/img/favicon.ico', apple: '/img/logo-nobg.png' },
  };
}

export const viewport: Viewport = {
  themeColor: '#080f16',
  colorScheme: 'dark light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${serif.variable} ${mono.variable} ${hand.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body className="site">{children}</body>
    </html>
  );
}
