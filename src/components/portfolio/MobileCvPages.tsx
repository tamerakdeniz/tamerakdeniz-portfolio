'use client';

import { useEffect, useRef, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { COPY } from '@/lib/content/copy';
import { pick } from '@/lib/content/portfolio';
import { useLang } from '@/lib/lang';
import { T } from './T';
import s from './ExpeditionChrome.module.css';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

export type CvViewerPhase = 'loading' | 'ready' | 'error';

function clampZoom(value: number): number {
  const stepped = Math.round(value * 100) / 100;
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, stepped));
}

function isRenderCancel(error: unknown): boolean {
  if (!error || typeof error !== 'object' || !('name' in error)) return false;
  return error.name === 'AbortError' || error.name === 'RenderingCancelledException';
}

export function MobileCvPages({
  src,
  fileName,
  onPhase,
}: {
  src: string;
  fileName: string;
  onPhase: (phase: CvViewerPhase) => void;
}) {
  const lang = useLang();
  const stageRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<CvViewerPhase>(src ? 'loading' : 'error');
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [width, setWidth] = useState(0);
  const [data, setData] = useState<ArrayBuffer | null>(null);
  const [docTick, setDocTick] = useState(0);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);

  useEffect(() => {
    onPhase(phase);
  }, [onPhase, phase]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      const style = getComputedStyle(stage);
      const pad = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
      const next = Math.floor(stage.clientWidth - pad);
      setWidth((prev) => (prev === 0 || Math.abs(prev - next) > 8 ? Math.max(0, next) : prev));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    void import('./render-cv-pdf');
  }, []);

  useEffect(() => {
    const pages = pagesRef.current;
    pages?.replaceChildren();
    if (!src) return;

    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(src, { signal: controller.signal });
        if (!response.ok) throw new Error('unavailable');
        const buffer = await response.arrayBuffer();
        const magic = new TextDecoder().decode(buffer.slice(0, 5));
        if (magic !== '%PDF-') throw new Error('invalid');
        if (!controller.signal.aborted) setData(buffer);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setData(null);
        setPhase('error');
      }
    })();

    return () => controller.abort();
  }, [src]);

  useEffect(() => {
    if (!data) {
      pdfRef.current = null;
      return;
    }
    const controller = new AbortController();
    let destroy: (() => Promise<void>) | null = null;
    void (async () => {
      try {
        const { openPdf } = await import('./render-cv-pdf');
        if (controller.signal.aborted) return;
        const opened = await openPdf(data, controller.signal);
        if (controller.signal.aborted) {
          await opened.destroy();
          return;
        }
        destroy = opened.destroy;
        pdfRef.current = opened.pdf;
        setDocTick((tick) => tick + 1);
      } catch (error) {
        if (controller.signal.aborted || isRenderCancel(error)) return;
        setPhase('error');
      }
    })();
    return () => {
      controller.abort();
      pdfRef.current = null;
      void destroy?.();
    };
  }, [data]);

  useEffect(() => {
    const pdf = pdfRef.current;
    const pages = pagesRef.current;
    if (!pdf || !pages || width < 160) return;
    const controller = new AbortController();
    let active = true;

    void (async () => {
      try {
        const { paintPdfPages } = await import('./render-cv-pdf');
        if (!active || controller.signal.aborted) return;
        await paintPdfPages(pdf, { container: pages, width, zoom, signal: controller.signal });
        if (!active || controller.signal.aborted) return;
        setPhase('ready');
      } catch (error) {
        if (!active || controller.signal.aborted || isRenderCancel(error)) return;
        pages.replaceChildren();
        setPhase('error');
      }
    })();

    return () => {
      active = false;
      controller.abort();
    };
  }, [docTick, width, zoom]);

  const percent = `${Math.round(zoom * 100)}%`;

  return (
    <div className={s.cvStage}>
      {phase !== 'error' && (
        <div className={s.cvZoom} role="group" aria-label={pick(COPY.cv.zoom, lang)}>
          <button
            type="button"
            data-cv-zoom="out"
            onClick={() => setZoom((value) => clampZoom(value - ZOOM_STEP))}
            disabled={phase !== 'ready' || zoom <= MIN_ZOOM}
            aria-label={pick(COPY.cv.zoomOut, lang)}
          >
            −
          </button>
          <button
            type="button"
            data-cv-zoom="fit"
            onClick={() => setZoom(MIN_ZOOM)}
            disabled={phase !== 'ready' || zoom === MIN_ZOOM}
            aria-label={pick(COPY.cv.zoomFit, lang)}
          >
            {percent}
          </button>
          <button
            type="button"
            data-cv-zoom="in"
            onClick={() => setZoom((value) => clampZoom(value + ZOOM_STEP))}
            disabled={phase !== 'ready' || zoom >= MAX_ZOOM}
            aria-label={pick(COPY.cv.zoomIn, lang)}
          >
            +
          </button>
        </div>
      )}
      <div ref={stageRef} className={s.cvPages} data-cv-pages aria-busy={phase === 'loading'}>
        {phase !== 'ready' && (
          <div className={s.cvStatus}>
            <p className={s.cvFile}>{fileName}</p>
            <p className="muted">
              <T v={phase === 'error' ? COPY.cv.unavailable : COPY.cv.loading} />
            </p>
          </div>
        )}
        <div ref={pagesRef} />
      </div>
    </div>
  );
}
