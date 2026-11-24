import type { Loc } from '@/lib/content/portfolio';

/** The slice of content the header, menu and command palette need on every page. */
export interface ChromeData {
  cvUrl: string;
  email: string;
  projects: { slug: string; name: Loc; number: number }[];
}
