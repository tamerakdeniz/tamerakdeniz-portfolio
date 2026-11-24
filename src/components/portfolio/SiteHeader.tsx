'use client';

import Link from 'next/link';
import { useCallback, useState, useSyncExternalStore } from 'react';
import { CHAPTERS, COPY } from '@/lib/content/copy';
import { OWNER, pick } from '@/lib/content/portfolio';
import { useChapterStore } from '@/lib/chapter-store';
import { setLang, useLang } from '@/lib/lang';
import { T } from './T';
import { useDialog } from './useDialog';
import { CommandPalette } from './CommandPalette';
import type { ChromeData } from './chrome-types';
import s from './SiteHeader.module.css';

type Mode = 'home' | 'page' | 'resume';

const noopSubscribe = () => () => {};

const NAV = [
  { id: 'work', label: COPY.nav.work },
  { id: 'about', label: COPY.nav.about },
  { id: 'lab', label: COPY.nav.lab },
  { id: 'contact', label: COPY.nav.contact },
] as const;

function LangToggle({ className }: { className?: string }) {
  const lang = useLang();
  return (
    <div className={`${s.lang} ${className ?? ''}`} role="group" aria-label={pick(COPY.nav.language, lang)}>
      {(['en', 'tr'] as const).map((code) => (
        <button
          key={code}
          type="button"
          className={s.langBtn}
          data-code={code}
          aria-pressed={lang === code}
          lang={code}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function SiteHeader({ mode, chrome }: { mode: Mode; chrome: ChromeData }) {
  const lang = useLang();
  const active = useChapterStore((st) => st.active);
  const setPaletteOpen = useChapterStore((st) => st.setPaletteOpen);
  const [menuOpen, setMenuOpen] = useState(false);
  const isMac = useSyncExternalStore(
    noopSubscribe,
    () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent),
    () => false
  );
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const menuRef = useDialog<HTMLDivElement>(menuOpen, closeMenu);

  const href = (id: string) => (mode === 'home' ? `#${id}` : `/#${id}`);
  const activeChapter = mode === 'home' ? CHAPTERS.find((c) => c.id === active) : undefined;
  const paper = mode === 'resume';
  const modeLink =
    mode === 'resume'
      ? { href: '/', label: COPY.nav.explore, short: COPY.nav.exploreShort }
      : { href: '/resume', label: COPY.nav.recruiter, short: COPY.nav.recruiterShort };

  return (
    <>
      <header
        className={`${s.header} ${paper ? 'surface-paper' : 'surface-dark'} ${paper ? s.paper : ''}`}
        data-chrome
      >
        <div className={`wrap ${s.bar}`}>
          <div className={s.brand}>
            <Link href="/" className={s.wordmark} aria-label={`${OWNER.fullName} — home`}>
              <span className={s.mono} aria-hidden="true">
                {OWNER.monogram}
              </span>
              <span className={s.fullName}>{OWNER.fullName}</span>
            </Link>
            {activeChapter && (
              <span className={`${s.chapterTag} meta`} aria-hidden="true">
                <span className="tabular">{activeChapter.index}</span>{' '}
                <span className={s.tagName}>
                  <T v={activeChapter.name} />
                </span>
                <span className={`${s.tagDepth} tabular`}>· {String(activeChapter.depth).padStart(2, '0')} m</span>
              </span>
            )}
          </div>

          <nav className={s.nav} aria-label={pick(COPY.nav.primary, lang)}>
            <ul>
              {NAV.map((item) => (
                <li key={item.id}>
                  <Link
                    href={href(item.id)}
                    className={s.navLink}
                    aria-current={mode === 'home' && active === item.id ? 'location' : undefined}
                  >
                    <T v={item.label} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={s.tools}>
            <button
              type="button"
              className={s.search}
              onClick={() => setPaletteOpen(true)}
              aria-keyshortcuts={isMac ? 'Meta+K' : 'Control+K'}
            >
              <T v={COPY.nav.search} />
              <kbd className={s.kbd}>{isMac ? '⌘K' : 'Ctrl K'}</kbd>
            </button>
            <LangToggle className={s.desktopOnly} />
            <a className={`${s.toolLink} ${s.desktopOnly}`} href={chrome.cvUrl} target="_blank" rel="noopener">
              <T v={COPY.nav.cv} /> <span className="arrow arrow-ne" aria-hidden="true">↗</span>
            </a>
            <Link className={`${s.mode} ${s.desktopOnly}`} href={modeLink.href}>
              <T v={modeLink.label} />
            </Link>
            <Link className={`${s.mode} ${s.mobileOnly}`} href={modeLink.href}>
              <T v={modeLink.short} />
            </Link>
            <button
              type="button"
              className={`${s.menuBtn} ${s.mobileOnly}`}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => setMenuOpen(true)}
            >
              <span className={s.menuGlyph} aria-hidden="true" />
              <T v={COPY.nav.menu} />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          ref={menuRef}
          id="site-menu"
          className={`${s.menu} surface-dark`}
          role="dialog"
          aria-modal="true"
          aria-label={pick(COPY.nav.menu, lang)}
          data-chrome
        >
          <div className={`wrap ${s.menuBar}`}>
            <span className={s.mono} aria-hidden="true">
              {OWNER.monogram}
            </span>
            <button type="button" className={s.menuBtn} onClick={closeMenu}>
              <T v={COPY.nav.close} />
            </button>
          </div>
          <nav className={`wrap ${s.menuNav}`} aria-label={pick(COPY.nav.chapters, lang)}>
            <ol>
              {CHAPTERS.map((c) => (
                <li key={c.id}>
                  <Link href={href(c.id)} onClick={closeMenu} className={s.menuLink}>
                    <span className="meta tabular">{c.index}</span>
                    <span className={s.menuName}>
                      <T v={c.name} />
                    </span>
                    <span className="meta tabular muted">{c.depth} m</span>
                  </Link>
                </li>
              ))}
            </ol>
            <div className={s.menuFoot}>
              <LangToggle />
              <a className="tlink hit" href={chrome.cvUrl} target="_blank" rel="noopener">
                <T v={COPY.nav.cv} /> <span className="arrow arrow-ne" aria-hidden="true">↗</span>
              </a>
              <Link className="tlink hit" href="/projects" onClick={closeMenu}>
                <T v={COPY.nav.archive} />
              </Link>
              <button
                type="button"
                className={`tlink hit ${s.textBtn}`}
                onClick={() => {
                  closeMenu();
                  window.setTimeout(() => setPaletteOpen(true), 0);
                }}
              >
                <T v={COPY.nav.search} />
              </button>
            </div>
          </nav>
        </div>
      )}

      <CommandPalette chrome={chrome} />
    </>
  );
}
