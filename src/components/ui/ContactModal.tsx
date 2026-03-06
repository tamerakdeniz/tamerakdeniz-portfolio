'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore, selectContactInfo } from '@/store';
import { Modal } from './Modal';
import { showToast } from './Toast';
import { saveFirebaseData } from '@/lib/firebase';

export function ContactModal() {
  const { t } = useTranslation();
  const isOpen = useAppStore((s) => s.contactModalOpen);
  const onClose = useAppStore((s) => s.setContactModalOpen);
  const contactInfo = useAppStore(selectContactInfo);
  const language = useAppStore((s) => s.language);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      timestamp: new Date().toISOString(),
      read: false,
    };

    try {
      await saveFirebaseData('contactSubmissions/' + data.id, data);
      showToast(t('contact-success'), 'success');
      form.reset();
      setTimeout(() => onClose(false), 1000);
    } catch {
      const submissions = JSON.parse(
        localStorage.getItem('portfolio_contact_submissions') || '[]'
      );
      submissions.push(data);
      localStorage.setItem(
        'portfolio_contact_submissions',
        JSON.stringify(submissions)
      );
      showToast(t('contact-success'), 'success');
      form.reset();
      setTimeout(() => onClose(false), 1000);
    } finally {
      setSubmitting(false);
    }
  };

  const socials = [
    {
      key: 'github',
      url: contactInfo.social.github,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      key: 'instagram',
      url: contactInfo.social.instagram,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
    },
    {
      key: 'linkedin',
      url: contactInfo.social.linkedin,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
    },
    {
      key: 'upwork',
      url: contactInfo.social.upwork,
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.561 13.158c-1.102 0-2.135-.467-3.074-1.227l.228-1.076.008-.042c.207-1.143.849-3.06 2.839-3.06 1.492 0 2.703 1.212 2.703 2.703-.001 1.489-1.212 2.702-2.704 2.702zm0-8.14c-2.539 0-4.51 1.649-5.31 4.366-1.22-1.834-2.148-4.036-2.687-5.892H7.828v7.112c-.002 1.406-1.141 2.546-2.547 2.546-1.405 0-2.543-1.14-2.545-2.546V3.492H0v7.112c0 2.914 2.37 5.303 5.281 5.303 2.913 0 5.283-2.389 5.283-5.303v-1.19c.529 1.107 1.182 2.229 1.974 3.221l-1.673 7.873h2.797l1.213-5.71c1.063.679 2.285 1.109 3.686 1.109 3 0 5.439-2.452 5.439-5.45 0-3-2.439-5.439-5.439-5.439z" />
        </svg>
      ),
    },
  ];

  const location =
    contactInfo.location?.[language] || contactInfo.location?.en || '';

  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)}>
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-bold mb-1">{t('contact-title')}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('contact-subtitle')}
          </p>
        </div>
        <button
          onClick={() => onClose(false)}
          className="flex items-center justify-center size-10 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <div className="overflow-y-auto flex-1 p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 border border-gray-200 dark:border-slate-700 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">
                email
              </span>
            </div>
            <h3 className="font-bold mb-2">{t('contact-email-label')}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {contactInfo.email}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 border border-gray-200 dark:border-slate-700 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">
                location_on
              </span>
            </div>
            <h3 className="font-bold mb-2">{t('contact-location-label')}</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {location}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 border border-gray-200 dark:border-slate-700 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">
                share
              </span>
            </div>
            <h3 className="font-bold mb-4">{t('social-follow')}</h3>
            <div className="flex items-center justify-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border border-gray-200 dark:border-slate-700 hover:bg-primary hover:text-white transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('form-name')}
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder={t('form-name-placeholder')}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('form-email')}
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder={t('form-email-placeholder')}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('form-subject')}
              </label>
              <input
                type="text"
                name="subject"
                required
                placeholder={t('form-subject-placeholder')}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('form-message')}
              </label>
              <textarea
                name="message"
                rows={6}
                required
                placeholder={t('form-message-placeholder')}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-background-dark focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{t('form-submit-text')}</span>
              <span className="material-symbols-outlined">send</span>
            </button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
