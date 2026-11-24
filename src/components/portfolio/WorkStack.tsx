'use client';

import { useRef } from 'react';

const PINNED = '(min-width: 1024px) and (min-height: 720px)';

/**
 * The pinned plate stack. ScrollDirector writes `--p` (data-scrub="pin"); CSS turns it into
 * each plate's reveal. When keyboard focus enters a plate that is still masked, scroll to
 * the point where that plate is fully revealed.
 */
export function WorkStack({
  count,
  className,
  children,
}: {
  count: number;
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || count < 2) return;
    if (document.documentElement.dataset.fx !== 'on' || !window.matchMedia(PINNED).matches) return;
    const plate = (e.target as HTMLElement).closest<HTMLElement>('[data-plate-i]');
    if (!plate) return;
    const i = Number(plate.dataset.plateI);
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    const target = Math.round(top + (i / (count - 1)) * travel);
    if (Math.abs(window.scrollY - target) > 4) window.scrollTo({ top: target, behavior: 'instant' });
  };

  return (
    <div
      ref={ref}
      className={className}
      data-scrub="pin"
      style={{ '--n': count } as React.CSSProperties}
      onFocus={onFocus}
    >
      {children}
    </div>
  );
}
