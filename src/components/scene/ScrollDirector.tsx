'use client';

import { useEffect } from 'react';
import { CHAPTERS } from '@/lib/content/copy';
import { useChapterStore } from '@/lib/chapter-store';
import { emitSceneFrame, motionAllowed, scene } from '@/lib/scene-state';

interface Chapter {
  id: (typeof CHAPTERS)[number]['id'];
  top: number;
}

interface Scrub {
  el: HTMLElement;
  top: number;
  height: number;
  mode: 'view' | 'pin';
  last: number;
}

interface CutTarget {
  el: HTMLElement;
  offset: number;
  shift: number;
}

interface Hero {
  el: HTMLElement;
  top: number;
  height: number;
  stageHeight: number;
  marker: number;
  cuts: CutTarget[];
}

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

/**
 * The one loop on the home page. Reads native scroll and pointer, derives chapter depth,
 * hero descent and per-element scrub progress, then notifies the scene and instruments.
 * It never sets scroll position and never prevents default scrolling.
 */
export function ScrollDirector() {
  const setActive = useChapterStore((st) => st.setActive);

  useEffect(() => {
    const root = document.documentElement;
    let chapters: Chapter[] = [];
    let scrubs: Scrub[] = [];
    let hero: Hero | null = null;
    let poster: HTMLElement | null = null;
    let oceanLayer: HTMLElement | null = null;
    let vh = window.innerHeight;
    let sceneHeight = vh;
    let frame = 0;
    let running = false;
    let lastY = window.scrollY;
    let fx = motionAllowed();
    let cancelled = false;
    const pointerTarget = { x: scene.pointer.x, y: scene.pointer.y };

    const applyFx = () => {
      fx = motionAllowed();
      if (fx) root.dataset.fx = 'on';
      else delete root.dataset.fx;
    };

    const measure = () => {
      vh = Math.max(1, window.innerHeight);
      oceanLayer = document.querySelector<HTMLElement>('.ocean-layer');
      sceneHeight = Math.max(1, oceanLayer?.clientHeight || vh);
      const sy = window.scrollY;
      chapters = CHAPTERS.flatMap((c) => {
        const el = document.getElementById(c.id);
        return el ? [{ id: c.id, top: el.getBoundingClientRect().top + sy }] : [];
      });
      scrubs = Array.from(document.querySelectorAll<HTMLElement>('[data-scrub]')).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          el,
          top: r.top + sy,
          height: r.height,
          mode: el.dataset.scrub === 'pin' ? 'pin' : 'view',
          last: -1,
        };
      });
      poster = document.querySelector<HTMLElement>('.ocean-poster');
      const heroEl = document.querySelector<HTMLElement>('[data-hero]');
      const stage = heroEl?.querySelector<HTMLElement>('[data-hero-stage]');
      const marker = heroEl?.querySelector<HTMLElement>('[data-waterline]');
      if (heroEl && stage && marker) {
        const hr = heroEl.getBoundingClientRect();
        const sr = stage.getBoundingClientRect();
        const lifted = Number.parseFloat(heroEl.style.getPropertyValue('--rise')) || 0;
        hero = {
          el: heroEl,
          top: hr.top + sy,
          height: hr.height,
          stageHeight: Math.max(1, sr.height),
          marker: marker.getBoundingClientRect().top - sr.top,
          cuts: Array.from(heroEl.querySelectorAll<HTMLElement>('[data-cut]')).map((el) => {
            const shift = Number(el.dataset.cutShift) || 0;
            /* Measured while possibly lifted: remove the current lift to get the resting offset. */
            return { el, shift, offset: el.getBoundingClientRect().top - sr.top + lifted * shift };
          }),
        };
      } else hero = null;
    };

    const update = () => {
      const y = window.scrollY;
      const delta = (y - lastY) / vh;
      lastY = y;
      scene.velocity += (delta - scene.velocity) * 0.2;
      scene.scroll = y / vh;

      /*
       * Hero: `.stage` uses `100svh` (`hero.stageHeight`), whereas `.ocean-layer` uses `100lvh`
       * (`sceneHeight`). On Android Chrome with dynamic toolbars `100svh < 100lvh`; normalizing
       * `scene.water` by `sceneHeight` keeps the WebGL waterline locked to the exact CSS `--cut`
       * pixel coordinate at load and throughout toolbar resize.
       */
      if (hero) {
        const sh = hero.stageHeight;
        const travel = Math.max(1, hero.height - sh);
        const h = fx ? clamp((y - hero.top) / travel) : 0;
        scene.hero = h;
        const stageTop =
          y <= hero.top ? hero.top - y : fx ? Math.min(0, hero.top + hero.height - sh - y) : hero.top - y;
        const startWater = hero.marker;
        const rise = fx ? (startWater + 0.08 * sh) / 0.34 : 0;
        const waterInStage = startWater - h * rise;
        const lift = fx ? h * sh : 0;
        const waterPx = stageTop + waterInStage;
        scene.waterPx = waterPx;
        scene.water = waterPx / sceneHeight;
        for (const c of hero.cuts) {
          const offset = c.offset - lift * c.shift;
          c.el.style.setProperty('--cut', `${(waterInStage - offset).toFixed(1)}px`);
        }
        hero.el.style.setProperty('--hero', h.toFixed(4));
        hero.el.style.setProperty('--rise', `${lift.toFixed(1)}px`);
      } else {
        scene.waterPx = -1000;
        scene.water = -1;
      }

      /* Depth: chapter index plus progress to the next chapter, normalized to 0–1. */
      if (chapters.length) {
        const probe = y + vh * 0.45;
        const atBottom = y + vh >= document.documentElement.scrollHeight - 4;
        let index = 0;
        for (let i = 0; i < chapters.length; i++) if (chapters[i].top <= probe) index = i;
        if (atBottom) index = chapters.length - 1;
        const cur = chapters[index];
        const next = chapters[index + 1];
        const last = chapters.length - 1;
        const local = next ? clamp((probe - cur.top) / (next.top - cur.top)) : 0;
        scene.depth = index >= last ? 1 : clamp((index + local) / last);
        poster?.style.setProperty('--depth', scene.depth.toFixed(3));
        setActive(cur.id);
      }

      if (fx) {
        for (const s of scrubs) {
          const top = s.top - y;
          if (top > vh * 1.2 || top + s.height < -vh * 0.2) continue;
          const p =
            s.mode === 'pin'
              ? clamp(-top / Math.max(1, s.height - vh))
              : clamp((vh - top) / (vh + s.height));
          if (Math.abs(p - s.last) > 0.0005) {
            s.last = p;
            s.el.style.setProperty('--p', p.toFixed(4));
          }
        }
      }

      scene.pointer.x += (pointerTarget.x - scene.pointer.x) * 0.055;
      scene.pointer.y += (pointerTarget.y - scene.pointer.y) * 0.055;
      scene.energy *= 0.965;
      emitSceneFrame();
    };

    const remeasure = () => {
      if (cancelled) return;
      measure();
      update();
    };

    const loop = () => {
      update();
      frame = running ? window.requestAnimationFrame(loop) : 0;
    };

    const start = () => {
      if (running || document.hidden) return;
      running = true;
      frame = window.requestAnimationFrame(loop);
    };

    const stop = () => {
      running = false;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };

    const onScroll = () => {
      scene.lastInput = performance.now();
      if (!running && !frame)
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          update();
        });
    };

    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === 'touch' && e.type === 'pointermove' && !e.isPrimary) return;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      const moved = Math.hypot(nx - pointerTarget.x, ny - pointerTarget.y);
      pointerTarget.x = nx;
      pointerTarget.y = ny;
      scene.energy = Math.min(1, scene.energy + moved * 1.6);
      scene.lastInput = performance.now();
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else {
        remeasure();
        if (fx) start();
      }
    };

    const onAttrChange = () => {
      applyFx();
      measure();
      if (fx) start();
      else {
        stop();
        scrubs.forEach((s) => s.el.style.removeProperty('--p'));
        update();
      }
    };

    applyFx();
    measure();
    update();
    if (fx) start();

    const ro = new ResizeObserver(remeasure);
    ro.observe(document.body);
    const stageEl = document.querySelector<HTMLElement>('[data-hero-stage]');
    const layerEl = document.querySelector<HTMLElement>('.ocean-layer');
    const titleEl = document.getElementById('hero-title');
    if (stageEl) ro.observe(stageEl);
    if (layerEl) ro.observe(layerEl);
    if (titleEl) ro.observe(titleEl);

    const fonts = document.fonts;
    fonts?.ready?.then(remeasure).catch(() => {});
    fonts?.addEventListener?.('loadingdone', remeasure);

    const vv = window.visualViewport;
    window.addEventListener('resize', remeasure, { passive: true });
    vv?.addEventListener('resize', remeasure, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', onAttrChange);
    const mo = new MutationObserver(onAttrChange);
    mo.observe(root, { attributes: true, attributeFilter: ['data-motion', 'lang'] });

    return () => {
      cancelled = true;
      stop();
      ro.disconnect();
      mo.disconnect();
      fonts?.removeEventListener?.('loadingdone', remeasure);
      mq.removeEventListener('change', onAttrChange);
      window.removeEventListener('resize', remeasure);
      vv?.removeEventListener('resize', remeasure);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      setActive(null);
    };
  }, [setActive]);

  return null;
}
