'use client';

import { useTranslation } from 'react-i18next';
import type { MediaKind, ProjectMedia } from '@/types';
import { buttonClass, inputClass, LocField } from './fields';
import { MediaUpload, type UploadResult } from './MediaUpload';

const KINDS: MediaKind[] = ['desktop', 'mobile', 'diagram', 'cover', 'video', 'logo'];

function fromUpload(file: UploadResult, kind: MediaKind, order: number): ProjectMedia {
  return {
    id: `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    kind,
    url: file.url,
    path: file.path,
    contentType: file.contentType,
    width: file.width,
    height: file.height,
    order,
    uploadedAt: new Date().toISOString(),
    alt: { en: '', tr: '' },
    caption: { en: '', tr: '' },
  };
}

/**
 * Screenshots, diagrams, covers and video for one project. Replacing or removing an item only
 * changes the form; the old file is deleted after the project is saved.
 */
export function MediaListEditor({
  entityId,
  media,
  onChange,
  onUploaded,
}: {
  entityId: string;
  media: ProjectMedia[];
  onChange: (next: ProjectMedia[]) => void;
  onUploaded: (path: string) => void;
}) {
  const { t } = useTranslation();
  const sorted = [...media].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const commit = (list: ProjectMedia[]) => onChange(list.map((m, i) => ({ ...m, order: i })));
  const patch = (id: string, change: Partial<ProjectMedia>) =>
    commit(sorted.map((m) => (m.id === id ? { ...m, ...change } : m)));
  const move = (index: number, by: number) => {
    const next = [...sorted];
    const [item] = next.splice(index, 1);
    next.splice(Math.max(0, Math.min(next.length, index + by)), 0, item);
    commit(next);
  };

  return (
    <div className="space-y-4">
      {sorted.length === 0 && <p className="text-sm text-slate-500">{t('admin-media-none')}</p>}
      {sorted.map((m, i) => {
        const missingAlt = !m.alt?.en?.trim();
        return (
          <div key={m.id} className="rounded-xl border border-gray-200 dark:border-slate-800 p-3 grid gap-3 md:grid-cols-[160px_1fr]">
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
              {m.kind === 'video' ? (
                <video src={m.url} muted playsInline controls className="w-full h-full object-contain" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt="" className="w-full h-full object-contain" />
              )}
            </div>
            <div className="space-y-3 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label={t('admin-media-kind')}
                  value={m.kind}
                  onChange={(e) => patch(m.id, { kind: e.target.value as MediaKind })}
                  className={`${inputClass} w-auto`}
                >
                  {KINDS.map((k) => (
                    <option key={k} value={k}>
                      {t(`admin-media-kind-${k}`)}
                    </option>
                  ))}
                </select>
                {m.width && m.height ? (
                  <span className="text-xs text-slate-500 tabular-nums">
                    {m.width}×{m.height}
                  </span>
                ) : null}
                <span className="flex-1" />
                <button type="button" className={buttonClass} disabled={i === 0} onClick={() => move(i, -1)} aria-label={t('admin-move-up')}>
                  <span className="material-symbols-outlined text-base">arrow_upward</span>
                </button>
                <button
                  type="button"
                  className={buttonClass}
                  disabled={i === sorted.length - 1}
                  onClick={() => move(i, 1)}
                  aria-label={t('admin-move-down')}
                >
                  <span className="material-symbols-outlined text-base">arrow_downward</span>
                </button>
                <MediaUpload
                  folder="projects"
                  entityId={entityId}
                  kind={m.kind}
                  allow={m.kind === 'video' ? ['video'] : ['image']}
                  label={t('admin-media-replace')}
                  onUploaded={(file) => {
                    onUploaded(file.path);
                    patch(m.id, {
                      url: file.url,
                      path: file.path,
                      contentType: file.contentType,
                      width: file.width,
                      height: file.height,
                      uploadedAt: new Date().toISOString(),
                    });
                  }}
                />
                <button
                  type="button"
                  className={`${buttonClass} text-red-500`}
                  onClick={() => commit(sorted.filter((x) => x.id !== m.id))}
                >
                  {t('admin-media-remove')}
                </button>
              </div>
              <LocField
                label={t('admin-media-alt')}
                value={m.alt}
                onChange={(alt) => patch(m.id, { alt })}
                maxLength={240}
                missingTrHint={t('admin-missing-tr')}
              />
              {missingAlt && <p className="text-xs text-amber-600">{t('admin-media-alt-required')}</p>}
              <LocField
                label={t('admin-media-caption')}
                value={m.caption}
                onChange={(caption) => patch(m.id, { caption })}
                maxLength={300}
                missingTrHint={t('admin-missing-tr')}
              />
            </div>
          </div>
        );
      })}
      <div className="flex flex-wrap gap-2">
        {(['desktop', 'mobile', 'diagram', 'cover'] as MediaKind[]).map((kind) => (
          <MediaUpload
            key={kind}
            folder="projects"
            entityId={entityId}
            kind={kind}
            label={t(`admin-media-add-${kind}`)}
            onUploaded={(file) => {
              onUploaded(file.path);
              commit([...sorted, fromUpload(file, kind, sorted.length)]);
            }}
          />
        ))}
        <MediaUpload
          folder="projects"
          entityId={entityId}
          kind="video"
          allow={['video']}
          label={t('admin-media-add-video')}
          onUploaded={(file) => {
            onUploaded(file.path);
            commit([...sorted, fromUpload(file, 'video', sorted.length)]);
          }}
        />
      </div>
    </div>
  );
}
