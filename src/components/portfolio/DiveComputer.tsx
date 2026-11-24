'use client';

import { useEffect, useMemo, useState } from 'react';
import { COPY, JOURNEY_TYPES } from '@/lib/content/copy';
import { pick, type Loc } from '@/lib/content/portfolio';
import { useLang } from '@/lib/lang';
import { T } from './T';
import s from './ExpeditionLog.module.css';

export interface LogItem {
  id: string;
  type: string;
  title: Loc;
  org: Loc;
  period: Loc;
  start: number | null;
  end: number | null;
  ongoing: boolean;
}

const LANES = ['education', 'work'] as const;
const W = 600;
const ROW = 14;
const GAP = 6;
const LANE_PAD = 26;

/** Greedy rows within each lane so overlapping periods never draw on top of each other. */
function layout(items: LogItem[]) {
  const bars: { item: LogItem; lane: number; row: number }[] = [];
  const rowsPerLane = LANES.map(() => 0);
  LANES.forEach((lane, li) => {
    const rowEnds: number[] = [];
    items
      .filter((i) => (lane === 'work' ? i.type === 'work' : i.type !== 'work') && i.start !== null)
      .sort((a, b) => a.start! - b.start!)
      .forEach((item) => {
        let row = rowEnds.findIndex((end) => end < item.start!);
        if (row < 0) row = rowEnds.length;
        rowEnds[row] = item.end ?? item.start!;
        bars.push({ item, lane: li, row });
      });
    rowsPerLane[li] = Math.max(1, rowEnds.length);
  });
  return { bars, rowsPerLane };
}

const yearOf = (m: number) => Math.floor(m / 12);

export function DiveComputer({ items }: { items: LogItem[] }) {
  const lang = useLang();
  const [active, setActive] = useState(items[0]?.id ?? '');
  const { bars, rowsPerLane } = useMemo(() => layout(items), [items]);

  const dated = items.filter((i) => i.start !== null);
  const min = Math.min(...dated.map((i) => i.start!));
  const max = Math.max(...dated.map((i) => i.end ?? i.start!)) + 1;
  const x = (m: number) => ((m - min) / Math.max(1, max - min)) * W;

  const laneTop = (li: number) =>
    LANE_PAD + rowsPerLane.slice(0, li).reduce((sum, r) => sum + r * (ROW + GAP) + LANE_PAD, 0);
  const height = laneTop(LANES.length) - LANE_PAD + 6;

  const years: number[] = [];
  for (let y = yearOf(min) + 1; y <= yearOf(max - 1); y++) years.push(y);

  /* The entry crossing the middle of the viewport is the one on the computer. */
  useEffect(() => {
    const entries = Array.from(document.querySelectorAll<HTMLElement>('[data-log-entry]'));
    if (!entries.length) return;
    entries.forEach((el) => (el.dataset.armed = ''));
    const io = new IntersectionObserver(
      (records) => {
        for (const r of records) if (r.isIntersecting) setActive(r.target.getAttribute('data-log-entry') ?? '');
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    entries.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-log-entry]').forEach((el) => {
      if (el.dataset.logEntry === active) el.dataset.active = '';
      else delete el.dataset.active;
    });
  }, [active]);

  const index = Math.max(0, items.findIndex((i) => i.id === active));
  const current = items[index];
  if (!current) return null;
  const startYear = current.start !== null ? yearOf(current.start) : null;
  const endYear = current.ongoing ? null : current.end !== null ? yearOf(current.end) : null;

  const jump = (id: string) => {
    const el = document.querySelector<HTMLElement>(`[data-log-entry="${id}"]`);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.3;
    window.scrollTo({ top, behavior: document.documentElement.dataset.fx === 'on' ? 'smooth' : 'auto' });
  };

  return (
    <div className={s.computer}>
      <div className={s.screen}>
        <p className={`${s.screenTop} meta tabular`}>
          <span>
            <T v={COPY.journey.computer} />
          </span>
          <span>
            <T v={COPY.journey.entry} /> {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>
        </p>

        <p className={`${s.year} tabular`} aria-hidden="true">
          <span>{startYear ?? '—'}</span>
          <span className={s.yearTo}>
            {current.ongoing ? (
              <>
                → <T v={COPY.journey.now} />
              </>
            ) : endYear && endYear !== startYear ? (
              `→ ${endYear}`
            ) : null}
          </span>
        </p>

        <p className={s.now} aria-hidden="true">
          <span className={s.nowTitle}>
            <T v={current.title} />
          </span>
          <span className={s.nowOrg}>
            <T v={current.org} /> · <T v={JOURNEY_TYPES[current.type] ?? { en: current.type, tr: current.type }} />
          </span>
        </p>

        <svg className={s.chart} viewBox={`0 0 ${W} ${height + 18}`} role="img" aria-label={pick(COPY.journey.chart, lang)}>
          {years.map((y) => (
            <g key={y}>
              <line className={s.tick} x1={x(y * 12)} x2={x(y * 12)} y1={0} y2={height} />
              <text className={s.tickLabel} x={x(y * 12) + 4} y={height + 14}>
                {y}
              </text>
            </g>
          ))}
          {LANES.map((lane, li) => (
            <text key={lane} className={s.laneLabel} x={0} y={laneTop(li) - 6}>
              <tspan data-l="en">{JOURNEY_TYPES[lane].en.toUpperCase()}</tspan>
              <tspan data-l="tr">{JOURNEY_TYPES[lane].tr.toLocaleUpperCase('tr')}</tspan>
            </text>
          ))}
          {bars.map(({ item, lane, row }) => {
            const x1 = x(item.start!);
            const x2 = Math.max(x1 + 6, x((item.end ?? item.start!) + 1));
            return (
              <rect
                key={item.id}
                className={item.id === active ? s.barOn : s.bar}
                x={x1}
                y={laneTop(lane) + row * (ROW + GAP)}
                width={x2 - x1}
                height={ROW}
                onClick={() => jump(item.id)}
              />
            );
          })}
        </svg>

        <p className={`${s.screenFoot} meta`} aria-hidden="true">
          <span>
            <T v={COPY.journey.deeper} />
          </span>
          <span className={s.arrowDown}>↓</span>
        </p>
      </div>
    </div>
  );
}
