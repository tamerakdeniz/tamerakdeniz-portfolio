import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Tamer Akdeniz | Deep Work for AI Product Systems',
  description:
    'Tamer Akdeniz builds AI-powered product systems from unclear ideas to working software, combining deep research, full-stack execution, and LLM integration.',
  keywords: [
    'Tamer Akdeniz',
    'AI Developer',
    'Software Developer',
    'Full-Stack Developer',
    'LLM Integration',
    'Machine Learning',
    'Web Development',
  ],
  authors: [{ name: 'Tamer Akdeniz' }],
  metadataBase: new URL('https://tamerakdeniz.com'),
  openGraph: {
    type: 'website',
    url: 'https://tamerakdeniz.com',
    title: 'Tamer Akdeniz | AI Product Systems',
    description:
      'AI-powered product systems built with deep research, full-stack execution, and LLM integration.',
    images: [{ url: '/img/underwaterme.jpg', width: 1200, height: 630 }],
    siteName: 'Tamer Akdeniz Portfolio',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tamer Akdeniz | AI Product Systems',
    description:
      'AI-powered product systems built with deep research, full-stack execution, and LLM integration.',
    images: ['/img/underwaterme.jpg'],
  },
  icons: {
    icon: '/img/favicon.ico',
    apple: '/img/logo-nobg.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var theme = localStorage.getItem('portfolio_theme') || 'dark';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
                if ('scrollRestoration' in history) {
                  history.scrollRestoration = 'manual';
                }
                window.scrollTo(0, 0);
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} font-[family-name:var(--font-inter)] bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-300`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
