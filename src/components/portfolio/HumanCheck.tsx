'use client';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { SNAPSHOT_PREVIEW, USE_EMULATORS } from '@/lib/firebase-config';

declare global {
  interface Window { turnstile?: { render: (element: HTMLElement, options: Record<string, unknown>) => string; remove: (id: string) => void } }
}

/** Production challenge only. Emulator tokens are accepted only by fixed demo configuration. */
export function HumanCheck({ action, onToken }: { action: 'contact' | 'chat'; onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  useEffect(() => {
    if (!ready || !container.current || !window.turnstile || !key) return;
    const api = window.turnstile;
    const id = api.render(container.current, { sitekey: key, action, callback: onToken, 'expired-callback': () => onToken(''), 'error-callback': () => onToken(''), theme: 'auto' });
    return () => api.remove(id);
  }, [ready, key, action, onToken]);
  if (USE_EMULATORS || SNAPSHOT_PREVIEW || !key) return null;
  return <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={() => setReady(true)} /><div ref={container} /></>;
}
