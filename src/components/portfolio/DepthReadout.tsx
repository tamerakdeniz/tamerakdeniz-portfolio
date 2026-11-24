'use client';

import { useEffect, useRef } from 'react';
import { onSceneFrame } from '@/lib/scene-state';

/** Integer metres on the metaphorical 0–60 m scale, written straight to the DOM each frame. */
export function DepthReadout({ scale = 60, source = 'depth' }: { scale?: number; source?: 'depth' | 'hero' }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let last = -1;
    return onSceneFrame((st) => {
      const value = Math.round((source === 'hero' ? st.hero : st.depth) * scale);
      if (value !== last && ref.current) {
        last = value;
        ref.current.textContent = String(value).padStart(2, '0');
      }
    });
  }, [scale, source]);
  return (
    <span ref={ref} className="tabular">
      00
    </span>
  );
}
