'use client';

import { useEffect, useRef, useState } from 'react';
import { COPY } from '@/lib/content/copy';
import { T } from './T';
import s from './ContactSignal.module.css';

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <button
      type="button"
      className={s.copy}
      data-copied={copied || undefined}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(email);
          setCopied(true);
          window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setCopied(false), 2200);
        } catch {
          window.location.href = `mailto:${email}`;
        }
      }}
    >
      <span aria-live="polite">{copied ? <T v={COPY.contact.copied} /> : <T v={COPY.contact.copy} />}</span>
    </button>
  );
}

/** The ascent: scrolls back to the surface (smoothly, so the water rises past) and focuses the hero. */
export function Ascend() {
  return (
    <a
      href="#surface"
      className={s.ascend}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        const smooth = document.documentElement.dataset.fx === 'on';
        window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
        history.pushState(null, '', '#surface');
        const h1 = document.querySelector<HTMLElement>('#surface h1');
        if (h1) {
          h1.tabIndex = -1;
          window.setTimeout(() => h1.focus({ preventScroll: true }), smooth ? 1200 : 0);
        }
      }}
    >
      <span className={s.ascendRing} aria-hidden="true">
        ↑
      </span>
      <span className={s.ascendText}>
        <T v={COPY.contact.ascend} />
        <span className={`${s.ascendDepth} meta tabular`} aria-hidden="true">
          60 m → 00 m
        </span>
      </span>
    </a>
  );
}
