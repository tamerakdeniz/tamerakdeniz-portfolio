'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, selectTimeline } from '@/store';
import { saveSiteData } from '@/lib/firebase';
import { showToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { TimelineEntry } from '@/types';

export function AdminTimelineSection() {
  const { t } = useTranslation();
  const siteData = useAppStore((s) => s.siteData);
  const timeline = useAppStore(selectTimeline);
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [form, setForm] = useState<TimelineEntry>({
    type: 'work', title: { en: '', tr: '' }, company: { en: '', tr: '' },
    period: { en: '', tr: '' }, description: { en: '', tr: '' }, published: true,
  });

  const save = useCallback(async (items: TimelineEntry[]) => {
    if (!siteData) return;
    try { await saveSiteData({ ...siteData, timeline: items }); showToast(t('admin-saved'), 'success'); } catch { showToast('Save failed', 'error'); }
  }, [siteData, t]);

  const handleSave = () => {
    let items: TimelineEntry[];
    if (editing !== null) {
      items = timeline.map((item, i) => (i === editing ? { ...form, order: item.order } : item));
    } else {
      items = [...timeline, { ...form, order: timeline.length }];
    }
    save(items);
    setEditing(null);
    setAdding(false);
  };

  const sorted = [...timeline].map((item, i) => ({ ...item, _idx: i })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const formFields = (
    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-medium mb-1">Type</label>
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TimelineEntry['type'] })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm">
            <option value="work">Work</option><option value="education">Education</option><option value="certification">Certification</option>
          </select>
        </div>
        <div><label className="block text-sm font-medium mb-1">Title (EN)</label><input value={form.title.en} onChange={(e) => setForm({ ...form, title: { ...form.title, en: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
        <div><label className="block text-sm font-medium mb-1">Title (TR)</label><input value={form.title.tr} onChange={(e) => setForm({ ...form, title: { ...form.title, tr: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Company (EN)</label><input value={form.company.en} onChange={(e) => setForm({ ...form, company: { ...form.company, en: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
        <div><label className="block text-sm font-medium mb-1">Company (TR)</label><input value={form.company.tr} onChange={(e) => setForm({ ...form, company: { ...form.company, tr: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Period (EN)</label><input value={form.period.en} onChange={(e) => setForm({ ...form, period: { ...form.period, en: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
        <div><label className="block text-sm font-medium mb-1">Period (TR)</label><input value={form.period.tr} onChange={(e) => setForm({ ...form, period: { ...form.period, tr: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-medium mb-1">Description (EN)</label><textarea rows={3} value={form.description.en} onChange={(e) => setForm({ ...form, description: { ...form.description, en: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm resize-none" /></div>
        <div><label className="block text-sm font-medium mb-1">Description (TR)</label><textarea rows={3} value={form.description.tr} onChange={(e) => setForm({ ...form, description: { ...form.description, tr: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm resize-none" /></div>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={() => { setEditing(null); setAdding(false); }} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-800">{t('admin-cancel')}</button>
        <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-blue-700">{t('admin-save')}</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('admin-nav-timeline')}</h2>
        <button onClick={() => { setForm({ type: 'work', title: { en: '', tr: '' }, company: { en: '', tr: '' }, period: { en: '', tr: '' }, description: { en: '', tr: '' }, published: true }); setAdding(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700">
          <span className="material-symbols-outlined text-sm">add</span>{t('admin-add')}
        </button>
      </div>

      {(adding || editing !== null) && formFields}

      <div className="space-y-2">
        {sorted.map((item) => (
          <div key={item._idx} className="bg-white dark:bg-surface-dark rounded-xl p-3 border border-gray-200 dark:border-slate-800 flex items-center gap-3">
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.type === 'work' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : item.type === 'education' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}`}>{item.type}</span>
            <div className="flex-1 min-w-0"><span className="font-medium text-sm truncate block">{item.title.en || item.title.tr}</span><span className="text-xs text-slate-500">{item.company.en}</span></div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => { setForm({ ...timeline[item._idx] }); setEditing(item._idx); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"><span className="material-symbols-outlined text-sm">edit</span></button>
              <button onClick={() => setDeleteIdx(item._idx)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
            </div>
          </div>
        ))}
      </div>
      <ConfirmDialog isOpen={deleteIdx !== null} title={t('admin-delete')} message={t('admin-confirm-delete')} onConfirm={() => { if (deleteIdx !== null) { save(timeline.filter((_, i) => i !== deleteIdx)); setDeleteIdx(null); } }} onCancel={() => setDeleteIdx(null)} />
    </div>
  );
}
