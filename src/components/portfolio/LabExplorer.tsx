'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { assetSpecFor } from '@/lib/content/assets';
import { COPY, PROJECT_CATEGORIES } from '@/lib/content/copy';
import { pick, type PortfolioProject } from '@/lib/content/portfolio';
import { useLang } from '@/lib/lang';
import { AssetPlate } from './AssetPlate';
import { ExternalLinks, KindText, StackText } from './ProjectBits';
import { T } from './T';
import s from './LabExplorer.module.css';

const ASSISTANT = 'assistant';
const WIDE = '(min-width: 1024px)';

function hasLive(p: PortfolioProject) {
  return !!(p.links.live || p.links.demo);
}

function Access({ project }: { project: PortfolioProject }) {
  const live = hasLive(project);
  const source = !!project.links.source;
  return (
    <span className={`${s.access} meta`}>
      <span className={live ? s.on : s.off} aria-hidden="true">
        ●
      </span>
      <span className={source ? s.on : s.off} aria-hidden="true">
        ◆
      </span>
      <span className="sr-only">
        {live && <T v={COPY.lab.accessLive} />}
        {live && source && ', '}
        {source && <T v={COPY.lab.accessSource} />}
      </span>
    </span>
  );
}

function Specimen({ project, warm }: { project: PortfolioProject; warm: boolean }) {
  const spec = assetSpecFor(project.slug);
  return (
    <div className={s.specimen}>
      <div className={s.mount}>
        <span className={s.sonar} aria-hidden="true" />
        <AssetPlate
          kind={spec.kind}
          src={project.image}
          alt={`${project.name.en} — ${COPY.work.markCaption.en}`}
          plate={spec.plate}
          inset={spec.inset}
          aspect="4 / 3"
          sizes="(min-width: 1024px) 26vw, 80vw"
          eager={warm}
          fallback={project.name.en.slice(0, 1)}
          className={s.mark}
        />
        <span className={`${s.mountLabel} meta tabular`} aria-hidden="true">
          <T v={COPY.lab.specimen} /> 03.{String(project.number).padStart(2, '0')}
        </span>
      </div>
      <div className={s.specText}>
        <p className={s.specName} aria-hidden="true">
          <T v={project.name} />
        </p>
        {project.subtitle && (
          <p className={`serif ${s.specSub}`}>
            <T v={project.subtitle} />
          </p>
        )}
        <p className={s.specSummary}>
          <T v={project.summary} />
        </p>
        <dl className={s.specFacts}>
          {project.categories.length > 0 && (
            <div>
              <dt className="meta">
                <T v={COPY.work.kind} />
              </dt>
              <dd>
                <KindText project={project} />
              </dd>
            </div>
          )}
          {project.stack.length > 0 && (
            <div>
              <dt className="meta">
                <T v={COPY.work.builtWith} />
              </dt>
              <dd className="meta-plain">
                <StackText project={project} limit={6} />
              </dd>
            </div>
          )}
        </dl>
        <div className={s.specActions}>
          <Link className="btn btn-primary" href={`/projects/${project.slug}`}>
            <T v={COPY.lab.open} />
            <span className="sr-only">: {project.name.en}</span>
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </Link>
          <ExternalLinks project={project} className={s.ext} />
        </div>
      </div>
    </div>
  );
}

/**
 * The lab console: rows on the left, the selected specimen on the right (inline under the
 * row on narrow screens). Rows are selection buttons; the project file link lives in the
 * specimen, which follows its row in the DOM so Tab moves from a row straight into it.
 */
