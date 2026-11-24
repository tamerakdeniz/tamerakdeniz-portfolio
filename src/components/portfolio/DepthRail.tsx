'use client';

import { useEffect, useRef } from 'react';
import { CHAPTERS, COPY } from '@/lib/content/copy';
import { pick } from '@/lib/content/portfolio';
import { useChapterStore } from '@/lib/chapter-store';
import { useLang } from '@/lib/lang';
import { T } from './T';
import s from './DepthRail.module.css';

interface Measured {
  id: (typeof CHAPTERS)[number]['id'];
  depth: number;
  top: number;
}

/** Metaphorical depth: chapter index × 10 m plus progress through the chapter. Not a measurement. */
export function DepthRail() {
  const lang = useLang();
  const active = useChapterStore((st) => st.active);
  const setActive = useChapterStore((st) => st.setActive);
  const readoutRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    let chapters: Measured[] = [];

    const measure = () => {
      chapters = CHAPTERS.flatMap((c) => {
        const el = document.getElementById(c.id);
        if (!el) return [];
        return [{ id: c.id, depth: c.depth, top: el.getBoundingClientRect().top + window.scrollY }];
      });
      const track = trackRef.current;
      if (track) track.style.setProperty('--track', `${track.clientHeight}px`);
    };

    const update = () => {
      frame = 0;
      if (chapters.length === 0) return;
      const offset = window.innerHeight * 0.4;
      const probe = window.scrollY + offset * Math.min(1, window.scrollY / offset);
      const atBottom =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4;

      let index = 0;
      for (let i = 0; i < chapters.length; i++) if (chapters[i].top <= probe) index = i;
      if (atBottom) index = chapters.length - 1;

      const current = chapters[index];
      const next = chapters[index + 1];
      let depth = current.depth;
      if (index === chapters.length - 1) depth = 60;
      else if (next) depth += Math.min(1, Math.max(0, (probe - current.top) / (next.top - current.top))) * 10;
      depth = Math.min(60, Math.max(0, depth));

      if (readoutRef.current) readoutRef.current.textContent = String(Math.round(depth)).padStart(2, '0');
      trackRef.current?.style.setProperty('--d', String(depth / 60));
      setActive(current.id);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    measure();
    update();
    const observer = new ResizeObserver(() => {
      measure();
      schedule();
    });
    observer.observe(document.body);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      setActive(null);
    };
  }, [setActive]);

  const activeChapter = CHAPTERS.find((c) => c.id === active) ?? CHAPTERS[0];

  return (
    <nav className={`${s.rail} surface-dark`} aria-label={pick(COPY.nav.chapters, lang)} data-chrome>
      <div className={s.readout} aria-hidden="true">
        <span className={`${s.depth} tabular`}>
          <span ref={readoutRef}>00</span>
          <span className={s.unit}>m</span>
        </span>
        <span className={`${s.name} meta`}>
          <T v={activeChapter.name} />
        </span>
      </div>
      <div ref={trackRef} className={s.track}>
        <span className={s.marker} aria-hidden="true" />
        <ol className={s.ticks}>
          {CHAPTERS.map((c) => (
            <li key={c.id} style={{ '--at': c.depth / 60 } as React.CSSProperties}>
              <a
                href={`#${c.id}`}
                className={s.tick}
                aria-current={active === c.id ? 'location' : undefined}
              >
                <span className={`${s.tickLabel} meta`}>
                  <span className="tabular">{c.index}</span> <T v={c.name} />
                </span>
                <span className={`${s.tickDepth} tabular`} aria-hidden="true">
                  {String(c.depth).padStart(2, '0')}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
