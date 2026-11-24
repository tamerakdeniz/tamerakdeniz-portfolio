'use client';

import { useEffect, useRef } from 'react';

/**
 * Marks its element `data-armed` once JS runs and `data-inview` when it enters the viewport.
 * CSS only hides armed-but-not-yet-seen content, so nothing is lost if scripts never load.
 */
export function InView({
  className,
  children,
  threshold = 0.3,
  style,
}: {
  className?: string;
  children: React.ReactNode;
  threshold?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.armed = '';
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.inview = '';
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
