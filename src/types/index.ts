export interface LocalizedString {
  en: string;
  tr: string;
}

export interface Project {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  category: string | string[];
  techStack: string[];
  githubUrl: string;
  demoUrl: string;
  image: string;
  order?: number;
  published: boolean;
}

export interface AboutEntry {
  id: string;
  title: LocalizedString;
  content: LocalizedString;
  avatar: {
    text: string;
    imageUrl: string;
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

export interface TimelineEntry {
  id?: string;
  type: 'work' | 'education' | 'certification';
  title: LocalizedString;
  company: LocalizedString;
  period: LocalizedString;
  description: LocalizedString;
  order?: number;
  published: boolean;
}

export interface CVFile {
  id: string;
  name: string;
  dataUrl: string;
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

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  read: boolean;
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
}

export type Language = 'en' | 'tr';
export type Theme = 'dark' | 'light';
