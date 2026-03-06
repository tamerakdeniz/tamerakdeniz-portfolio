'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store';
import { logoutAdmin, logActivity } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { AdminDashboardSection } from './AdminDashboardSection';
import { AdminHomeSection } from './AdminHomeSection';
import { AdminProjectsSection } from './AdminProjectsSection';
import { AdminAboutSection } from './AdminAboutSection';
import { AdminSkillsSection } from './AdminSkillsSection';
import { AdminTimelineSection } from './AdminTimelineSection';
import { AdminCVSection } from './AdminCVSection';
import { AdminContactSection } from './AdminContactSection';
import { AdminSettingsSection } from './AdminSettingsSection';

const sections: Record<string, React.ComponentType> = {
  dashboard: AdminDashboardSection,
  home: AdminHomeSection,
  projects: AdminProjectsSection,
  about: AdminAboutSection,
  skills: AdminSkillsSection,
  timeline: AdminTimelineSection,
  cv: AdminCVSection,
  contact: AdminContactSection,
  settings: AdminSettingsSection,
};

export function AdminDashboard() {
  const { t } = useTranslation();
  const [currentSection, setCurrentSection] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const language = useAppStore((s) => s.language);
  const toggleLanguage = useAppStore((s) => s.toggleLanguage);
  const router = useRouter();

  const handleLogout = async () => {
    await logActivity('logout', 'Admin logged out');
    await logoutAdmin();
    router.push('/');
  };

  const ActiveSection = sections[currentSection] || AdminDashboardSection;

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminSidebar
              currentSection={currentSection}
              onSectionChange={(s) => {
                setCurrentSection(s);
                setMobileMenuOpen(false);
              }}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-16 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-surface-dark flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden flex items-center justify-center size-10 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="text-lg font-bold capitalize">
              {t(`admin-nav-${currentSection}`)}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-center h-10 px-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-sm font-bold"
              title={language === 'en' ? 'Türkçe\'ye geç' : 'Switch to English'}
            >
              {language === 'en' ? 'TR' : 'EN'}
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center size-10 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <a
              href="/"
              target="_blank"
              className="flex items-center justify-center size-10 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title={t('admin-view-site')}
            >
              <span className="material-symbols-outlined">open_in_new</span>
            </a>
          </div>
        </div>

        {/* Section Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <ActiveSection />
        </div>
      </div>
    </div>
  );
}
