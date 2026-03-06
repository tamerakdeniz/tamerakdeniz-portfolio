'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, selectAboutEntries } from '@/store';
import { saveSiteData } from '@/lib/firebase';
import { showToast } from '@/components/ui/Toast';
import type { AboutEntry } from '@/types';

export function AdminAboutSection() {
  const { t } = useTranslation();
  const siteData = useAppStore((s) => s.siteData);
  const entries = useAppStore(selectAboutEntries);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<AboutEntry | null>(null);

  const save = useCallback(
    async (newEntries: AboutEntry[], activeId?: string) => {
      if (!siteData) return;
      const updated = { ...siteData, aboutEntries: newEntries, activeAboutId: activeId || siteData.activeAboutId };
      try {
        await saveSiteData(updated);
        showToast(t('admin-saved'), 'success');
      } catch {
        showToast('Save failed', 'error');
      }
    },
    [siteData, t]
  );

  const startEdit = (entry: AboutEntry) => {
    setForm({ ...entry });
    setEditing(entry.id);
  };

  const handleSave = () => {
    if (!form) return;
    const existing = entries.find((e) => e.id === form.id);
    const newEntries = existing
      ? entries.map((e) => (e.id === form.id ? form : e))
      : [...entries, form];
    save(newEntries);
    setEditing(null);
    setForm(null);
  };

  const setActive = (id: string) => {
    save(entries, id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('admin-nav-about')}</h2>
        <button
          onClick={() => {
            const newEntry: AboutEntry = {
              id: Date.now().toString(),
              title: { en: '', tr: '' },
              content: { en: '', tr: '' },
              avatar: { text: 'TA', imageUrl: '' },
              order: entries.length,
            };
            setForm(newEntry);
            setEditing(newEntry.id);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {t('admin-add')}
        </button>
      </div>

      {editing && form && (
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title (EN)</label>
              <input
                value={form.title.en}
                onChange={(e) => setForm({ ...form, title: { ...form.title, en: e.target.value } })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title (TR)</label>
              <input
                value={form.title.tr}
                onChange={(e) => setForm({ ...form, title: { ...form.title, tr: e.target.value } })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Content (EN)</label>
              <textarea rows={6} value={form.content.en} onChange={(e) => setForm({ ...form, content: { ...form.content, en: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content (TR)</label>
              <textarea rows={6} value={form.content.tr} onChange={(e) => setForm({ ...form, content: { ...form.content, tr: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm resize-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Avatar Text</label>
              <input value={form.avatar.text} onChange={(e) => setForm({ ...form, avatar: { ...form.avatar, text: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Avatar Image URL</label>
              <input value={form.avatar.imageUrl} onChange={(e) => setForm({ ...form, avatar: { ...form.avatar, imageUrl: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setEditing(null); setForm(null); }} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-800">{t('admin-cancel')}</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-blue-700">{t('admin-save')}</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-slate-800 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{entry.title.en || entry.title.tr}</h3>
              <p className="text-sm text-slate-500 truncate">{entry.content.en?.slice(0, 80)}...</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setActive(entry.id)} className={`p-2 rounded-lg transition-colors ${siteData?.activeAboutId === entry.id ? 'text-green-500' : 'hover:bg-gray-100 dark:hover:bg-slate-800'}`}>
                <span className="material-symbols-outlined text-sm">{siteData?.activeAboutId === entry.id ? 'check_circle' : 'radio_button_unchecked'}</span>
              </button>
              <button onClick={() => startEdit(entry)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
