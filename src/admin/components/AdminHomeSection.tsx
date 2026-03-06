'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, selectHomeHero, selectAvailability } from '@/store';
import { saveFirebaseData } from '@/lib/firebase';
import { showToast } from '@/components/ui/Toast';
import type { HomeHero, Availability } from '@/types';

export function AdminHomeSection() {
  const { t } = useTranslation();
  const heroSettings = useAppStore(selectHomeHero);
  const availability = useAppStore(selectAvailability);
  const siteData = useAppStore((s) => s.siteData);
  const [saving, setSaving] = useState(false);

  const [hero, setHero] = useState<HomeHero>({
    title: { en: '', tr: '' },
    description: { en: '', tr: '' },
    moreLabel: { en: '', tr: '' },
    icon: { mode: 'material', materialIcon: 'code', imageUrl: '' },
  });

  const [avail, setAvail] = useState<Availability>({
    status: 'available',
    customLabel: { en: '', tr: '' },
  });

  useEffect(() => {
    if (heroSettings) {
      setHero({
        title: { en: heroSettings.title?.en || '', tr: heroSettings.title?.tr || '' },
        description: { en: heroSettings.description?.en || '', tr: heroSettings.description?.tr || '' },
        moreLabel: { en: heroSettings.moreLabel?.en || '', tr: heroSettings.moreLabel?.tr || '' },
        icon: heroSettings.icon || { mode: 'material', materialIcon: 'code', imageUrl: '' },
      });
    }
  }, [heroSettings]);

  useEffect(() => {
    if (availability) {
      setAvail({
        status: availability.status || 'available',
        customLabel: { en: availability.customLabel?.en || '', tr: availability.customLabel?.tr || '' },
      });
    }
  }, [availability]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await saveFirebaseData('siteData/homeHero', hero);
      await saveFirebaseData('siteData/availability', avail);
      showToast(t('admin-saved'), 'success');
    } catch {
      showToast('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  }, [hero, avail, t]);

  const statusOptions: Availability['status'][] = ['available', 'not-available', 'working', 'open-to-offers'];
  const statusLabels: Record<string, { en: string; tr: string }> = {
    'available': { en: 'Available / Open to Work', tr: 'Çalışmaya Açık' },
    'not-available': { en: 'Not Available', tr: 'Müsait Değil' },
    'working': { en: 'Currently Working', tr: 'Şu Anda Çalışıyor' },
    'open-to-offers': { en: 'Open to Offers', tr: 'Tekliflere Açık' },
  };

  const hasChanges =
    JSON.stringify(hero) !== JSON.stringify(heroSettings) ||
    JSON.stringify(avail) !== JSON.stringify(availability);

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
            Firebase is not connected. Changes will not persist until Firebase is synced.
          </span>
        </div>
      )}

      {/* Hero Title */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800 space-y-5">
        <h3 className="font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">title</span>
          Hero Title
        </h3>
        <p className="text-xs text-slate-500 -mt-3">
          The title is split into two lines automatically. Use short, impactful text.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">English</label>
            <input
              type="text"
              value={hero.title.en}
              onChange={(e) => setHero({ ...hero, title: { ...hero.title, en: e.target.value } })}
              placeholder="e.g. I Build with AI."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Türkçe</label>
            <input
              type="text"
              value={hero.title.tr}
              onChange={(e) => setHero({ ...hero, title: { ...hero.title, tr: e.target.value } })}
              placeholder="örn. AI ile İnşa Ediyorum."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Hero Description */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800 space-y-5">
        <h3 className="font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">description</span>
          Hero Description
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">English</label>
            <textarea
              value={hero.description.en}
              onChange={(e) => setHero({ ...hero, description: { ...hero.description, en: e.target.value } })}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Türkçe</label>
            <textarea
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
          &quot;More About&quot; Link Label
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">English</label>
            <input
              type="text"
              value={hero.moreLabel.en}
              onChange={(e) => setHero({ ...hero, moreLabel: { ...hero.moreLabel, en: e.target.value } })}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Türkçe</label>
            <input
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
          Availability Status
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
              {statusLabels[status]?.en || status}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800 space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">visibility</span>
          Preview
        </h3>
        <div className="p-6 rounded-xl bg-gray-50 dark:bg-background-dark border border-gray-200 dark:border-slate-800">
          <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-semibold mb-3">
            {statusLabels[avail.status]?.en || avail.status}
          </p>
          <h1 className="text-3xl font-black tracking-tighter leading-[1.1] mb-2">
            <span className="block">{hero.title.en?.split(/\s+/).slice(0, Math.ceil((hero.title.en?.split(/\s+/).length || 1) / 2)).join(' ') || 'Title Line 1'}</span>
            <span className="block text-primary">{hero.title.en?.split(/\s+/).slice(Math.ceil((hero.title.en?.split(/\s+/).length || 1) / 2)).join(' ') || 'Title Line 2'}</span>
          </h1>
          <p className="text-sm text-slate-500">{hero.description.en || 'Description...'}</p>
        </div>
      </div>
    </div>
  );
}
