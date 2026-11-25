'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react';
import { CHAPTERS, COPY, type ChapterId } from '@/lib/content/copy';
import { OWNER, pick } from '@/lib/content/portfolio';
import { useChapterStore } from '@/lib/chapter-store';
import { setLang, useLang } from '@/lib/lang';
import { onSceneFrame, scene } from '@/lib/scene-state';
import { CommandPalette } from './CommandPalette';
import { DepthReadout } from './DepthReadout';
import { MotionToggle } from './MotionToggle';
import { T } from './T';
import { useDialog } from './useDialog';
import type { ChromeData } from './chrome-types';
import s from './ExpeditionChrome.module.css';

type Mode = 'home' | 'page' | 'resume';
type Chapter = (typeof CHAPTERS)[number];

const noopSubscribe = () => () => {};

function LangToggle({ className }: { className?: string }) {
  const lang = useLang();
  return (
    <div className={`${s.lang} ${className ?? ''}`} role="group" aria-label={pick(COPY.nav.language, lang)}>
      {(['en', 'tr'] as const).map((code) => (
        <button
          key={code}
          type="button"
          className={s.langBtn}
          aria-pressed={lang === code}
          lang={code}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
          <span className="sr-only"> — {code === 'en' ? 'English' : 'Türkçe'}</span>
        </button>
      ))}
    </div>
  );
}

/** Moves to a chapter without a long smooth scroll: the scene is already showing its depth. */
function jumpTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = id === 'surface' ? 0 : el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top, behavior: 'instant' });
  history.pushState(null, '', `#${id}`);
  const heading = el.querySelector<HTMLElement>('h1, h2');
  if (heading) {
    if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
    heading.focus({ preventScroll: true });
  }
}

function ChapterPreview({ id, chrome }: { id: ChapterId; chrome: ChromeData }) {
  if (id === 'about') {
    return (
      <figure className={s.pvPhoto}>
        <Image src={chrome.fieldPhoto} alt="" fill sizes="22rem" className={s.pvImg} />
      </figure>
    );
  }
  if (id === 'work' && chrome.featured.length) {
    return (
      <ul className={s.pvMarks}>
        {chrome.featured.map((p) => (
          <li key={p.slug}>
            <span className={s.pvPrint}>
              {p.image ? (
                <Image src={p.image} alt="" fill sizes="7rem" className={s.pvLogo} />
              ) : (
                <span className={s.pvInitial}>{p.name.en.slice(0, 1)}</span>
              )}
            </span>
            <span className="meta">
              <T v={p.name} />
            </span>
          </li>
        ))}
      </ul>
    );
  }
  const figure =
    id === 'lab'
      ? String(Math.max(0, chrome.archiveCount - chrome.featured.length)).padStart(2, '0')
      : id === 'journey'
        ? chrome.journeySpan
        : id === 'contact'
          ? '@'
          : id === 'engineering'
            ? '{ }'
            : OWNER.monogram;
  return (
    <p className={s.pvFigure} aria-hidden="true">
      {figure}
    </p>
  );
}

