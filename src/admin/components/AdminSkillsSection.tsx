'use client';

import { useState, useCallback, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, selectSkills } from '@/store';
import { saveSiteData, logActivity } from '@/lib/firebase';
import { showToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Skill } from '@/types';

const CATEGORIES = ['frontend', 'backend', 'mobile', 'database', 'devops', 'ai', 'tools', 'other'] as const;

const CATEGORY_COLORS: Record<string, string> = {
  frontend: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  backend: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  mobile: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  database: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  devops: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  ai: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  tools: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  other: 'bg-gray-100 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300',
};

function categoryBadge(category: string | string[]) {
  const cats = Array.isArray(category) ? category : [category];
  return cats.map((c) => (
    <span key={c} className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide ${CATEGORY_COLORS[c] ?? CATEGORY_COLORS.other}`}>
      {c}
    </span>
  ));
}

function InlineEditForm({
  form,
  setForm,
  onSave,
  onCancel,
  saveLabel,
  cancelLabel,
}: {
  form: Skill;
  setForm: (s: Skill) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel: string;
  cancelLabel: string;
}) {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-surface-dark rounded-xl border-2 border-primary p-4 space-y-3 flex flex-col">
      <div>
        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{t('admin-label-name')}</label>
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{t('admin-label-icon-key')}</label>
        <input
          value={form.iconKey}
          onChange={(e) => setForm({ ...form, iconKey: e.target.value })}
          placeholder={t('admin-placeholder-icon-key')}
          className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm"
        />
      </div>
      <div className="col-span-full">
        <label className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{t('admin-label-categories')}</label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => {
            const cats = Array.isArray(form.category) ? form.category : [form.category];
            const selected = cats.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  const current = Array.isArray(form.category) ? form.category : [form.category];
                  const updated = selected
                    ? current.filter((v) => v !== c)
                    : [...current, c];
                  setForm({ ...form, category: updated.length > 0 ? updated : current });
                }}
                className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wide border transition-all ${
                  selected
                    ? 'bg-primary text-white border-primary'
                    : `border-gray-200 dark:border-slate-700 hover:border-primary/40 ${CATEGORY_COLORS[c] ?? CATEGORY_COLORS.other}`
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) => setForm({ ...form, published: e.target.checked })}
          className="rounded"
        />
        {t('admin-published')}
      </label>
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
          {cancelLabel}
        </button>
        <button onClick={onSave} className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-blue-700 transition-colors">
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

export function AdminSkillsSection() {
  const { t } = useTranslation();
  const siteData = useAppStore((s) => s.siteData);
  const skills = useAppStore(selectSkills);

  const [editing, setEditing] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [form, setForm] = useState<Skill>({ name: '', iconKey: '', category: ['frontend'], published: true });

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const save = useCallback(async (newSkills: Skill[]) => {
    if (!siteData) return;
    try {
      await saveSiteData({ ...siteData, skills: newSkills });
      showToast(t('admin-saved'), 'success');
    } catch {
      showToast(t('admin-save-failed'), 'error');
    }
  }, [siteData, t]);

  const sorted = [...skills]
    .map((s, i) => ({ ...s, _idx: i }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleSave = () => {
    if (!form.name.trim()) return;
    let newSkills: Skill[];
    if (editing !== null) {
      newSkills = skills.map((s, i) => (i === editing ? { ...form, order: s.order } : s));
      logActivity('edit', `Edited skill: ${form.name}`);
    } else {
      newSkills = [...skills, { ...form, order: skills.length }];
      logActivity('add', `Added skill: ${form.name}`);
    }
    save(newSkills);
    setEditing(null);
    setAdding(false);
  };

  const handleDelete = () => {
    if (deleteIdx === null) return;
    const deleted = skills[deleteIdx];
    save(skills.filter((_, i) => i !== deleteIdx));
    if (deleted) logActivity('delete', `Deleted skill: ${deleted.name}`);
    setDeleteIdx(null);
  };

  const handleTogglePublish = (sortedIndex: number) => {
    const skill = sorted[sortedIndex];
    const newSkills = skills.map((s, i) =>
      i === skill._idx ? { ...s, published: !s.published } : s
    );
    save(newSkills);
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, sortedIndex: number) => {
    setDraggedIdx(sortedIndex);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(sortedIndex));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, sortedIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIdx !== null && sortedIndex !== draggedIdx) {
      setDragOverIdx(sortedIndex);
    }
  };

  const handleDragLeave = () => {
    setDragOverIdx(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetSortedIndex: number) => {
    e.preventDefault();
    setDragOverIdx(null);

    if (draggedIdx === null || draggedIdx === targetSortedIndex) {
      setDraggedIdx(null);
      return;
    }

    const reordered = [...sorted];
    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetSortedIndex, 0, moved);

    const newSkills = skills.map((s) => ({ ...s }));
    reordered.forEach((item, newOrder) => {
      newSkills[item._idx] = { ...skills[item._idx], order: newOrder };
    });

    setDraggedIdx(null);
    save(newSkills);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const startEdit = (sortedIndex: number) => {
    const skill = sorted[sortedIndex];
    setForm({ ...skills[skill._idx] });
    setEditing(skill._idx);
    setAdding(false);
  };

  const startAdd = () => {
    setForm({ name: '', iconKey: '', category: ['frontend'], published: true });
    setAdding(true);
    setEditing(null);
  };

  const cancelForm = () => {
    setEditing(null);
    setAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('admin-nav-skills')}</h2>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {t('admin-add')}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {adding && (
          <InlineEditForm
            form={form}
            setForm={setForm}
            onSave={handleSave}
            onCancel={cancelForm}
            saveLabel={t('admin-save')}
            cancelLabel={t('admin-cancel')}
          />
        )}

        {sorted.map((skill, sortedIndex) => {
          const isEditing = editing === skill._idx;
          const isDragged = draggedIdx === sortedIndex;
          const isDragOver = dragOverIdx === sortedIndex;

          if (isEditing) {
            return (
              <InlineEditForm
                key={skill._idx}
                form={form}
                setForm={setForm}
                onSave={handleSave}
                onCancel={cancelForm}
                saveLabel={t('admin-save')}
                cancelLabel={t('admin-cancel')}
              />
            );
          }

          return (
            <div
              key={skill._idx}
              draggable
              onDragStart={(e) => handleDragStart(e, sortedIndex)}
              onDragOver={(e) => handleDragOver(e, sortedIndex)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, sortedIndex)}
              onDragEnd={handleDragEnd}
              className={`
                group relative bg-white dark:bg-surface-dark rounded-xl border p-4
                transition-all duration-150
                ${isDragged ? 'opacity-50 scale-95' : ''}
                ${isDragOver ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 dark:border-slate-800'}
                ${!skill.published ? 'opacity-60' : ''}
              `}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-gray-500"
                  title={t('admin-drag-to-reorder')}
                >
                  <span className="material-symbols-outlined text-base">drag_indicator</span>
                </div>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleTogglePublish(sortedIndex)}
                    className={`p-1 rounded-lg transition-colors ${skill.published ? 'hover:bg-gray-100 dark:hover:bg-slate-800 text-green-500' : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400'}`}
                    title={skill.published ? t('admin-unpublish') : t('admin-publish')}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {skill.published ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                  <button
                    onClick={() => startEdit(sortedIndex)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteIdx(skill._idx)}
                    className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>

              <p className="font-semibold text-sm mb-2 truncate" title={skill.name}>
                {skill.name}
              </p>

              <div className="flex flex-wrap gap-1">
                {categoryBadge(skill.category)}
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && !adding && (
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">
          {t('admin-no-skills-hint', { add: t('admin-add') })}
        </p>
      )}

      <ConfirmDialog
        isOpen={deleteIdx !== null}
        title={t('admin-delete')}
        message={t('admin-confirm-delete')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteIdx(null)}
      />
    </div>
  );
}
