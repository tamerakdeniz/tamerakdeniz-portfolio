'use client';

import { useState, useCallback, type DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useSaveContent } from '@/admin/lib/save-content';
import { useAppStore, selectTimeline } from '@/store';
import { logActivity } from '@/lib/firebase';
import { Field } from './form/fields';
import { showToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { TimelineEntry } from '@/types';

const emptyForm: TimelineEntry = {
  type: 'work',
  title: { en: '', tr: '' },
  company: { en: '', tr: '' },
  period: { en: '', tr: '' },
  description: { en: '', tr: '' },
  published: true,
};

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm';

const typeBadgeClass: Record<TimelineEntry['type'], string> = {
  work: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  education: 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  certification: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  achievement: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
};

export function AdminTimelineSection() {
  const { t } = useTranslation();
  const saveContent = useSaveContent();
  const siteData = useAppStore((s) => s.siteData);
  const timeline = useAppStore(selectTimeline);

  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deleteIdx, setDeleteIdx] = useState<number | null>(null);
  const [form, setForm] = useState<TimelineEntry>({ ...emptyForm });

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const sorted = [...timeline]
    .map((item, i) => ({ ...item, _idx: i }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const persist = useCallback(
    async (items: TimelineEntry[]) => {
      if (!siteData) return false;
      return saveContent({ ...siteData, timeline: items });
    },
    [siteData, saveContent],
  );

  const handleSave = async () => {
    if (!form.title.en.trim() || (form.startDate && form.endDate && !form.current && form.endDate < form.startDate) ||
        (form.url && !/^https?:\/\//i.test(form.url))) {
      showToast(t('admin-timeline-invalid'), 'error');
      return;
    }
    setSaving(true);
    const candidate = { ...form, id: form.id || crypto.randomUUID(), endDate: form.current ? undefined : form.endDate };
    const items = editingIdx !== null
      ? timeline.map((item, i) => i === editingIdx ? candidate : item)
      : [...timeline, { ...candidate, order: candidate.order ?? timeline.length }];
    const ok = await persist(items);
    setSaving(false);
    if (!ok) return;
    logActivity(editingIdx !== null ? 'edit' : 'add', `Saved timeline: ${form.title.en}`);
    setEditingIdx(null);
    setAdding(false);
  };

  const startEdit = (realIdx: number) => {
    setAdding(false);
    setForm({ ...timeline[realIdx] });
    setEditingIdx(realIdx);
  };

  const cancelEdit = () => {
    setEditingIdx(null);
    setAdding(false);
  };

  const startAdd = () => {
    setEditingIdx(null);
    setForm({ ...emptyForm });
    setAdding(true);
  };

  // --- Drag & drop ---
  const onDragStart = (e: DragEvent<HTMLDivElement>, sortedIndex: number) => {
    setDraggedIdx(sortedIndex);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = (e: DragEvent<HTMLDivElement>, sortedIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIdx !== null && draggedIdx !== sortedIndex) {
      setDragOverIdx(sortedIndex);
    }
  };

  const onDragLeave = () => setDragOverIdx(null);

  const onDrop = (e: DragEvent<HTMLDivElement>, targetSortedIdx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetSortedIdx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      return;
    }

    const reordered = [...sorted];
    const [moved] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetSortedIdx, 0, moved);

    const updated = timeline.map((item, i) => {
      const newOrder = reordered.findIndex((s) => s._idx === i);
      return { ...item, order: newOrder };
    });

    persist(updated);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const onDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  // --- Inline form ---
  const renderForm = () => (
    <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="admin-label-type" className="block text-sm font-medium mb-1">{t('admin-label-type')}</label>
          <select id="admin-label-type"
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value as TimelineEntry['type'] })
            }
            className={inputClass}
          >
            <option value="work">{t('admin-timeline-type-work')}</option>
            <option value="education">{t('admin-timeline-type-education')}</option>
            <option value="certification">{t('admin-timeline-type-certification')}</option>
            <option value="achievement">{t('admin-timeline-type-achievement')}</option>
          </select>
        </div>
        <div>
          <label htmlFor="admin-label-title-en" className="block text-sm font-medium mb-1">{t('admin-label-title-en')}</label>
          <input id="admin-label-title-en"
            value={form.title.en}
            onChange={(e) =>
              setForm({ ...form, title: { ...form.title, en: e.target.value } })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="admin-label-title-tr" className="block text-sm font-medium mb-1">{t('admin-label-title-tr')}</label>
          <input id="admin-label-title-tr"
            value={form.title.tr}
            onChange={(e) =>
              setForm({ ...form, title: { ...form.title, tr: e.target.value } })
            }
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="admin-label-company-en" className="block text-sm font-medium mb-1">{t('admin-label-company-en')}</label>
          <input id="admin-label-company-en"
            value={form.company.en}
            onChange={(e) =>
              setForm({ ...form, company: { ...form.company, en: e.target.value } })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="admin-label-company-tr" className="block text-sm font-medium mb-1">{t('admin-label-company-tr')}</label>
          <input id="admin-label-company-tr"
            value={form.company.tr}
            onChange={(e) =>
              setForm({ ...form, company: { ...form.company, tr: e.target.value } })
            }
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="admin-label-period-en" className="block text-sm font-medium mb-1">{t('admin-label-period-en')}</label>
          <input id="admin-label-period-en"
            value={form.period.en}
            onChange={(e) =>
              setForm({ ...form, period: { ...form.period, en: e.target.value } })
            }
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="admin-label-period-tr" className="block text-sm font-medium mb-1">{t('admin-label-period-tr')}</label>
          <input id="admin-label-period-tr"
            value={form.period.tr}
            onChange={(e) =>
              setForm({ ...form, period: { ...form.period, tr: e.target.value } })
            }
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="admin-label-description-en" className="block text-sm font-medium mb-1">{t('admin-label-description-en')}</label>
          <textarea id="admin-label-description-en"
            rows={3}
            value={form.description.en}
            onChange={(e) =>
              setForm({
                ...form,
                description: { ...form.description, en: e.target.value },
              })
            }
            className={`${inputClass} resize-none`}
          />
        </div>
        <div>
          <label htmlFor="admin-label-description-tr" className="block text-sm font-medium mb-1">{t('admin-label-description-tr')}</label>
          <textarea id="admin-label-description-tr"
            rows={3}
            value={form.description.tr}
            onChange={(e) =>
              setForm({
                ...form,
                description: { ...form.description, tr: e.target.value },
              })
            }
            className={`${inputClass} resize-none`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label={t('admin-timeline-start')}>
          {(id) => <input id={id} type="month" value={form.startDate ?? ''} onChange={(e) => setForm({ ...form, startDate: e.target.value || undefined, startDateExact: undefined })} className={inputClass} />}
        </Field>
        <Field label={t('admin-timeline-exact-start')}>
          {(id) => <input id={id} type="date" value={form.startDateExact ?? ''} onChange={(e) => setForm({ ...form, startDateExact: e.target.value || undefined, startDate: e.target.value ? e.target.value.slice(0, 7) : form.startDate })} className={inputClass} />}
        </Field>
        <Field label={t('admin-timeline-end')}>
          {(id) => <input id={id} type="month" disabled={!!form.current} min={form.startDate} value={form.endDate ?? ''} onChange={(e) => setForm({ ...form, endDate: e.target.value || undefined })} className={inputClass} />}
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.current ?? /present|current|günümüz|devam/i.test(`${form.period.en} ${form.period.tr}`)} onChange={(e) => setForm({ ...form, current: e.target.checked })} />
          {t('admin-timeline-current')}
        </label>
        <Field label={t('admin-order')}>
          {(id) => <input id={id} type="number" min={0} value={form.order ?? timeline.length} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className={inputClass} />}
        </Field>
        <Field label={t('admin-timeline-url')}>
          {(id) => <input id={id} type="url" value={form.url ?? ''} onChange={(e) => setForm({ ...form, url: e.target.value })} className={inputClass} />}
        </Field>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="rounded border-gray-300 dark:border-slate-700"
          />
          {t('admin-published')}
        </label>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={cancelEdit}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-800"
        >
          {t('admin-cancel')}
        </button>
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-blue-700"
        >
          {t('admin-save')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t('admin-nav-timeline')}</h2>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-blue-700"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {t('admin-add')}
        </button>
      </div>

      {adding && renderForm()}

      <div className="space-y-2">
        {sorted.map((item, sortedIndex) => {
          const isEditing = editingIdx === item._idx;

          if (isEditing) {
            return <div key={item._idx}>{renderForm()}</div>;
          }

          const isDragged = draggedIdx === sortedIndex;
          const isDragOver = dragOverIdx === sortedIndex;

          return (
            <div
              key={item._idx}
              draggable
              onDragStart={(e) => onDragStart(e, sortedIndex)}
              onDragOver={(e) => onDragOver(e, sortedIndex)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, sortedIndex)}
              onDragEnd={onDragEnd}
              className={`bg-white dark:bg-surface-dark rounded-xl p-3 border flex items-center gap-3 transition-all ${
                isDragged ? 'opacity-50' : ''
              } ${
                isDragOver
                  ? 'border-primary'
                  : 'border-gray-200 dark:border-slate-800'
              }`}
            >
              <span
                className="material-symbols-outlined text-base text-slate-400 cursor-grab active:cursor-grabbing select-none"
                onMouseDown={(e) => e.stopPropagation()}
              >
                drag_indicator
              </span>

              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeBadgeClass[item.type]}`}
              >
                {t(`admin-timeline-type-${item.type}`)}
              </span>

              <div className="flex-1 min-w-0">
                <span className="font-medium text-sm truncate block">
                  {item.title.en || item.title.tr}
                </span>
                <span className="text-xs text-slate-500">{item.company.en}</span>
              </div>

              {!item.published && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400">
                  {t('admin-draft')}
                </span>
              )}

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => startEdit(item._idx)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button
                  onClick={() => setDeleteIdx(item._idx)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={deleteIdx !== null}
        title={t('admin-delete')}
        message={t('admin-confirm-delete')}
        onConfirm={() => {
          if (deleteIdx !== null) {
            persist(timeline.filter((_, i) => i !== deleteIdx));
            setDeleteIdx(null);
          }
        }}
        onCancel={() => setDeleteIdx(null)}
      />
    </div>
  );
}
