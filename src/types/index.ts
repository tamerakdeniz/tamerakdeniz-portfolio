export interface LocalizedString {
  en: string;
  tr: string;
}

/**
 * Every field added after the original schema is optional, so legacy records stay valid.
 * Defaults live in src/lib/content/portfolio.ts (public) and the admin forms.
 */

export type MediaKind = 'cover' | 'logo' | 'desktop' | 'mobile' | 'diagram' | 'video';
export type MediaClassification = 'authentic-web' | 'authentic-native' | 'simulated-demo' | 'ai-concept' | 'editorial-illustration' | 'architecture-diagram' | 'logo' | 'video';

export interface ProjectMedia {
  classification?: MediaClassification;
  source?: string;
  attribution?: string;
  verification?: 'verified' | 'simulated' | 'conceptual' | 'unverified';
  id: string;
  kind: MediaKind;
  /** Download URL (Firebase Storage) or a site-relative path. */
  url: string;
  /** Storage object path, kept so replaced media can be deleted safely. */
  path?: string;
  alt?: LocalizedString;
  caption?: LocalizedString;
  width?: number;
  height?: number;
  contentType?: string;
  order?: number;
  uploadedAt?: string;
}

export type PresentationVariant = 'auto' | 'editorial' | 'technical' | 'mobile' | 'immersive' | 'minimal';
export type Backplate = 'white' | 'black' | 'ink' | 'paper' | 'mist' | 'bleed';
export type PlateField = 'night' | 'paper' | 'violet' | 'ink';
export type PlateArtKey = 'none' | 'timer' | 'day' | 'route';

export interface ProjectPresentation {
  variant?: PresentationVariant;
  /** Hex colour used for accents on the project's plate and page. */
  accent?: string;
  /** Background the logo sits on. */
  backplate?: Backplate;
  /** Padding around a logo, 0–0.3 of the plate. */
  inset?: number;
  field?: PlateField;
  /** Conceptual plate art, shown only when there are no screenshots. */
  art?: PlateArtKey;
}

export interface ProjectLink {
  label: LocalizedString;
  url: string;
}

export interface Project {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  category: string | string[];
  techStack: string[];
  githubUrl: string;
  demoUrl: string;
  liveUrl?: string;
  /** Legacy single image (a logo for every existing record). `media` takes precedence. */
  image: string;
  imagePath?: string;
  order?: number;
  published: boolean;
  slug?: string;
  /** Former slugs; old URLs redirect permanently to the current one. */
  previousSlugs?: string[];
  /** Kept reachable at its URL but removed from listings, search, sitemap and the assistant. */
  archived?: boolean;
  featured?: boolean;
  featuredOrder?: number;
  role?: LocalizedString;
  contribution?: LocalizedString;
  period?: LocalizedString;
  status?: string;
  year?: string;
  links?: ProjectLink[];
  media?: ProjectMedia[];
  presentation?: ProjectPresentation;
  sections?: { heading: LocalizedString; body: LocalizedString }[];
  updatedAt?: string;
}

export interface AboutEntry {
  id: string;
  title: LocalizedString;
  content: LocalizedString;
  avatar: {
    text: string;
    imageUrl: string;
    path?: string;
  };
  order?: number;
}

export interface Skill {
  id?: string;
  name: string;
  iconKey: string;
  category: string | string[];
  order?: number;
  published: boolean;
}

export type TimelineType = 'work' | 'education' | 'certification' | 'achievement';

export interface TimelineEntry {
  id?: string;
  type: TimelineType;
  title: LocalizedString;
  company: LocalizedString;
  period: LocalizedString;
  description: LocalizedString;
  /** Optional structured dates (YYYY-MM); the period text is parsed when absent. */
  startDate?: string;
  /** Optional confirmed day; month-only records remain compatible. */
  startDateExact?: string;
  endDate?: string;
  current?: boolean;
  url?: string;
  order?: number;
  published: boolean;
}

export interface CVFile {
  language?: 'en' | 'tr';
  id: string;
  name: string;
  dataUrl: string;
  path?: string;
}

export interface ContactInfo {
  email: string;
  location: LocalizedString;
  social: {
    github: string;
    instagram: string;
    linkedin: string;
    upwork: string;
  };
}

export interface HomeHero {
  title: LocalizedString;
  description: LocalizedString;
  moreLabel: LocalizedString;
  icon: {
    mode: 'material' | 'image';
    materialIcon: string;
    imageUrl: string;
  };
}

export interface Availability {
  status: 'available' | 'not-available' | 'working' | 'open-to-offers';
  customLabel: LocalizedString;
}

export interface FieldPhoto {
  url: string;
  path?: string;
  alt: LocalizedString;
  caption?: LocalizedString;
  note?: LocalizedString;
}

export interface EngineeringPillar {
  id: string;
  title: LocalizedString;
  body: LocalizedString;
  /** Technologies listed under the pillar, in display order. */
  tech?: string[];
}

export interface Profile {
  fullName?: string;
  shortName?: string;
  role?: LocalizedString;
  fieldPhoto?: FieldPhoto;
  pillars?: EngineeringPillar[];
}

export interface DisplaySettings {
  /** Selected projects pinned on the home page (0–6). */
  featuredCount?: number;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  createdAt?: number;
  read: boolean;
  important?: boolean;
}

export interface SiteData {
  projects: Project[];
  aboutEntries: AboutEntry[];
  activeAboutId: string;
  skills: Skill[];
  timeline: TimelineEntry[];
  cvFiles: CVFile[];
  activeCvId: string;
  contactInfo: ContactInfo;
  homeHero: HomeHero;
  availability: Availability;
  profile?: Profile;
  display?: DisplaySettings;
}

export type Language = 'en' | 'tr';
export type Theme = 'dark' | 'light';