function IndexOverlay({
  home,
  modeLink,
  chrome,
  active,
  onClose,
}: {
  home: boolean;
  modeLink: { href: string; label: { en: string; tr: string } };
  chrome: ChromeData;
  active: ChapterId | null;
  onClose: () => void;
}) {
  const lang = useLang();
  const setPaletteOpen = useChapterStore((st) => st.setPaletteOpen);
  const setCvOpen = useChapterStore((st) => st.setCvOpen);
  const [focus, setFocus] = useState<ChapterId>(active ?? 'surface');
  const titleId = useId();
  const currentRef = useRef<HTMLAnchorElement>(null);
  const navigating = useRef(false);
  const ref = useDialog<HTMLDivElement>(true, onClose, () => currentRef.current);

  useEffect(() => {
    if (!home) return;
    const chapter = CHAPTERS.find((c) => c.id === focus);
    if (chapter) scene.preview = chapter.depth / 60;
  }, [focus, home]);

  useEffect(
    () => () => {
      if (!navigating.current) scene.preview = -1;
    },
    []
  );

  const go = (event: React.MouseEvent, chapter: Chapter) => {
    if (!home || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    navigating.current = true;
    onClose();
    window.requestAnimationFrame(() => {
      jumpTo(chapter.id);
      window.requestAnimationFrame(() => {
        scene.preview = -1;
      });
    });
  };

  const focused = CHAPTERS.find((c) => c.id === focus) ?? CHAPTERS[0];

  return (
    <div
      ref={ref}
      id="expedition-index"
      className={`${s.overlay} surface-dark`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-home={home || undefined}
      data-chrome
    >
      <div className={`wrap ${s.overlayBar}`}>
        <span className={s.mark} aria-hidden="true">
          {OWNER.monogram}
        </span>
        <h2 id={titleId} className={`meta ${s.overlayTitle}`}>
          <T v={COPY.nav.indexTitle} />
        </h2>
        <button type="button" className={s.closeBtn} onClick={onClose}>
          <T v={COPY.nav.close} />
          <kbd className={s.kbd}>Esc</kbd>
        </button>
      </div>

      <div className={`wrap ${s.chart}`}>
        <nav aria-label={pick(COPY.nav.chapters, lang)}>
          <ol className={s.chapters}>
            {CHAPTERS.map((c, i) => (
              <li key={c.id} style={{ '--i': i } as React.CSSProperties}>
                <a
                  ref={c.id === (active ?? 'surface') ? currentRef : undefined}
                  href={home ? `#${c.id}` : `/#${c.id}`}
                  className={s.chapter}
                  data-focus={focus === c.id || undefined}
                  aria-current={active === c.id ? 'location' : undefined}
                  onMouseEnter={() => setFocus(c.id)}
                  onFocus={() => setFocus(c.id)}
                  onClick={(e) => go(e, c)}
                >
                  <span className={`${s.cNo} tabular`}>{c.index}</span>
                  <span className={s.cName}>
                    <T v={c.name} />
                  </span>
                  <span className={`${s.cDepth} tabular`}>{String(c.depth).padStart(2, '0')} m</span>
                  {active === c.id && (
                    <span className={`${s.here} meta`}>
                      <T v={COPY.nav.here} />
                    </span>
                  )}
                  <span className={s.cNote}>
                    <T v={COPY.chapterNotes[c.id]} />
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={s.preview} aria-hidden="true">
          <div className={s.pvHead}>
            <span className="meta tabular">{focused.index}</span>
            <span className={`${s.pvDepth} tabular`}>
              {String(focused.depth).padStart(2, '0')}
              <small>m</small>
            </span>
          </div>
          <div className={s.pvBody} key={focused.id}>
            <ChapterPreview id={focused.id} chrome={chrome} />
          </div>
          <p className={`${s.pvNote} serif`}>
            <T v={COPY.chapterNotes[focused.id]} />
          </p>
        </div>
      </div>

      <div className={`wrap ${s.extras}`}>
        <p className={`meta ${s.extrasLabel}`}>
          <T v={COPY.nav.elsewhere} />
        </p>
        <ul className={s.extrasList}>
          <li>
            <Link className="tlink hit" href="/projects" onClick={onClose}>
              <T v={COPY.nav.archive} /> <span className="tabular muted">({chrome.archiveCount})</span>
            </Link>
          </li>
          <li>
            <Link className="tlink hit" href={modeLink.href} onClick={onClose}>
              <T v={modeLink.label} />
            </Link>
          </li>
          <li>
            <a
              className="tlink hit"
              href={chrome.cvUrl}
              target="_blank"
              rel="noopener"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                e.preventDefault();
                onClose();
                window.setTimeout(() => setCvOpen(true), 0);
              }}
            >
              <T v={COPY.nav.cv} />
            </a>
          </li>
          {chrome.hasAssistant && (
            <li>
              <a
                className="tlink hit"
                href={home ? '#assistant' : '/#assistant'}
                onClick={(e) => {
                  if (!home) return;
                  e.preventDefault();
                  navigating.current = true;
                  onClose();
                  window.requestAnimationFrame(() => {
                    history.pushState(null, '', '#assistant');
                    window.dispatchEvent(new HashChangeEvent('hashchange'));
                    jumpTo('lab');
                    scene.preview = -1;
                  });
                }}
              >
                <T v={COPY.nav.askArchive} />
              </a>
            </li>
          )}
          <li>
            <button
              type="button"
              className={`tlink hit ${s.textBtn}`}
              onClick={() => {
                onClose();
                window.setTimeout(() => setPaletteOpen(true), 0);
              }}
            >
              <T v={COPY.nav.search} /> <span className="muted">⌘K</span>
            </button>
          </li>
          <li>
            <MotionToggle className={`tlink hit ${s.textBtn}`} />
          </li>
        </ul>
        <LangToggle />
      </div>
    </div>
  );
}

function CvViewer({ chrome, onClose }: { chrome: ChromeData; onClose: () => void }) {
  const language = useLang();
  const document = chrome.cvVariants?.[language];
  const cvUrl = document?.viewUrl ?? chrome.cvUrl;
  const cvDownloadUrl = document?.downloadUrl ?? chrome.cvDownloadUrl;
  const cvFileName = document?.fileName ?? chrome.cvFileName;
  const titleId = useId();
  const ref = useDialog<HTMLDivElement>(true, onClose);
  const phone = useSyncExternalStore(
    noopSubscribe,
    () => window.matchMedia('(max-width: 767px), (pointer: coarse)').matches,
    () => false
  );
  return (
    <div className={s.cvBackdrop} onClick={(e) => e.target === e.currentTarget && onClose()} data-chrome>
      <div ref={ref} className={`${s.cv} surface-paper`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className={s.cvBar}>
          <h2 id={titleId} className={s.cvTitle}>
            <span className="meta muted">PDF</span> <T v={COPY.cv.title} />{language === 'tr' && !document && chrome.cvLanguage === 'en' ? ' (İngilizce)' : ''}
          </h2>
          <div className={s.cvActions}>
            <a className="btn btn-primary" href={cvDownloadUrl} download={cvFileName}>
              <T v={COPY.cv.download} />
            </a>
            <a className="tlink hit" href={cvUrl} target="_blank" rel="noopener">
              <T v={COPY.cv.openTab} />{' '}
              <span className="arrow arrow-ne" aria-hidden="true">
                ↗
              </span>
            </a>
            <button type="button" className={s.closeBtn} onClick={onClose}>
              <T v={COPY.cv.close} />
              <kbd className={s.kbd}>Esc</kbd>
            </button>
          </div>
        </div>
        {phone ? (
          <div className={s.cvPhone}>
            <p className={s.cvFile}>{cvFileName}</p>
            <p className="muted">
              <T v={COPY.cv.mobile} />
            </p>
          </div>
        ) : (
          <iframe className={s.cvFrame} src={cvUrl} title={cvFileName} />
        )}
      </div>
    </div>
  );
}

function Rail() {
  const lang = useLang();
  const active = useChapterStore((st) => st.active);
  const trackRef = useRef<HTMLOListElement>(null);

  useEffect(
    () =>
      onSceneFrame((st) => {
        trackRef.current?.style.setProperty('--d', st.depth.toFixed(4));
      }),
    []
  );

  return (
    <nav id="depth-rail" className={s.rail} aria-label={pick(COPY.nav.chapters, lang)} data-chrome>
      <p className={s.railReadout} aria-hidden="true">
        <DepthReadout />
        <span className={s.railUnit}>m</span>
      </p>
      <ol ref={trackRef} className={s.railTrack}>
        <li className={s.railMarker} aria-hidden="true" />
        {CHAPTERS.map((c) => (
          <li key={c.id} className={s.railStop} style={{ '--at': c.depth / 60 } as React.CSSProperties}>
            <a href={`#${c.id}`} className={s.stop} aria-current={active === c.id ? 'location' : undefined}>
              <span className={s.stopTick} aria-hidden="true" />
              <span className={`${s.stopLabel} meta`}>
                <span className="tabular">{c.index}</span> <T v={c.name} />
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function ExpeditionChrome({ mode, chrome }: { mode: Mode; chrome: ChromeData }) {
  const home = mode === 'home';
  const active = useChapterStore((st) => st.active);
  const indexOpen = useChapterStore((st) => st.indexOpen);
  const setIndexOpen = useChapterStore((st) => st.setIndexOpen);
  const cvOpen = useChapterStore((st) => st.cvOpen);
  const setCvOpen = useChapterStore((st) => st.setCvOpen);
  const headerRef = useRef<HTMLElement>(null);
  const current = home ? (CHAPTERS.find((c) => c.id === active) ?? CHAPTERS[0]) : null;

  const closeIndex = useCallback(() => setIndexOpen(false), [setIndexOpen]);
  const closeCv = useCallback(() => setCvOpen(false), [setCvOpen]);

  /* On the surface the header sits on the paper sky; below it, on water — or on a paper chapter. */
  useEffect(() => {
    if (!home) return;
    let frame = 0;
    let headerLight = false;
    let railLight = false;
    const onPaper = (x: number, y: number, skip: Element | null) => {
      const hit = document.elementsFromPoint(x, y).find((e) => !skip?.contains(e));
      return !!hit?.closest('.surface-paper');
    };
    return onSceneFrame((st) => {
      const el = headerRef.current;
      const rail = document.getElementById('depth-rail');
      if (!el) return;
      if (frame++ % 6 === 0) {
        headerLight = onPaper(window.innerWidth / 2, 30, el);
        railLight = rail ? onPaper(window.innerWidth - 36, window.innerHeight / 2, rail) : false;
      }
      const previewing = st.preview >= 0;
      const tone = previewing ? 'deep' : st.waterPx > 60 ? 'sky' : headerLight ? 'paper' : 'deep';
      if (el.dataset.tone !== tone) el.dataset.tone = tone;
      const railTone = !previewing && railLight ? 'light' : 'deep';
      if (rail && rail.dataset.tone !== railTone) rail.dataset.tone = railTone;
    });
  }, [home]);

  /* Any link marked data-cv-link opens the in-page viewer; modified clicks keep the new tab. */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const link = (e.target as Element | null)?.closest?.('a[data-cv-link]');
      if (!link) return;
      e.preventDefault();
      setCvOpen(true);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [setCvOpen]);

  const modeLink =
    mode === 'resume'
      ? { href: '/', label: COPY.nav.explore, short: COPY.nav.exploreShort }
      : { href: '/resume', label: COPY.nav.recruiter, short: COPY.nav.recruiterShort };

  const indexButton = (className: string) => (
    <button
      type="button"
      className={className}
      aria-expanded={indexOpen}
      aria-controls="expedition-index"
      onClick={() => setIndexOpen(true)}
    >
      <span className={`${s.ixNo} tabular`} aria-hidden="true">
        {current?.index ?? '≡'}
      </span>
      <span className={s.ixLabel}>{current ? <T v={current.name} /> : <T v={COPY.nav.index} />}</span>
      <span className={s.ixGlyph} aria-hidden="true">
        <i />
        <i />
      </span>
      <span className="sr-only">
        <T v={COPY.nav.openIndex} />
      </span>
    </button>
  );

  return (
    <>
      <header
        ref={headerRef}
        className={s.header}
        data-tone={home ? 'sky' : mode === 'resume' ? 'paper' : 'deep'}
        data-chrome
      >
        <div className={`wrap ${s.bar}`}>
          <Link href="/" className={s.wordmark}>
            <span className={s.mark}>
              {OWNER.monogram}
            </span>
            <span className={s.fullName}>
              {chrome.ownerName}
            </span>
          </Link>
          {!home && (
            <Link href="/" className={`${s.back} ${s.desktopOnly}`}>
              <span aria-hidden="true">← </span>
              <T v={COPY.nav.backToExpedition} />
            </Link>
          )}
          <div className={s.tools}>
            <Link className={`${s.tool} ${s.modeTool}`} href={modeLink.href}>
              <span className={s.desktopOnly}>
                <T v={modeLink.label} />
              </span>
              <span className={s.mobileOnly}>
                <T v={modeLink.short} />
              </span>
            </Link>
            <a className={`${s.tool} ${s.cvTool}`} href={chrome.cvUrl} target="_blank" rel="noopener" data-cv-link>
              <T v={COPY.nav.cv} />
              <span className="arrow arrow-ne" aria-hidden="true">
                ↗
              </span>
            </a>
            <LangToggle />
            {indexButton(`${s.indexBtn} ${s.desktopOnly}`)}
          </div>
        </div>
      </header>

      {indexButton(`${s.thumb} ${s.mobileOnly}`)}
      {home && <Rail />}

      {indexOpen && (
        <IndexOverlay home={home} modeLink={modeLink} chrome={chrome} active={home ? active : null} onClose={closeIndex} />
      )}
      {cvOpen && <CvViewer chrome={chrome} onClose={closeCv} />}
      <CommandPalette chrome={chrome} />
    </>
  );
}
