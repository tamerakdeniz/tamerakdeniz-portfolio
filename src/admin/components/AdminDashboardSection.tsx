'use client';

import { useTranslation } from 'react-i18next';
import { useAppStore, selectProjects, selectSkills, selectTimeline } from '@/store';

export function AdminDashboardSection() {
  const { t } = useTranslation();
  const projects = useAppStore(selectProjects);
  const skills = useAppStore(selectSkills);
  const timeline = useAppStore(selectTimeline);
  const isFirebaseConnected = useAppStore((s) => s.isFirebaseConnected);

  const stats = [
    {
      label: t('admin-projects-count'),
      value: projects.length,
      icon: 'folder',
      color: 'bg-blue-500/10 text-blue-500',
    },
    {
      label: t('admin-skills-count'),
      value: skills.length,
      icon: 'star',
      color: 'bg-amber-500/10 text-amber-500',
    },
    {
      label: t('admin-timeline-count'),
      value: timeline.length,
      icon: 'timeline',
      color: 'bg-green-500/10 text-green-500',
    },
    {
      label: t('admin-contacts-count'),
      value: '-',
      icon: 'mail',
      color: 'bg-purple-500/10 text-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Firebase Status */}
      <div
        className={`flex items-center gap-3 p-4 rounded-xl border ${
          isFirebaseConnected
            ? 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20'
            : 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'
        }`}
      >
        <span
          className={`material-symbols-outlined ${
            isFirebaseConnected ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {isFirebaseConnected ? 'cloud_done' : 'cloud_off'}
        </span>
        <span className="text-sm font-medium">
          Firebase:{' '}
          {isFirebaseConnected ? 'Connected & Syncing' : 'Offline'}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {stat.icon}
                </span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
