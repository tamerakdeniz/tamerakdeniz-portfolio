'use client';

import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { baseSlug, slugify } from '@/lib/content/portfolio';
import { deleteReleasedMedia } from '@/lib/portfolio-storage';
import { useAppStore } from '@/store';
import type {
  Backplate,
  PlateArtKey,
  PlateField,
  PresentationVariant,
  Project,
  ProjectLink,
  ProjectPresentation,
} from '@/types';
import { buttonClass, emptyLoc, Field, inputClass, LocField, Section } from './form/fields';
import { MediaListEditor } from './form/MediaListEditor';
import { MediaUpload } from './form/MediaUpload';

const BASE_CATEGORIES = ['web', 'ai', 'startup', 'opensource', 'desktop', 'mobile', 'extension', 'practice', 'test'];
const VARIANTS: PresentationVariant[] = ['auto', 'editorial', 'technical', 'mobile', 'immersive', 'minimal'];
const BACKPLATES: Backplate[] = ['white', 'black', 'ink', 'paper', 'mist', 'bleed'];
const FIELDS: PlateField[] = ['ink', 'night', 'paper', 'violet'];
const ARTS: PlateArtKey[] = ['none', 'timer', 'day', 'route'];
const HEX = /^#[0-9a-f]{6}$/i;
const URL_OK = (u: string) => !u.trim() || /^https?:\/\//i.test(u.trim());

type Visibility = 'draft' | 'published' | 'archived';

export function newProject(): Project {
  return {
    id: `p${Date.now().toString(36)}`,
    title: emptyLoc(),
    description: emptyLoc(),
    category: ['web'],
    techStack: [],
    githubUrl: '',
    demoUrl: '',
    liveUrl: '',
    image: '',
    published: false,
  };
}

const publicSlug = baseSlug;

