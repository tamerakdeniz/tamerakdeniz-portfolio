import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects | Tamer Akdeniz - AI Product Build Archive',
  description:
    "Explore Tamer Akdeniz's build archive of AI applications, web products, mobile apps, and shipped experiments.",
  openGraph: {
    title: 'Projects | Tamer Akdeniz - AI Product Build Archive',
    description:
      "Explore Tamer Akdeniz's AI, web, mobile, and product systems.",
    url: 'https://tamerakdeniz.com/projects',
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
