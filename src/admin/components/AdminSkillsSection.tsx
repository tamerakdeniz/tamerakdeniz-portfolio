'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, selectSkills } from '@/store';
import { saveSiteData } from '@/lib/firebase';
import { showToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Skill } from '@/types';

export function AdminSkillsSection() {
  const { t } = useTranslation();
  const siteData = useAppStore((s) => s.siteData);
  const skills = useAppStore(selectSkills);
  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [form, setForm] = useState<Skill>({ name: '', iconKey: '', category: 'frontend', published: true });

  const save = useCallback(async (newSkills: Skill[]) => {
    if (!siteData) return;
    try { await saveSiteData({ ...siteData, skills: newSkills }); showToast(t('admin-saved'), 'success'); } catch { showToast('Save failed', 'error'); }
  }, [siteData, t]);

  const handleSave = () => {
    let newSkills: Skill[];
    if (editing !== null) {
      newSkills = skills.map((s, i) => (i === editing ? { ...form, order: s.order } : s));
    } else {
      newSkills = [...skills, { ...form, order: skills.length }];
    }
    save(newSkills);
    setEditing(null);
    setAdding(false);
  };

  const handleDelete = () => {
    if (deleteIdx === null) return;
    save(skills.filter((_, i) => i !== deleteIdx));
    setDeleteIdx(null);
  };

  const sorted = [...skills].map((s, i) => ({ ...s, _idx: i })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('admin-nav-skills')}</h2>
        <button onClick={() => { setForm({ name: '', iconKey: '', category: 'frontend', published: true }); setAdding(true); }} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700">
          <span className="material-symbols-outlined text-sm">add</span>{t('admin-add')}
        </button>
      </div>

      {(adding || editing !== null) && (
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-medium mb-1">Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Icon Key</label><input value={form.iconKey} onChange={(e) => setForm({ ...form, iconKey: e.target.value })} placeholder="e.g. react, python, material" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
            <div><label className="block text-sm font-medium mb-1">Category</label>
              <select value={Array.isArray(form.category) ? form.category[0] : form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm">
                {['frontend','backend','mobile','database','devops','ai','tools','other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded" />Published</label>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setEditing(null); setAdding(false); }} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-800">{t('admin-cancel')}</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-blue-700">{t('admin-save')}</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {sorted.map((skill) => (
          <div key={skill._idx} className="bg-white dark:bg-surface-dark rounded-xl p-3 border border-gray-200 dark:border-slate-800 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <span className="font-medium text-sm">{skill.name}</span>
              <span className="text-xs text-slate-500 ml-2">({typeof skill.category === 'string' ? skill.category : skill.category.join(', ')})</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => { const s = skills[skill._idx]; setForm({ ...s }); setEditing(skill._idx); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"><span className="material-symbols-outlined text-sm">edit</span></button>
              <button onClick={() => setDeleteIdx(skill._idx)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog isOpen={deleteIdx !== null} title={t('admin-delete')} message={t('admin-confirm-delete')} onConfirm={handleDelete} onCancel={() => setDeleteIdx(null)} />
    </div>
  );
}
