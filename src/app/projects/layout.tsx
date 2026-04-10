import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Projects | Tamer Akdeniz - AI & Full-Stack Development Portfolio',
  description:
    "Explore Tamer Akdeniz's portfolio of AI applications, web development projects, mobile apps, and startup ventures.",
  openGraph: {
    title: 'Projects | Tamer Akdeniz - AI & Full-Stack Development Portfolio',
    description:
      "Explore Tamer Akdeniz's portfolio of AI applications, web development projects, and startup ventures.",
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
