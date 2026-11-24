'use client';

import { useEffect, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Modal behaviour for a container: traps Tab, closes on Escape, locks page scroll
 * while open and returns focus to whatever opened it.
 */
export function useDialog<T extends HTMLElement>(
  open: boolean,
  onClose: () => void,
  initialFocus?: () => HTMLElement | null
) {
  const ref = useRef<T>(null);
  const closeRef = useRef(onClose);
  const initialRef = useRef(initialFocus);

  useEffect(() => {
    closeRef.current = onClose;
    initialRef.current = initialFocus;
  });

  useEffect(() => {
    if (!open) return;
    const container = ref.current;
    if (!container) return;

    const opener = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';

    const first =
      initialRef.current?.() ?? container.querySelector<HTMLElement>(FOCUSABLE) ?? container;
    first.focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const firstItem = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === firstItem) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      root.style.overflow = previousOverflow;
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open]);

  return ref;
}
