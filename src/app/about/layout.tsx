import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | Tamer Akdeniz - AI Product Systems',
  description:
    'Learn how Tamer Akdeniz approaches AI product systems through deep research, full-stack execution, and shipped software.',
  openGraph: {
    title: 'About | Tamer Akdeniz - AI Product Systems',
    description:
      'A closer look at Tamer Akdeniz and his approach to AI-powered products.',
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
