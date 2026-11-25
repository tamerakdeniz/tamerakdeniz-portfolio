'use client';

import { useEffect, useRef } from 'react';

/** Muted loop that plays only while visible and only when motion is allowed. */
export function MotionVideo(props: { src: string; poster?: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const allowed = () => !document.hidden && !reduced.matches && document.documentElement.dataset.motion !== 'off';
    let visible = false;
    const sync = () => {
      if (visible && allowed()) void video.play().catch(() => {});
      else video.pause();
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(video);
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
    return () => {
      io.disconnect();
      observer.disconnect();
      video.pause();
      reduced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={props.className}
      src={props.src}
      poster={props.poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={props.label}
    />
  );
}
