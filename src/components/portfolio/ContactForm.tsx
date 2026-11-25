'use client';

import { useId, useRef, useState } from 'react';
import { COPY } from '@/lib/content/copy';
import { pick } from '@/lib/content/portfolio';
import { useLang } from '@/lib/lang';
import { databaseRestUrl, PREVIEW_WRITES_BLOCKED } from '@/lib/firebase-config';
import s from './ContactForm.module.css';

type Field = 'name' | 'email' | 'subject' | 'message';
type Status = 'idle' | 'sending' | 'sent' | 'error' | 'busy' | 'preview';

const LIMITS: Record<Field, number> = { name: 120, email: 200, subject: 200, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SERVER_TIME = { '.sv': 'timestamp' };

class SubmitError extends Error {}

/**
 * Creates `contactSubmissions/{id}` — the path and shape the admin inbox reads — in one
 * multi-path update with `contactMeta/lastAt`. The database rules accept a submission only
 * together with that server timestamp, at most one every 20 seconds site-wide.
 */
async function submit(entry: Record<string, unknown>, id: string) {
  const url = databaseRestUrl('');
  if (!url) throw new SubmitError('error');
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      [`contactSubmissions/${id}`]: { ...entry, createdAt: SERVER_TIME },
      'contactMeta/lastAt': SERVER_TIME,
      'contactMeta/lastId': id,
    }),
  });
  if (res.status === 401 || res.status === 403) throw new SubmitError('busy');
  if (!res.ok) throw new SubmitError('error');
}

export function ContactForm({ email }: { email: string }) {
  const lang = useLang();
  const uid = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});

  const label = (f: Field) => pick(COPY.contact[f], lang);

  const validate = (data: Record<Field, string>) => {
    const next: Partial<Record<Field, string>> = {};
    (Object.keys(LIMITS) as Field[]).forEach((f) => {
      if (!data[f].trim()) next[f] = pick(COPY.contact.required, lang);
    });
    if (data.email.trim() && !EMAIL_RE.test(data.email.trim())) {
      next.email = pick(COPY.contact.invalidEmail, lang);
    }
    return next;
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending') return;
    const form = event.currentTarget;
    const fd = new FormData(form);
    const data = {
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      subject: String(fd.get('subject') ?? ''),
      message: String(fd.get('message') ?? ''),
    };
    const found = validate(data);
    setErrors(found);
    const first = (Object.keys(found) as Field[])[0];
    if (first) {
      form.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    if (String(fd.get('website') ?? '')) {
      setStatus('sent');
      form.reset();
      return;
    }

    if (PREVIEW_WRITES_BLOCKED) {
      setStatus('preview');
      return;
    }

    setStatus('sending');
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8).padEnd(4, '0')}`;
    try {
      await submit(
        {
          id,
          name: data.name.trim(),
          email: data.email.trim(),
          subject: data.subject.trim(),
          message: data.message.trim(),
          timestamp: new Date().toISOString(),
          read: false,
        },
        id
      );
      setStatus('sent');
      form.reset();
    } catch (err) {
      setStatus(err instanceof SubmitError && err.message === 'busy' ? 'busy' : 'error');
    }
  };

  const field = (name: Field, type: 'text' | 'email' | 'textarea', autoComplete?: string) => {
    const id = `${uid}-${name}`;
    const errorId = `${id}-error`;
    const error = errors[name];
    const common = {
      id,
      name,
      maxLength: LIMITS[name],
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? errorId : undefined,
      className: s.control,
      onInput: () => error && setErrors((e) => ({ ...e, [name]: undefined })),
    };
    return (
      <div className={`${s.field} ${name === 'message' ? s.wide : ''}`}>
        <label htmlFor={id} className={s.label}>
          {label(name)}
        </label>
        {type === 'textarea' ? (
          <textarea {...common} rows={6} />
        ) : (
          <input {...common} type={type} autoComplete={autoComplete} />
        )}
        {error && (
          <p id={errorId} className={s.error}>
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <form ref={formRef} className={s.form} onSubmit={onSubmit} noValidate>
      {field('name', 'text', 'name')}
      {field('email', 'email', 'email')}
      {field('subject', 'text')}
      {field('message', 'textarea')}
      <div className={s.honeypot} aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className={s.submitRow}>
        <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
          {pick(status === 'sending' ? COPY.contact.sending : COPY.contact.send, lang)}
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </button>
        <div aria-live="polite" className={s.status}>
          {status === 'sent' && <p className={s.ok}>{pick(COPY.contact.success, lang)}</p>}
        </div>
        <div role="alert" className={s.status}>
          {(status === 'error' || status === 'busy' || status === 'preview') && (
            <p className={s.fail}>
              {pick(COPY.contact[status], lang)} <a href={`mailto:${email}`}>{email}</a>
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
