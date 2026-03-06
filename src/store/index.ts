import { create } from 'zustand';
import type {
  SiteData,
  Theme,
  Language,
  ContactInfo,
  HomeHero,
  Availability,
} from '@/types';

interface AppState {
  theme: Theme;
  language: Language;
  siteData: SiteData | null;
  siteDataLoaded: boolean;
  isFirebaseConnected: boolean;
  authUser: { email: string } | null;
  contactModalOpen: boolean;
  cvModalOpen: boolean;

  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  setSiteData: (data: SiteData) => void;
  setSiteDataLoaded: (loaded: boolean) => void;
  setFirebaseConnected: (connected: boolean) => void;
  setAuthUser: (user: { email: string } | null) => void;
  setContactModalOpen: (open: boolean) => void;
  setCvModalOpen: (open: boolean) => void;
}

const defaultContactInfo: ContactInfo = {
  email: 'info@tamerakdeniz.com',
  location: { en: 'Istanbul, TR', tr: 'İstanbul, TR' },
  social: {
    github: 'https://github.com/tamerakdeniz',
    instagram: 'https://www.instagram.com/tamerakdnz/',
    linkedin: 'https://www.linkedin.com/in/tamerakdeniz/',
    upwork: 'https://www.upwork.com/freelancers/tamerakdeniz',
  },
};

const defaultHomeHero: HomeHero = {
  title: { en: 'I Build with AI.', tr: 'AI ile İnşa Ediyorum.' },
  description: {
    en: 'From concept to deployment — AI-powered products, full-stack solutions, and intelligent systems. End to end.',
    tr: 'Fikirden ürüne — yapay zeka destekli uygulamalar, full-stack çözümler ve akıllı sistemler. Uçtan uca.',
  },
  moreLabel: { en: 'More About', tr: 'Daha Fazla' },
  icon: { mode: 'material', materialIcon: 'code', imageUrl: '' },
};

const defaultAvailability: Availability = {
  status: 'available',
  customLabel: { en: '', tr: '' },
};

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return (localStorage.getItem('portfolio_theme') as Theme) || 'dark';
}

function getInitialLanguage(): Language {
  return 'en';
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: getInitialTheme(),
  language: getInitialLanguage(),
  siteData: null,
  siteDataLoaded: false,
  isFirebaseConnected: false,
  authUser: null,
  contactModalOpen: false,
  cvModalOpen: false,

  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_theme', theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    set({ theme });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(newTheme);
  },

  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio_language', lang);
      document.documentElement.lang = lang;
    }
    set({ language: lang });
  },

  toggleLanguage: () => {
    const newLang = get().language === 'en' ? 'tr' : 'en';
    get().setLanguage(newLang);
  },

  setSiteData: (data) => set({ siteData: data, siteDataLoaded: true }),
  setSiteDataLoaded: (loaded) => set({ siteDataLoaded: loaded }),
  setFirebaseConnected: (connected) => set({ isFirebaseConnected: connected }),
  setAuthUser: (user) => set({ authUser: user }),
  setContactModalOpen: (open) => set({ contactModalOpen: open }),
  setCvModalOpen: (open) => set({ cvModalOpen: open }),
}));

// Stable selector hooks that return the same reference when data hasn't changed
const emptyProjects: never[] = [];
const emptySkills: never[] = [];
const emptyTimeline: never[] = [];
const emptyAboutEntries: never[] = [];
const emptyCvFiles: never[] = [];

export const selectProjects = (s: AppState) => s.siteData?.projects ?? emptyProjects;
export const selectSkills = (s: AppState) => s.siteData?.skills ?? emptySkills;
export const selectTimeline = (s: AppState) => s.siteData?.timeline ?? emptyTimeline;
export const selectAboutEntries = (s: AppState) => s.siteData?.aboutEntries ?? emptyAboutEntries;
export const selectContactInfo = (s: AppState) => s.siteData?.contactInfo ?? defaultContactInfo;
export const selectHomeHero = (s: AppState) => s.siteData?.homeHero ?? defaultHomeHero;
export const selectAvailability = (s: AppState) => s.siteData?.availability ?? defaultAvailability;
export const selectCvFiles = (s: AppState) => s.siteData?.cvFiles ?? emptyCvFiles;