export function LabExplorer({
  projects,
  assistant,
  headingLevel = 3,
  listLabel,
}: {
  projects: PortfolioProject[];
  assistant?: React.ReactNode;
  headingLevel?: 2 | 3;
  listLabel: { en: string; tr: string };
}) {
  const lang = useLang();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<string | null>(projects[0]?.id ?? (assistant ? ASSISTANT : null));
  const listRef = useRef<HTMLOListElement>(null);
  const hoverTimer = useRef(0);
  /* Hidden specimens load lazily; the first interaction starts fetching them all. */
  const [warm, setWarm] = useState(false);
  const warmUp = () => !warm && setWarm(true);

  const options = useMemo(() => {
    const counts = new Map<string, number>();
    projects.forEach((p) => p.categories.forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1)));
    const order = Object.keys(PROJECT_CATEGORIES);
    return [...counts.entries()]
      .sort((a, b) => (order.indexOf(a[0]) + 100) % 100 - ((order.indexOf(b[0]) + 100) % 100))
      .map(([id, count]) => ({ id, count, label: PROJECT_CATEGORIES[id] ?? { en: id, tr: id } }));
  }, [projects]);

  const visible = useMemo(
    () => (filter === 'all' ? projects : projects.filter((p) => p.categories.includes(filter))),
    [filter, projects]
  );

  const ids = useMemo(() => [...(assistant ? [ASSISTANT] : []), ...visible.map((p) => p.id)], [assistant, visible]);

  /* Keep a visible selection on wide screens when the filter removes the current one. */
  const applyFilter = (id: string) => {
    setFilter(id);
    const next = id === 'all' ? projects : projects.filter((p) => p.categories.includes(id));
    if (selected === ASSISTANT || next.some((p) => p.id === selected)) return;
    if (window.matchMedia(WIDE).matches) setSelected(next[0]?.id ?? (assistant ? ASSISTANT : null));
  };

  /* "#assistant" (from the Index, a link or a reload) selects the assistant and brings it into view. */
  useEffect(() => {
    if (!assistant) return;
    const onHash = () => {
      if (window.location.hash !== '#assistant') return;
      setSelected(ASSISTANT);
      window.setTimeout(() => {
        const input = document.querySelector<HTMLInputElement>('#assistant input[type="text"]');
        input?.focus({ preventScroll: true });
      }, 80);
    };
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [assistant]);

  const select = useCallback((id: string, toggle = false) => {
    setSelected((cur) => (toggle && cur === id && !window.matchMedia(WIDE).matches ? null : id));
  }, []);

  const onHover = (id: string) => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || !window.matchMedia(WIDE).matches) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setSelected(id), 70);
  };

  const onKey = (e: React.KeyboardEvent<HTMLButtonElement>, id: string) => {
    const i = ids.indexOf(id);
    let next = -1;
    if (e.key === 'ArrowDown') next = Math.min(ids.length - 1, i + 1);
    else if (e.key === 'ArrowUp') next = Math.max(0, i - 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = ids.length - 1;
    if (next < 0) return;
    e.preventDefault();
    const target = ids[next];
    setSelected(target);
    listRef.current?.querySelector<HTMLButtonElement>(`[data-row="${target}"]`)?.focus();
  };

  const Heading = `h${headingLevel}` as 'h2' | 'h3';
  const shown = filter === 'all' ? projects.length : visible.length;

  return (
    <div className={s.explorer}>
      {options.length > 1 && (
        <div className={s.toolbar}>
          <div role="group" aria-label={pick(COPY.archive.filter, lang)} className={s.chips}>
            {[{ id: 'all', count: projects.length, label: COPY.archive.all }, ...options].map((o) => (
              <button
                key={o.id}
                type="button"
                className={s.chip}
                aria-pressed={filter === o.id}
                onClick={() => applyFilter(o.id)}
              >
                {pick(o.label, lang)}
                <span className={`${s.chipCount} tabular`}>{o.count}</span>
              </button>
            ))}
          </div>
          <p className={`${s.showing} meta`} aria-live="polite">
            {pick(COPY.archive.showing, lang)} <span className="tabular">{shown}</span> / {projects.length}{' '}
            {pick(COPY.archive.projects, lang)}
          </p>
        </div>
      )}

      <div className={s.console} onPointerEnter={warmUp} onFocusCapture={warmUp} onTouchStart={warmUp}>
        <p className={`${s.hint} meta`} aria-hidden="true">
          <span>
            <T v={COPY.lab.hint} />
          </span>
          <span className={s.key}>
            <span>
              ● <T v={COPY.lab.accessLive} />
            </span>
            <span>
              ◆ <T v={COPY.lab.accessSource} />
            </span>
          </span>
        </p>
        <ol ref={listRef} className={s.rows} aria-label={pick(listLabel, lang)}>
          {assistant && (
            <li className={`${s.row} ${s.askRow}`} data-selected={selected === ASSISTANT || undefined}>
              <Heading className={s.rowHeading}>
                <button
                  type="button"
                  className={s.rowButton}
                  data-row={ASSISTANT}
                  aria-expanded={selected === ASSISTANT}
                  aria-controls="assistant"
                  onClick={() => select(ASSISTANT, true)}
                  onMouseEnter={() => onHover(ASSISTANT)}
                  onFocus={() => window.matchMedia(WIDE).matches && setSelected(ASSISTANT)}
                  onKeyDown={(e) => onKey(e, ASSISTANT)}
                >
                  <span className={`${s.no} meta tabular`}>00</span>
                  <span className={s.rowName}>
                    <T v={COPY.lab.askRow} />
                    <span className={s.rowSub}>
                      <T v={COPY.lab.askSub} />
                    </span>
                  </span>
                  <span className={`${s.askGlyph} meta`} aria-hidden="true">
                    AI
                  </span>
                </button>
              </Heading>
              <div id="assistant" className={s.detail} hidden={selected !== ASSISTANT}>
                <div className={s.detailInner}>
                  <div className={s.askPanel}>
                    <p className={`${s.mountLabel} meta`}>
                      <T v={COPY.lab.assistantTitle} />
                    </p>
                    <p className={s.askBody}>
                      <T v={COPY.lab.assistantBody} />
                    </p>
                    {assistant}
                  </div>
                </div>
              </div>
            </li>
          )}

          {visible.map((p) => {
            const isSel = selected === p.id;
            const detailId = `specimen-${p.slug}`;
            return (
              <li key={p.id} className={s.row} data-selected={isSel || undefined}>
                <Heading className={s.rowHeading}>
                  <button
                    type="button"
                    className={s.rowButton}
                    data-row={p.id}
                    aria-expanded={isSel}
                    aria-controls={detailId}
                    onClick={() => select(p.id, true)}
                    onMouseEnter={() => onHover(p.id)}
                    onFocus={() => window.matchMedia(WIDE).matches && setSelected(p.id)}
                    onKeyDown={(e) => onKey(e, p.id)}
                  >
                    <span className={`${s.no} meta tabular`}>{String(p.number).padStart(2, '0')}</span>
                    <span className={s.rowName}>
                      <T v={p.name} />
                      {p.subtitle && (
                        <span className={s.rowSub}>
                          <T v={p.subtitle} />
                        </span>
                      )}
                    </span>
                    <span className={`${s.rowKind} meta`}>
                      <KindText project={p} limit={2} />
                    </span>
                    <Access project={p} />
                  </button>
                </Heading>
                <div id={detailId} className={s.detail} hidden={!isSel}>
                  <div className={s.detailInner}>
                    <Specimen project={p} warm={warm || p.id === projects[0]?.id} />
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        {visible.length === 0 && (
          <p className="muted">
            <T v={COPY.archive.empty} />
          </p>
        )}
      </div>
    </div>
  );
}
