import type { Loc } from '@/lib/content/portfolio';

/** The slice of content the header, index, CV viewer and command palette need on every page. */
export interface ChromeData {
  cvVariants?: import('@/lib/content/portfolio').Portfolio['cv']['variants'];
  cvLanguage?: 'en' | 'tr';
  cvUrl: string;
  cvDownloadUrl: string;
  cvFileName: string;
  email: string;
  projects: { slug: string; name: Loc; number: number }[];
  /** Real marks of the featured projects, for the index preview. */
  featured: { slug: string; name: Loc; image: string | null }[];
  archiveCount: number;
  journeySpan: string | null;
  journeyCount: number;
  hasAssistant: boolean;
  ownerName: string;
  fieldPhoto: string;
}
