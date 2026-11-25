'use client';

import { useId } from 'react';
import type { LocalizedString } from '@/types';

export const inputClass =
  'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm';

export const buttonClass =
  'px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50';

export const emptyLoc = (): LocalizedString => ({ en: '', tr: '' });

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: (id: string) => React.ReactNode;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium mb-1">
        {label}
      </label>
      {children(id)}
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

/** EN and TR side by side; an empty TR is shown with a hint because the site falls back to EN. */
export function LocField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
  maxLength,
  missingTrHint,
}: {
  label: string;
  value: LocalizedString | undefined;
  onChange: (v: LocalizedString) => void;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  missingTrHint?: string;
}) {
  const v = value ?? emptyLoc();
  const control = (lang: 'en' | 'tr', id: string) =>
    multiline ? (
      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        value={v[lang]}
        onChange={(e) => onChange({ ...v, [lang]: e.target.value })}
        className={`${inputClass} resize-y`}
        lang={lang}
      />
    ) : (
      <input
        id={id}
        maxLength={maxLength}
        value={v[lang]}
        onChange={(e) => onChange({ ...v, [lang]: e.target.value })}
        className={inputClass}
        lang={lang}
      />
    );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label={`${label} (EN)`}>{(id) => control('en', id)}</Field>
      <Field label={`${label} (TR)`} hint={v.en.trim() && !v.tr.trim() ? missingTrHint : undefined}>
        {(id) => control('tr', id)}
      </Field>
    </div>
  );
}

export function Section({ title, children, open = false }: { title: string; children: React.ReactNode; open?: boolean }) {
  return (
    <details open={open} className="rounded-xl border border-gray-200 dark:border-slate-800 group">
      <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold flex items-center justify-between">
        {title}
        <span className="material-symbols-outlined text-base transition-transform group-open:rotate-180">expand_more</span>
      </summary>
      <div className="px-4 pb-4 pt-1 space-y-4">{children}</div>
    </details>
  );
}
