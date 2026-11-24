'use client';

import { useEffect, useRef } from 'react';

/** Up to 8px of drift toward a fine pointer. Off for touch, reduced motion and the motion opt-out. */
export function PointerDrift({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine = window.matchMedia('(pointer: fine)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!fine.matches || calm.matches || document.documentElement.dataset.motion === 'off') return;

    let frame = 0;
    let x = 0;
    let y = 0;
    const apply = () => {
      frame = 0;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    };
    const onMove = (event: PointerEvent) => {
      x = (event.clientX / window.innerWidth - 0.5) * 16;
      y = (event.clientY / window.innerHeight - 0.5) * 16;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };
    const onHidden = () => {
      if (document.hidden && frame) {
        window.cancelAnimationFrame(frame);
        frame = 0;
      }
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onHidden);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className} style={{ transition: 'transform 600ms var(--ease-out)' }}>
      {children}
    </div>
  );
}
