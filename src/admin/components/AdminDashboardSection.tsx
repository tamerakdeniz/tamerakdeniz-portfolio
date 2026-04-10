'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, selectProjects, selectSkills, selectTimeline } from '@/store';
import { getFirebaseDatabase, getActivityLog, type ActivityEntry } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export function AdminDashboardSection() {
  const { t } = useTranslation();
  const projects = useAppStore(selectProjects);
  const skills = useAppStore(selectSkills);
  const timeline = useAppStore(selectTimeline);
  const isFirebaseConnected = useAppStore((s) => s.isFirebaseConnected);
  const [contactCount, setContactCount] = useState(0);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    setActivityLog(getActivityLog());
  }, []);

  useEffect(() => {
    try {
      const db = getFirebaseDatabase();
      const subRef = ref(db, 'contactSubmissions');
      const unsub = onValue(subRef, (snap) => {
        const val = snap.val();
        setContactCount(val ? Object.keys(val).length : 0);
      });
      return () => unsub();
    } catch { /* offline */ }
  }, []);

  useEffect(() => {
    try {
      const db = getFirebaseDatabase();
      const logRef = ref(db, 'activityLog');
      const unsub = onValue(logRef, (snap) => {
        const val = snap.val();
        if (val) {
          const remote = Object.values(val) as ActivityEntry[];
          const local = getActivityLog();
          const merged = new Map<string, ActivityEntry>();
          [...local, ...remote].forEach((e) => merged.set(e.id, e));
          const all = Array.from(merged.values())
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 50);
          setActivityLog(all);
        }
      });
      return () => unsub();
    } catch { /* offline - local data already loaded */ }
  }, []);

  const stats = [
    { label: t('admin-projects-count'), value: projects.length, icon: 'folder', color: 'bg-blue-500/10 text-blue-500' },
    { label: t('admin-skills-count'), value: skills.length, icon: 'star', color: 'bg-amber-500/10 text-amber-500' },
    { label: t('admin-timeline-count'), value: timeline.length, icon: 'timeline', color: 'bg-green-500/10 text-green-500' },
    { label: t('admin-contacts-count'), value: contactCount, icon: 'mail', color: 'bg-purple-500/10 text-purple-500' },
  ];

  const iconMap: Record<string, string> = {
    login: 'login', logout: 'logout', add: 'add_circle', edit: 'edit',
    delete: 'delete', contact: 'mail', reorder: 'swap_vert', info: 'info',
  };

  const colorMap: Record<string, string> = {
    login: 'text-green-500', logout: 'text-slate-400', add: 'text-blue-500', edit: 'text-amber-500',
    delete: 'text-red-500', contact: 'text-purple-500', reorder: 'text-cyan-500', info: 'text-slate-500',
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return t('admin-log-just-now');
    if (mins < 60) return `${mins}${t('admin-log-min-ago')}`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}${t('admin-log-hour-ago')}`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}${t('admin-log-day-ago')}`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className={`flex items-center gap-3 p-4 rounded-xl border ${
        isFirebaseConnected
          ? 'bg-green-50 dark:bg-green-500/5 border-green-200 dark:border-green-500/20'
          : 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'
      }`}>
        <span className={`material-symbols-outlined ${isFirebaseConnected ? 'text-green-500' : 'text-red-500'}`}>
          {isFirebaseConnected ? 'cloud_done' : 'cloud_off'}
        </span>
        <span className="text-sm font-medium">
          Firebase: {isFirebaseConnected ? t('admin-firebase-connected') : t('admin-firebase-offline')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-surface-dark rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 p-5 border-b border-gray-200 dark:border-slate-800">
          <span className="material-symbols-outlined text-primary">history</span>
          <h3 className="font-bold">{t('admin-activity-log')}</h3>
          <span className="ml-auto text-xs text-slate-400 font-mono">{activityLog.length} {t('admin-log-entries')}</span>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {activityLog.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {activityLog.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className={`mt-0.5 shrink-0 ${colorMap[entry.type] || 'text-slate-400'}`}>
                    <span className="material-symbols-outlined text-[18px]">{iconMap[entry.type] || 'info'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{entry.message}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-slate-600 font-mono shrink-0 mt-0.5">
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-3">event_note</span>
              <p className="text-sm">{t('admin-log-empty')}</p>
              <p className="text-xs text-slate-400/60 mt-1">{t('admin-log-empty-hint')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
