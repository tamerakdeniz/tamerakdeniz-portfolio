'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store';
import { useSaveContent } from '@/admin/lib/save-content';
import { deleteReleasedMedia } from '@/lib/portfolio-storage';
import { FEATURED_MAX } from '@/lib/content/portfolio';
import type { EngineeringPillar, FieldPhoto, Profile } from '@/types';
import { buttonClass, emptyLoc, Field, inputClass, LocField, Section } from './form/fields';
import { MediaUpload } from './form/MediaUpload';

export function AdminProfileSection() {
  const { t } = useTranslation();
  const siteData = useAppStore((s) => s.siteData);
  const saveContent = useSaveContent();
  const [profile, setProfile] = useState<Profile>(siteData?.profile ?? {});
  const [featuredCount, setFeaturedCount] = useState<number>(siteData?.display?.featuredCount ?? 3);
  const [saving, setSaving] = useState(false);
  const [uploads, setUploads] = useState<string[]>([]);

  if (!siteData) return null;
  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setProfile((p) => ({ ...p, [key]: value }));
  const pillars = profile.pillars ?? [];
  const photo = profile.fieldPhoto;

  const patchPillar = (i: number, change: Partial<EngineeringPillar>) =>
    set('pillars', pillars.map((p, j) => (j === i ? { ...p, ...change } : p)));

  const save = async () => {
    setSaving(true);
    const ok = await saveContent({
      ...siteData,
      profile,
      display: { ...(siteData.display ?? {}), featuredCount: Math.min(FEATURED_MAX, Math.max(0, Math.round(featuredCount) || 0)) },
    });
    setSaving(false);
    if (ok) setUploads([]);
  };

  const cancel = async () => {
    setProfile(siteData.profile ?? {});
    setFeaturedCount(siteData.display?.featuredCount ?? 3);
    const pending = uploads;
    setUploads([]);
    if (pending.length) await deleteReleasedMedia(pending, siteData).catch(() => {});
  };

  const setPhoto = (change: Partial<FieldPhoto> | null) => set('fieldPhoto', change === null ? undefined : { ...(photo ?? { url: '', alt: emptyLoc() }), ...change });

  return (
    <div className="space-y-4 max-w-4xl">
      <h2 className="text-xl font-bold">{t('admin-nav-profile')}</h2>
      <p className="text-sm text-slate-500">{t('admin-profile-intro')}</p>

      <Section title={t('admin-profile-identity')} open>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t('admin-profile-full-name')}>
            {(id) => <input id={id} value={profile.fullName ?? ''} onChange={(e) => set('fullName', e.target.value)} className={inputClass} maxLength={120} />}
          </Field>
          <Field label={t('admin-profile-short-name')}>
            {(id) => <input id={id} value={profile.shortName ?? ''} onChange={(e) => set('shortName', e.target.value)} className={inputClass} maxLength={80} />}
          </Field>
        </div>
        <LocField label={t('admin-profile-role')} value={profile.role} onChange={(v) => set('role', v)} maxLength={120} missingTrHint={t('admin-missing-tr')} />
        <Field label={t('admin-profile-featured-count')} hint={t('admin-profile-featured-count-hint', { max: FEATURED_MAX })}>
          {(id) => (
            <input
              id={id}
              type="number"
              min={0}
              max={FEATURED_MAX}
              value={featuredCount}
              onChange={(e) => setFeaturedCount(Number(e.target.value))}
              className={`${inputClass} w-32`}
            />
          )}
        </Field>
      </Section>

      <Section title={t('admin-profile-photo')}>
        <div className="flex flex-wrap items-start gap-4">
          <div className="w-40 aspect-[4/5] rounded-lg bg-slate-900 overflow-hidden flex items-center justify-center">
            {photo?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-slate-400 px-2 text-center">{t('admin-profile-photo-fallback')}</span>
            )}
          </div>
          <div className="flex-1 space-y-3 min-w-0 w-full">
            <div className="flex flex-wrap gap-2">
              <MediaUpload
                folder="profile"
                entityId="field-photo"
                kind="photo"
                label={photo?.url ? t('admin-media-replace') : t('admin-media-upload')}
                onUploaded={(file) => {
                  setUploads((u) => [...u, file.path]);
                  setPhoto({ url: file.url, path: file.path });
                }}
              />
              {photo?.url && (
                <button type="button" className={`${buttonClass} text-red-500`} onClick={() => setPhoto(null)}>
                  {t('admin-media-remove')}
                </button>
              )}
            </div>
            <LocField label={t('admin-media-alt')} value={photo?.alt} onChange={(alt) => setPhoto({ alt })} maxLength={200} missingTrHint={t('admin-missing-tr')} />
            <LocField label={t('admin-media-caption')} value={photo?.caption} onChange={(caption) => setPhoto({ caption })} maxLength={200} missingTrHint={t('admin-missing-tr')} />
            <LocField label={t('admin-profile-photo-note')} value={photo?.note} onChange={(note) => setPhoto({ note })} maxLength={200} missingTrHint={t('admin-missing-tr')} />
          </div>
        </div>
      </Section>

      <Section title={t('admin-profile-pillars')}>
        <p className="text-xs text-slate-500">{t('admin-profile-pillars-hint')}</p>
        {pillars.map((pillar, i) => (
          <div key={pillar.id} className="rounded-xl border border-gray-200 dark:border-slate-800 p-3 space-y-3">
            <LocField label={t('admin-profile-pillar-title')} value={pillar.title} onChange={(title) => patchPillar(i, { title })} maxLength={120} missingTrHint={t('admin-missing-tr')} />
            <LocField label={t('admin-profile-pillar-body')} value={pillar.body} onChange={(body) => patchPillar(i, { body })} multiline rows={4} maxLength={1200} missingTrHint={t('admin-missing-tr')} />
            <Field label={t('admin-label-tech-stack')}>
              {(id) => (
                <input
                  id={id}
                  value={(pillar.tech ?? []).join(', ')}
                  onChange={(e) => patchPillar(i, { tech: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                  className={inputClass}
                />
              )}
            </Field>
            <div className="flex justify-end">
              <button type="button" className={`${buttonClass} text-red-500`} onClick={() => set('pillars', pillars.filter((_, j) => j !== i))}>
                {t('admin-media-remove')}
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          className={buttonClass}
          onClick={() => set('pillars', [...pillars, { id: `pillar-${Date.now().toString(36)}`, title: emptyLoc(), body: emptyLoc(), tech: [] }])}
        >
          {t('admin-profile-add-pillar')}
        </button>
      </Section>

      <div className="flex gap-3 justify-end">
        <button type="button" className={buttonClass} disabled={saving} onClick={() => void cancel()}>
          {t('admin-cancel')}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? t('admin-saving') : t('admin-save')}
        </button>
      </div>
    </div>
  );
}