export function ProjectForm({
  project,
  allProjects,
  onSave,
  onCancel,
}: {
  project: Project;
  allProjects: Project[];
  onSave: (p: Project, sessionUploads: string[]) => Promise<boolean>;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState<Project>(project);
  const [techInput, setTechInput] = useState(project.techStack?.join(', ') || '');
  const [newCategory, setNewCategory] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const uploads = useRef<string[]>([]);
  const trackUpload = (path: string) => uploads.current.push(path);

  const set = <K extends keyof Project>(key: K, value: Project[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setPres = (change: Partial<ProjectPresentation>) =>
    setForm((f) => ({ ...f, presentation: { ...(f.presentation ?? {}), ...change } }));

  const visibility: Visibility = !form.published ? 'draft' : form.archived ? 'archived' : 'published';
  const setVisibility = (v: Visibility) =>
    setForm((f) => ({ ...f, published: v !== 'draft', archived: v === 'archived' }));

  const categories = Array.isArray(form.category) ? form.category : [form.category].filter(Boolean);
  const knownCategories = useMemo(() => {
    const all = new Set(BASE_CATEGORIES);
    for (const p of allProjects) for (const c of Array.isArray(p.category) ? p.category : [p.category]) if (c) all.add(c);
    for (const c of categories) all.add(c);
    return [...all];
  }, [allProjects, categories]);

  const slug = publicSlug(form);
  const originalSlug = project.published ? publicSlug(project) : null;

  const validate = (candidate: Project): string[] => {
    const problems: string[] = [];
    if (!candidate.title.en.trim()) problems.push(t('admin-err-title'));
    const clash = allProjects.find((p) => p.id !== candidate.id && (publicSlug(p) === slug || (p.previousSlugs ?? []).includes(slug)));
    if (clash) problems.push(t('admin-err-slug', { title: clash.title.en }));
    const urls = [candidate.githubUrl, candidate.demoUrl, candidate.liveUrl ?? '', ...(candidate.links ?? []).map((l) => l.url)];
    if (!urls.every(URL_OK)) problems.push(t('admin-err-url'));
    const accent = candidate.presentation?.accent;
    if (accent && !HEX.test(accent)) problems.push(t('admin-err-accent'));
    if (candidate.published && (candidate.media ?? []).some((m) => !m.alt?.en?.trim())) problems.push(t('admin-media-alt-required'));
    return problems;
  };

  const submit = async () => {
    const techStack = techInput.split(',').map((s) => s.trim()).filter(Boolean);
    let previousSlugs = (form.previousSlugs ?? []).filter((s) => s && s !== slug);
    if (originalSlug && originalSlug !== slug && !previousSlugs.includes(originalSlug)) previousSlugs = [...previousSlugs, originalSlug];
    const candidate: Project = {
      ...form,
      techStack,
      slug: form.slug?.trim() ? slugify(form.slug) : undefined,
      previousSlugs: previousSlugs.length ? previousSlugs : undefined,
      links: (form.links ?? []).filter((l) => l.url.trim()),
      updatedAt: new Date().toISOString(),
    };
    const problems = validate(candidate);
    setErrors(problems);
    if (problems.length) return;
    setSaving(true);
    const ok = await onSave(candidate, uploads.current);
    setSaving(false);
    if (ok) uploads.current = [];
  };

  const cancel = async () => {
    const pending = uploads.current;
    uploads.current = [];
    onCancel();
    if (pending.length) await deleteReleasedMedia(pending, useAppStore.getState().siteData).catch(() => {});
  };

  const links = form.links ?? [];
  const setLinks = (next: ProjectLink[]) => set('links', next);
  const sections = form.sections ?? [];
  const pres = form.presentation ?? {};

  return (
    <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 md:p-6 border border-gray-200 dark:border-slate-800 space-y-4">
      <Section title={t('admin-proj-basics')} open>
        <LocField label={t('admin-label-title')} value={form.title} onChange={(v) => set('title', v)} maxLength={140} missingTrHint={t('admin-missing-tr')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t('admin-proj-slug')} hint={`/projects/${slug}`}>
            {(id) => (
              <input id={id} value={form.slug ?? ''} placeholder={slug} onChange={(e) => set('slug', e.target.value)} className={inputClass} />
            )}
          </Field>
          <Field label={t('admin-proj-previous-slugs')} hint={t('admin-proj-previous-slugs-hint')}>
            {(id) => (
              <input
                id={id}
                value={(form.previousSlugs ?? []).join(', ')}
                onChange={(e) => set('previousSlugs', e.target.value.split(',').map((s) => slugify(s)).filter(Boolean))}
                className={inputClass}
              />
            )}
          </Field>
        </div>
        {originalSlug && originalSlug !== slug && <p className="text-xs text-amber-600">{t('admin-proj-slug-changed', { from: originalSlug })}</p>}
        <LocField
          label={t('admin-label-description')}
          value={form.description}
          onChange={(v) => set('description', v)}
          multiline
          rows={5}
          maxLength={6000}
          missingTrHint={t('admin-missing-tr')}
        />
        <div>
          <p className="block text-sm font-medium mb-1">{t('admin-label-categories')}</p>
          <div className="flex flex-wrap gap-2">
            {knownCategories.map((c) => {
              const selected = categories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    const next = selected ? categories.filter((v) => v !== c) : [...categories, c];
                    set('category', next.length ? next : categories);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selected ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-background-dark border-gray-300 dark:border-slate-700'
                  }`}
                >
                  {c}
                </button>
              );
            })}
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder={t('admin-proj-new-category')}
              aria-label={t('admin-proj-new-category')}
              className={`${inputClass} w-40`}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                const c = slugify(newCategory);
                if (c && !categories.includes(c)) set('category', [...categories, c]);
                setNewCategory('');
              }}
            />
          </div>
        </div>
        <Field label={t('admin-label-tech-stack')} hint={t('admin-proj-stack-hint')}>
          {(id) => <input id={id} value={techInput} onChange={(e) => setTechInput(e.target.value)} className={inputClass} />}
        </Field>
      </Section>

      <Section title={t('admin-proj-role')}>
        <LocField label={t('admin-proj-role-label')} value={form.role} onChange={(v) => set('role', v)} maxLength={140} missingTrHint={t('admin-missing-tr')} />
        <LocField
          label={t('admin-proj-contribution')}
          value={form.contribution}
          onChange={(v) => set('contribution', v)}
          multiline
          rows={4}
          maxLength={3000}
          missingTrHint={t('admin-missing-tr')}
        />
        <LocField label={t('admin-proj-period')} value={form.period} onChange={(v) => set('period', v)} maxLength={80} missingTrHint={t('admin-missing-tr')} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t('admin-proj-year')}>
            {(id) => <input id={id} value={form.year ?? ''} onChange={(e) => set('year', e.target.value)} className={inputClass} maxLength={9} />}
          </Field>
          <Field label={t('admin-proj-status')} hint={t('admin-proj-status-hint')}>
            {(id) => <input id={id} value={form.status ?? ''} onChange={(e) => set('status', e.target.value)} className={inputClass} maxLength={60} />}
          </Field>
        </div>
      </Section>

      <Section title={t('admin-proj-links')}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label={t('admin-label-live-url')}>
            {(id) => <input id={id} value={form.liveUrl ?? ''} onChange={(e) => set('liveUrl', e.target.value)} className={inputClass} placeholder="https://" />}
          </Field>
          <Field label={t('admin-label-demo-url')}>
            {(id) => <input id={id} value={form.demoUrl ?? ''} onChange={(e) => set('demoUrl', e.target.value)} className={inputClass} placeholder="https://" />}
          </Field>
          <Field label={t('admin-label-github-url')}>
            {(id) => <input id={id} value={form.githubUrl ?? ''} onChange={(e) => set('githubUrl', e.target.value)} className={inputClass} placeholder="https://" />}
          </Field>
        </div>
        {links.map((link, i) => (
          <div key={i} className="rounded-xl border border-gray-200 dark:border-slate-800 p-3 space-y-3">
            <LocField label={t('admin-proj-link-label')} value={link.label} onChange={(label) => setLinks(links.map((l, j) => (j === i ? { ...l, label } : l)))} maxLength={60} />
            <div className="flex gap-2">
              <input
                aria-label="URL"
                value={link.url}
                onChange={(e) => setLinks(links.map((l, j) => (j === i ? { ...l, url: e.target.value } : l)))}
                className={inputClass}
                placeholder="https://"
              />
              <button type="button" className={`${buttonClass} text-red-500`} onClick={() => setLinks(links.filter((_, j) => j !== i))}>
                {t('admin-media-remove')}
              </button>
            </div>
          </div>
        ))}
        <button type="button" className={buttonClass} onClick={() => setLinks([...links, { label: emptyLoc(), url: '' }])}>
          {t('admin-proj-add-link')}
        </button>
      </Section>

      <Section title={t('admin-proj-media')}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="size-20 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center">
            {form.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.image} alt="" className="w-full h-full object-contain" />
            ) : (
              <span className="text-xs text-slate-500">{t('admin-proj-no-mark')}</span>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">{t('admin-proj-mark')}</p>
            <div className="flex flex-wrap gap-2">
              <MediaUpload
                folder="projects"
                entityId={form.id}
                kind="logo"
                label={form.image ? t('admin-media-replace') : t('admin-media-upload')}
                onUploaded={(file) => {
                  trackUpload(file.path);
                  setForm((f) => ({ ...f, image: file.url, imagePath: file.path }));
                }}
              />
              {form.image && (
                <button type="button" className={`${buttonClass} text-red-500`} onClick={() => setForm((f) => ({ ...f, image: '', imagePath: undefined }))}>
                  {t('admin-media-remove')}
                </button>
              )}
            </div>
          </div>
        </div>
        <MediaListEditor entityId={form.id} media={form.media ?? []} onChange={(media) => set('media', media)} onUploaded={trackUpload} />
      </Section>

      <Section title={t('admin-proj-presentation')}>
        <p className="text-xs text-slate-500">{t('admin-proj-presentation-hint')}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label={t('admin-proj-variant')}>
            {(id) => (
              <select id={id} value={pres.variant ?? 'auto'} onChange={(e) => setPres({ variant: e.target.value as PresentationVariant })} className={inputClass}>
                {VARIANTS.map((v) => (
                  <option key={v} value={v}>
                    {t(`admin-variant-${v}`)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label={t('admin-proj-accent')}>
            {(id) => (
              <div className="flex gap-2">
                <input
                  id={id}
                  type="color"
                  value={pres.accent && HEX.test(pres.accent) ? pres.accent : '#ff9b2f'}
                  onChange={(e) => setPres({ accent: e.target.value })}
                  className="h-9 w-12 rounded border border-gray-300 dark:border-slate-700"
                />
                <input
                  aria-label={t('admin-proj-accent')}
                  value={pres.accent ?? ''}
                  placeholder={t('admin-default')}
                  onChange={(e) => setPres({ accent: e.target.value || undefined })}
                  className={inputClass}
                />
              </div>
            )}
          </Field>
          <Field label={t('admin-proj-field')}>
            {(id) => (
              <select id={id} value={pres.field ?? ''} onChange={(e) => setPres({ field: (e.target.value || undefined) as PlateField | undefined })} className={inputClass}>
                <option value="">{t('admin-default')}</option>
                {FIELDS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label={t('admin-proj-backplate')}>
            {(id) => (
              <select
                id={id}
                value={pres.backplate ?? ''}
                onChange={(e) => setPres({ backplate: (e.target.value || undefined) as Backplate | undefined })}
                className={inputClass}
              >
                <option value="">{t('admin-default')}</option>
                {BACKPLATES.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label={t('admin-proj-inset')}>
            {(id) => (
              <input
                id={id}
                type="number"
                min={0}
                max={0.3}
                step={0.02}
                value={pres.inset ?? ''}
                placeholder={t('admin-default')}
                onChange={(e) => setPres({ inset: e.target.value === '' ? undefined : Math.min(0.3, Math.max(0, Number(e.target.value))) })}
                className={inputClass}
              />
            )}
          </Field>
          <Field label={t('admin-proj-art')} hint={t('admin-proj-art-hint')}>
            {(id) => (
              <select id={id} value={pres.art ?? ''} onChange={(e) => setPres({ art: (e.target.value || undefined) as PlateArtKey | undefined })} className={inputClass}>
                <option value="">{t('admin-default')}</option>
                {ARTS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
      </Section>

      <Section title={t('admin-proj-sections')}>
        <p className="text-xs text-slate-500">{t('admin-proj-sections-hint')}</p>
        {sections.map((section, i) => (
          <div key={i} className="rounded-xl border border-gray-200 dark:border-slate-800 p-3 space-y-3">
            <LocField
              label={t('admin-proj-section-heading')}
              value={section.heading}
              onChange={(heading) => set('sections', sections.map((s, j) => (j === i ? { ...s, heading } : s)))}
              maxLength={120}
              missingTrHint={t('admin-missing-tr')}
            />
            <LocField
              label={t('admin-proj-section-body')}
              value={section.body}
              onChange={(body) => set('sections', sections.map((s, j) => (j === i ? { ...s, body } : s)))}
              multiline
              rows={5}
              maxLength={6000}
              missingTrHint={t('admin-missing-tr')}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                className={buttonClass}
                disabled={i === 0}
                onClick={() => {
                  const next = [...sections];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  set('sections', next);
                }}
                aria-label={t('admin-move-up')}
              >
                <span className="material-symbols-outlined text-base">arrow_upward</span>
              </button>
              <button type="button" className={`${buttonClass} text-red-500`} onClick={() => set('sections', sections.filter((_, j) => j !== i))}>
                {t('admin-media-remove')}
              </button>
            </div>
          </div>
        ))}
        <button type="button" className={buttonClass} onClick={() => set('sections', [...sections, { heading: emptyLoc(), body: emptyLoc() }])}>
          {t('admin-proj-add-section')}
        </button>
      </Section>

      <Section title={t('admin-proj-visibility')} open>
        <fieldset className="flex flex-wrap gap-4">
          <legend className="sr-only">{t('admin-proj-visibility')}</legend>
          {(['draft', 'published', 'archived'] as Visibility[]).map((v) => (
            <label key={v} className="flex items-center gap-2 text-sm">
              <input type="radio" name={`vis-${form.id}`} checked={visibility === v} onChange={() => setVisibility(v)} />
              {t(`admin-vis-${v}`)}
            </label>
          ))}
        </fieldset>
        <p className="text-xs text-slate-500">{t(`admin-vis-${visibility}-hint`)}</p>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.featured} onChange={(e) => set('featured', e.target.checked)} />
            {t('admin-proj-featured')}
          </label>
          {form.featured && (
            <Field label={t('admin-proj-featured-order')} className="w-40">
              {(id) => (
                <input
                  id={id}
                  type="number"
                  min={1}
                  value={form.featuredOrder ?? ''}
                  onChange={(e) => set('featuredOrder', e.target.value === '' ? undefined : Number(e.target.value))}
                  className={inputClass}
                />
              )}
            </Field>
          )}
        </div>
      </Section>

      {errors.length > 0 && (
        <ul className="text-sm text-red-500 list-disc pl-5" role="alert">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      )}

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={() => void cancel()} className={buttonClass} disabled={saving}>
          {t('admin-cancel')}
        </button>
        <button
          type="button"
          onClick={() => void submit()}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? t('admin-saving') : t('admin-save')}
        </button>
      </div>
    </div>
  );
}
