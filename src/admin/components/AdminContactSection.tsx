'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, selectContactInfo } from '@/store';
import { saveSiteData, getFirebaseDatabase, saveFirebaseData, logActivity } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { showToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { ContactSubmission, ContactInfo } from '@/types';

export function AdminContactSection() {
  const { t } = useTranslation();
  const siteData = useAppStore((s) => s.siteData);
  const contactInfo = useAppStore(selectContactInfo);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [editingInfo, setEditingInfo] = useState(false);
  const [form, setForm] = useState<ContactInfo>(contactInfo);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    try {
      const db = getFirebaseDatabase();
      const subRef = ref(db, 'contactSubmissions');
      const unsub = onValue(subRef, (snap) => {
        const val = snap.val();
        if (val) {
          const arr = Object.values(val) as ContactSubmission[];
          arr.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setSubmissions(arr);
        } else {
          setSubmissions([]);
        }
      });
      return () => unsub();
    } catch {
      const local = localStorage.getItem('portfolio_contact_submissions');
      if (local) setSubmissions(JSON.parse(local));
    }
  }, []);

  const saveInfo = useCallback(async () => {
    if (!siteData) return;
    try {
      await saveSiteData({ ...siteData, contactInfo: form });
      showToast(t('admin-saved'), 'success');
      setEditingInfo(false);
    } catch { showToast(t('admin-save-failed'), 'error'); }
  }, [siteData, form, t]);

  useEffect(() => { setForm(contactInfo); }, [contactInfo]);

  const toggleRead = async (sub: ContactSubmission) => {
    const newRead = !sub.read;
    try {
      await saveFirebaseData(`contactSubmissions/${sub.id}/read`, newRead);
      showToast(newRead ? t('admin-marked-read') : t('admin-marked-unread'), 'success');
    } catch { showToast(t('admin-failed-update'), 'error'); }
  };

  const toggleImportant = async (sub: ContactSubmission) => {
    const current = (sub as unknown as Record<string, unknown>).important as boolean | undefined;
    const newVal = !current;
    try {
      await saveFirebaseData(`contactSubmissions/${sub.id}/important`, newVal);
      showToast(newVal ? t('admin-marked-important') : t('admin-removed-importance'), 'success');
    } catch { showToast(t('admin-failed-update'), 'error'); }
  };

  const deleteSubmission = async () => {
    if (!deleteTarget) return;
    const sub = submissions.find((s) => s.id === deleteTarget);
    try {
      await saveFirebaseData(`contactSubmissions/${deleteTarget}`, null);
      showToast(t('admin-message-deleted'), 'success');
      if (sub) logActivity('delete', `Deleted contact message from ${sub.name}`);
    } catch { showToast(t('admin-failed-delete'), 'error'); }
    setDeleteTarget(null);
  };

  const isImportant = (sub: ContactSubmission) =>
    !!(sub as unknown as Record<string, unknown>).important;

  return (
    <div className="space-y-6">
      {/* Contact Info Editor */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">{t('admin-contact-information')}</h3>
          {!editingInfo && (
            <button onClick={() => setEditingInfo(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          )}
        </div>
        {editingInfo ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">{t('admin-label-email')}</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">{t('admin-label-location-en')}</label><input value={form.location.en} onChange={(e) => setForm({ ...form, location: { ...form.location, en: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">{t('admin-label-github')}</label><input value={form.social.github} onChange={(e) => setForm({ ...form, social: { ...form.social, github: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">{t('admin-label-linkedin')}</label><input value={form.social.linkedin} onChange={(e) => setForm({ ...form, social: { ...form.social, linkedin: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">{t('admin-label-instagram')}</label><input value={form.social.instagram} onChange={(e) => setForm({ ...form, social: { ...form.social, instagram: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">{t('admin-label-upwork')}</label><input value={form.social.upwork} onChange={(e) => setForm({ ...form, social: { ...form.social, upwork: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingInfo(false)} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-800">{t('admin-cancel')}</button>
              <button onClick={saveInfo} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-blue-700">{t('admin-save')}</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">{t('admin-label-email')}:</span> {contactInfo.email}</div>
            <div><span className="text-slate-500">{t('admin-label-location')}:</span> {contactInfo.location.en}</div>
            <div><span className="text-slate-500">{t('admin-label-github')}:</span> {contactInfo.social.github}</div>
            <div><span className="text-slate-500">{t('admin-label-linkedin')}:</span> {contactInfo.social.linkedin}</div>
          </div>
        )}
      </div>

      {/* Submissions */}
      <div>
        <h3 className="font-bold mb-4">{t('admin-messages-count', { count: submissions.length })}</h3>
        <div className="space-y-3">
          {submissions.map((sub) => {
            const important = isImportant(sub);
            const unread = !sub.read;

            return (
              <div
                key={sub.id}
                className={`bg-white dark:bg-surface-dark rounded-xl p-4 border transition-colors ${
                  important
                    ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/30 dark:bg-amber-500/5'
                    : 'border-gray-200 dark:border-slate-800'
                } ${unread ? 'border-l-4 border-l-blue-500' : ''}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${unread ? 'font-bold' : 'font-semibold'}`}>{sub.name}</p>
                    <p className="text-xs text-slate-500">{sub.email}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      onClick={() => toggleImportant(sub)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        important
                          ? 'text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-500/20'
                          : 'text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                      }`}
                      title={important ? t('admin-remove-importance') : t('admin-mark-important')}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {important ? 'star' : 'star_outline'}
                      </span>
                    </button>
                    <button
                      onClick={() => toggleRead(sub)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        unread
                          ? 'text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-500/20'
                          : 'text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                      }`}
                      title={unread ? t('admin-mark-read') : t('admin-mark-unread')}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {unread ? 'mark_email_unread' : 'mark_email_read'}
                      </span>
                    </button>
                    <button
                      onClick={() => setDeleteTarget(sub.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
                      title={t('admin-delete-message')}
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                    <span className="text-xs text-slate-400 ml-1">{new Date(sub.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <p className={`text-sm text-primary mb-1 ${unread ? 'font-semibold' : 'font-medium'}`}>{sub.subject}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{sub.message}</p>
              </div>
            );
          })}
          {submissions.length === 0 && <p className="text-center py-8 text-slate-500">{t('admin-no-messages')}</p>}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title={t('admin-delete-message')}
        message={t('admin-confirm-delete-message')}
        confirmLabel={t('admin-delete')}
        cancelLabel={t('admin-cancel')}
        variant="danger"
        onConfirm={deleteSubmission}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
