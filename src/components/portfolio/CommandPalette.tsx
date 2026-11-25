'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { CHAPTERS, COPY } from '@/lib/content/copy';
import { pick, type Lang, type Loc } from '@/lib/content/portfolio';
import { useChapterStore } from '@/lib/chapter-store';
import { setLang, useLang } from '@/lib/lang';
import { useDialog } from './useDialog';
import type { ChromeData } from './chrome-types';
import s from './CommandPalette.module.css';

interface Item {
  id: string;
  group: Loc;
  label: string;
  hint?: string;
  run: () => void;
}

function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
}

function normalize(text: string) {
  return text
    .toLocaleLowerCase('tr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i');
}

export function CommandPalette({ chrome }: { chrome: ChromeData }) {
  const open = useChapterStore((st) => st.paletteOpen);
  const setOpen = useChapterStore((st) => st.setPaletteOpen);
  const lang = useLang();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const [notice, setNotice] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setCursor(0);
  }, [setOpen]);

  const dialogRef = useDialog<HTMLDivElement>(open, close, () => inputRef.current);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return;
      if (!useChapterStore.getState().paletteOpen && isTyping(event.target)) return;
      event.preventDefault();
      setOpen(!useChapterStore.getState().paletteOpen);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setOpen]);

  const items = useMemo<Item[]>(() => {
    const go = (href: string) => () => {
      close();
      router.push(href);
    };
    const chapterHref = (id: string) => (pathname === '/' ? `#${id}` : `/#${id}`);
    const tr = (v: Loc, l: Lang = lang) => pick(v, l);

    return [
      ...CHAPTERS.map((c) => ({
        id: `chapter-${c.id}`,
        group: COPY.palette.chapters,
        label: `${c.index} — ${tr(c.name)}`,
        hint: `${c.depth} m`,
        run: go(chapterHref(c.id)),
      })),
      { id: 'page-archive', group: COPY.palette.pages, label: tr(COPY.nav.archive), hint: '/projects', run: go('/projects') },
      { id: 'page-about', group: COPY.palette.pages, label: tr(COPY.nav.about), hint: '/about', run: go('/about') },
      { id: 'page-resume', group: COPY.palette.pages, label: tr(COPY.nav.recruiter), hint: '/resume', run: go('/resume') },
      ...chrome.projects.map((p) => ({
        id: `project-${p.slug}`,
        group: COPY.palette.projects,
        label: tr(p.name),
        hint: String(p.number).padStart(2, '0'),
        run: go(`/projects/${p.slug}`),
      })),
      {
        id: 'action-cv',
        group: COPY.palette.actions,
        label: tr(COPY.palette.openCv) + (lang === 'tr' && !chrome.cvVariants?.tr && chrome.cvLanguage === 'en' ? ' (İngilizce)' : ''),
        run: () => {
          close();
          window.open(chrome.cvVariants?.[lang]?.viewUrl ?? chrome.cvUrl, '_blank', 'noopener');
        },
      },
      {
        id: 'action-email',
        group: COPY.palette.actions,
        label: tr(COPY.palette.copyEmail),
        hint: chrome.email,
        run: () => {
          navigator.clipboard?.writeText(chrome.email).then(
            () => setNotice(tr(COPY.palette.copied)),
            () => setNotice(chrome.email)
          );
        },
      },
      {
        id: 'action-lang',
        group: COPY.palette.actions,
        label: tr(COPY.palette.switchLang),
        run: () => setLang(lang === 'tr' ? 'en' : 'tr'),
      },
    ];
  }, [chrome, close, lang, pathname, router]);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return items;
    return items.filter((item) => normalize(`${item.label} ${item.hint ?? ''}`).includes(q));
  }, [items, query]);

  const safeCursor = Math.min(cursor, Math.max(0, results.length - 1));

  useEffect(() => {
    if (!open) return;
    document
      .getElementById(`${listId}-${safeCursor}`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [open, safeCursor, listId]);

  useEffect(() => {
    if (!notice) return;
    const t = window.setTimeout(() => setNotice(''), 2400);
    return () => window.clearTimeout(t);
  }, [notice]);

  if (!open) return null;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setCursor((c) => (results.length ? (Math.min(c, results.length - 1) + 1) % results.length : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setCursor((c) =>
        results.length ? (Math.min(c, results.length - 1) - 1 + results.length) % results.length : 0
      );
    } else if (event.key === 'Enter') {
      event.preventDefault();
      results[safeCursor]?.run();
    }
  };

  let lastGroup = '';

  return (
    <div className={s.backdrop} onMouseDown={(e) => e.target === e.currentTarget && close()} data-chrome>
      <div
        ref={dialogRef}
        className={`${s.panel} surface-dark`}
        role="dialog"
        aria-modal="true"
        aria-label={pick(COPY.palette.label, lang)}
      >
        <div className={s.field}>
          <span className={s.glyph} aria-hidden="true">
            ⌕
          </span>
          <input
            ref={inputRef}
            className={s.input}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={results.length ? `${listId}-${safeCursor}` : undefined}
            aria-label={pick(COPY.palette.label, lang)}
            placeholder={pick(COPY.palette.placeholder, lang)}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(0);
            }}
            onKeyDown={onKeyDown}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" className={s.esc} onClick={close}>
            Esc
          </button>
        </div>

        <ul id={listId} role="listbox" className={s.list} aria-label={pick(COPY.palette.label, lang)}>
          {results.length === 0 && <li className={s.empty}>{pick(COPY.palette.empty, lang)}</li>}
          {results.map((item, index) => {
            const group = pick(item.group, lang);
            const showGroup = group !== lastGroup;
            lastGroup = group;
            return (
              <li key={item.id} role="presentation">
                {showGroup && (
                  <div className={`${s.group} meta`} aria-hidden="true">
                    {group}
                  </div>
                )}
                <div
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={index === safeCursor}
                  className={s.option}
                  onMouseMove={() => index !== safeCursor && setCursor(index)}
                  onClick={() => item.run()}
                >
                  <span>{item.label}</span>
                  {item.hint && <span className={`${s.hint} meta-plain`}>{item.hint}</span>}
                </div>
              </li>
            );
          })}
        </ul>

        <div className={`${s.foot} meta-plain`}>
          <span aria-live="polite">{notice}</span>
          <span className={s.keys}>{pick(COPY.palette.hint, lang)}</span>
        </div>
      </div>
    </div>
  );
}
