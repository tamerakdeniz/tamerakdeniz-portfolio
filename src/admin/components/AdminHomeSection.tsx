'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSaveContent } from '@/admin/lib/save-content';
import { useAppStore, selectHomeHero, selectAvailability } from '@/store';
import type { HomeHero, Availability } from '@/types';
import { LocField } from './form/fields';

export function AdminHomeSection() {
  const { t } = useTranslation();
  const saveContent = useSaveContent();
  const heroSettings = useAppStore(selectHomeHero);
  const availability = useAppStore(selectAvailability);
  const siteData = useAppStore((s) => s.siteData);
  const [saving, setSaving] = useState(false);

  const [hero, setHero] = useState<HomeHero>(heroSettings);
  const [avail, setAvail] = useState<Availability>(availability);

  const handleSave = useCallback(async () => {
    const siteData = useAppStore.getState().siteData;
    if (!siteData) return;
    setSaving(true);
    await saveContent({ ...siteData, homeHero: hero, availability: avail });
    setSaving(false);
  }, [hero, avail, saveContent]);

  const statusOptions: Availability['status'][] = ['available', 'not-available', 'working', 'open-to-offers'];

  const hasChanges =
    JSON.stringify(hero) !== JSON.stringify(heroSettings) || JSON.stringify(avail) !== JSON.stringify(availability);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('admin-nav-home')}</h2>
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all disabled:opacity-40"
        >
          {saving && (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          )}
          <span className="material-symbols-outlined text-sm">save</span>
          {t('admin-save')}
        </button>
      </div>

      {!siteData && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20">
          <span className="material-symbols-outlined text-amber-500">warning</span>
          <span className="text-sm text-amber-700 dark:text-amber-400">
            {t('admin-firebase-not-connected-warning')}
          </span>
        </div>
      )}

      {/* Hero Title */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800 space-y-5">
        <h3 className="font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">title</span>
          {t('admin-hero-title')}
        </h3>
        <p className="text-xs text-slate-500 -mt-3">
          {t('admin-hero-title-hint')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="admin-hero-title-english" className="block text-sm font-medium mb-1">{t('admin-label-english')}</label>
          <input id="admin-hero-title-english"
              type="text"
              value={hero.title.en}
              onChange={(e) => setHero({ ...hero, title: { ...hero.title, en: e.target.value } })}
              placeholder={t('admin-placeholder-hero-title-en')}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
          </div>
          <div>
            <label htmlFor="admin-hero-title-turkish" className="block text-sm font-medium mb-1">{t('admin-label-turkish')}</label>
          <input id="admin-hero-title-turkish"
              type="text"
              value={hero.title.tr}
              onChange={(e) => setHero({ ...hero, title: { ...hero.title, tr: e.target.value } })}
              placeholder={t('admin-placeholder-hero-title-tr')}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Hero Description */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800 space-y-5">
        <h3 className="font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">description</span>
          {t('admin-hero-description')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="admin-hero-description-english" className="block text-sm font-medium mb-1">{t('admin-label-english')}</label>
          <textarea id="admin-hero-description-english"
              value={hero.description.en}
              onChange={(e) => setHero({ ...hero, description: { ...hero.description, en: e.target.value } })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm resize-none"
            />
          </div>
          <div>
            <label htmlFor="admin-hero-description-turkish" className="block text-sm font-medium mb-1">{t('admin-label-turkish')}</label>
          <textarea id="admin-hero-description-turkish"
              value={hero.description.tr}
              onChange={(e) => setHero({ ...hero, description: { ...hero.description, tr: e.target.value } })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm resize-none"
            />
          </div>
        </div>
      </div>

      {/* "More About" Link Label */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800 space-y-5">
        <h3 className="font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">link</span>
          {t('admin-more-about-label')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="admin-hero-more-english" className="block text-sm font-medium mb-1">{t('admin-label-english')}</label>
          <input id="admin-hero-more-english"
              type="text"
              value={hero.moreLabel.en}
              onChange={(e) => setHero({ ...hero, moreLabel: { ...hero.moreLabel, en: e.target.value } })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
          </div>
          <div>
            <label htmlFor="admin-hero-more-turkish" className="block text-sm font-medium mb-1">{t('admin-label-turkish')}</label>
          <input id="admin-hero-more-turkish"
              type="text"
              value={hero.moreLabel.tr}
              onChange={(e) => setHero({ ...hero, moreLabel: { ...hero.moreLabel, tr: e.target.value } })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Availability Status */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800 space-y-5">
        <h3 className="font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">work</span>
          {t('admin-availability-status')}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setAvail({ ...avail, status })}
              className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                avail.status === status
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white dark:bg-background-dark border-gray-300 dark:border-slate-700 hover:border-primary/30'
              }`}
            >
              {t(`admin-status-${status}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <LocField label={t('admin-availability-label')} value={avail.customLabel} onChange={(customLabel) => setAvail({ ...avail, customLabel })} maxLength={120} />

      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800 space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">visibility</span>
          {t('admin-preview')}
        </h3>
        <div className="p-6 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-slate-800">
          <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-semibold mb-3">
            {t(`admin-status-${avail.status}`)}
          </p>
          <h1 className="text-3xl font-black tracking-tighter leading-[1.1] mb-2">
            <span className="block">{hero.title.en?.split(/\s+/).slice(0, Math.ceil((hero.title.en?.split(/\s+/).length || 1) / 2)).join(' ') || t('admin-preview-fallback-title-1')}</span>
            <span className="block text-primary">{hero.title.en?.split(/\s+/).slice(Math.ceil((hero.title.en?.split(/\s+/).length || 1) / 2)).join(' ') || t('admin-preview-fallback-title-2')}</span>
          </h1>
          <p className="text-sm text-slate-500">{hero.description.en || t('admin-preview-fallback-desc')}</p>
        </div>
      </div>
    </div>
  );
}
