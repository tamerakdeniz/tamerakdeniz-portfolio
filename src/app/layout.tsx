import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Mono, Instrument_Serif, Space_Grotesk } from 'next/font/google';
import '@/styles/globals.css';
import '@/styles/tokens.css';
import { BOOT_SCRIPT } from '@/lib/lang-boot';
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

const description =
  'Mustafa Tamer Akdeniz is a software developer who builds software, explores ideas, and turns complex problems into useful products.';

export const metadata: Metadata = {
  metadataBase: new URL(OWNER.siteUrl),
  title: {
    default: `${OWNER.fullName} — Software Developer`,
    template: `%s — ${OWNER.fullName}`,
  },
  description,
  authors: [{ name: OWNER.fullName, url: OWNER.siteUrl }],
  creator: OWNER.fullName,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: OWNER.siteUrl,
    siteName: OWNER.fullName,
    title: `${OWNER.fullName} — Software Developer`,
    description,
    images: [{ url: '/img/underwaterme.jpg', alt: `${OWNER.fullName} scuba diving` }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${OWNER.fullName} — Software Developer`,
    description,
    images: ['/img/underwaterme.jpg'],
  },
  icons: {
    icon: '/img/favicon.ico',
    apple: '/img/logo-nobg.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#080f16',
  colorScheme: 'dark light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${serif.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body className="site">{children}</body>
    </html>
  );
}
