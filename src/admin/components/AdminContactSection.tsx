'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, selectContactInfo } from '@/store';
import { saveSiteData, getFirebaseDatabase } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';
import { showToast } from '@/components/ui/Toast';
import type { ContactSubmission, ContactInfo } from '@/types';

export function AdminContactSection() {
  const { t } = useTranslation();
  const siteData = useAppStore((s) => s.siteData);
  const contactInfo = useAppStore(selectContactInfo);
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [editingInfo, setEditingInfo] = useState(false);
  const [form, setForm] = useState<ContactInfo>(contactInfo);

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
    } catch { showToast('Save failed', 'error'); }
  }, [siteData, form, t]);

  useEffect(() => { setForm(contactInfo); }, [contactInfo]);

  return (
    <div className="space-y-6">
      {/* Contact Info Editor */}
      <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 border border-gray-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">Contact Information</h3>
          {!editingInfo && (
            <button onClick={() => setEditingInfo(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          )}
        </div>
        {editingInfo ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Location (EN)</label><input value={form.location.en} onChange={(e) => setForm({ ...form, location: { ...form.location, en: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">GitHub</label><input value={form.social.github} onChange={(e) => setForm({ ...form, social: { ...form.social, github: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">LinkedIn</label><input value={form.social.linkedin} onChange={(e) => setForm({ ...form, social: { ...form.social, linkedin: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Instagram</label><input value={form.social.instagram} onChange={(e) => setForm({ ...form, social: { ...form.social, instagram: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Upwork</label><input value={form.social.upwork} onChange={(e) => setForm({ ...form, social: { ...form.social, upwork: e.target.value } })} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark text-sm" /></div>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditingInfo(false)} className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-slate-800">{t('admin-cancel')}</button>
              <button onClick={saveInfo} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-blue-700">{t('admin-save')}</button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div><span className="text-slate-500">Email:</span> {contactInfo.email}</div>
            <div><span className="text-slate-500">Location:</span> {contactInfo.location.en}</div>
            <div><span className="text-slate-500">GitHub:</span> {contactInfo.social.github}</div>
            <div><span className="text-slate-500">LinkedIn:</span> {contactInfo.social.linkedin}</div>
          </div>
        )}
      </div>

      {/* Submissions */}
      <div>
        <h3 className="font-bold mb-4">Messages ({submissions.length})</h3>
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-slate-800">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm">{sub.name}</p>
                  <p className="text-xs text-slate-500">{sub.email}</p>
                </div>
                <span className="text-xs text-slate-400">{new Date(sub.timestamp).toLocaleDateString()}</span>
              </div>
              <p className="text-sm font-medium text-primary mb-1">{sub.subject}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{sub.message}</p>
            </div>
          ))}
          {submissions.length === 0 && <p className="text-center py-8 text-slate-500">No messages yet.</p>}
        </div>
      </div>
    </div>
  );
}
