'use client';

import { useTranslation } from 'react-i18next';

const navItems = [
  { key: 'dashboard', icon: 'dashboard' },
  { key: 'home', icon: 'home' },
  { key: 'projects', icon: 'folder' },
  { key: 'about', icon: 'person' },
  { key: 'skills', icon: 'star' },
  { key: 'timeline', icon: 'timeline' },
  { key: 'cv', icon: 'description' },
  { key: 'contact', icon: 'mail' },
  { key: 'settings', icon: 'settings' },
];

interface AdminSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
}

export function AdminSidebar({
  currentSection,
  onSectionChange,
  onLogout,
}: AdminSidebarProps) {
  const { t } = useTranslation();

  return (
    <aside className="w-64 h-full flex flex-col border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-surface-dark">
      <div className="flex items-center gap-3 p-6 border-b border-gray-200 dark:border-slate-800">
        <div className="size-8 text-primary flex items-center justify-center bg-primary/10 rounded-lg">
          <span className="material-symbols-outlined text-[24px]">
            admin_panel_settings
          </span>
        </div>
        <h2 className="text-lg font-bold">{t('admin-title')}</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => onSectionChange(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              currentSection === item.key
                ? 'bg-primary text-white'
                : 'text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{t(`admin-nav-${item.key}`)}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-slate-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium transition-all"
        >
          <span className="material-symbols-outlined">logout</span>
          <span>{t('admin-logout')}</span>
        </button>
      </div>
    </aside>
  );
}
