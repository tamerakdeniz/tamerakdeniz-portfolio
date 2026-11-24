'use client';

import { useSyncExternalStore } from 'react';
import { MOTION_STORAGE_KEY } from '@/lib/lang-boot';
import { T } from './T';

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  return () => observer.disconnect();
}

const read = () => document.documentElement.dataset.motion !== 'off';

export function MotionToggle({ className }: { className?: string }) {
  const on = useSyncExternalStore(subscribe, read, () => true);

  const toggle = () => {
    const root = document.documentElement;
    if (on) root.dataset.motion = 'off';
    else delete root.dataset.motion;
    try {
      localStorage.setItem(MOTION_STORAGE_KEY, on ? 'off' : 'on');
    } catch {
      /* private mode */
    }
  };

  return (
    <button type="button" className={className} aria-pressed={!on} onClick={toggle}>
      <T v={{ en: 'Reduce motion', tr: 'Hareketi azalt' }} />
    </button>
  );
}
