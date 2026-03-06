import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Tamer Akdeniz - AI-Focused Software Developer',
  description:
    'Learn more about Tamer Akdeniz - an AI-focused software developer with expertise in building intelligent applications, LLM integrations, and full-stack solutions.',
  openGraph: {
    title: 'About | Tamer Akdeniz - AI-Focused Software Developer',
    description:
      'Learn more about Tamer Akdeniz - an AI-focused software developer with expertise in building intelligent applications.',
    url: 'https://tamerakdeniz.com/about',
    type: 'profile',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
