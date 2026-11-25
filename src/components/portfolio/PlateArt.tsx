import type { Loc } from '@/lib/content/portfolio';
import type { PlateArtKey } from '@/types';
import s from './PlateArt.module.css';

/**
 * Conceptual art for the featured plates, composed only from what each project's
 * description states. Decorative (aria-hidden); the caption says it is not a screenshot.
 * `--local` (0–1, default 1) draws the figure as its plate scrolls through.
 */

const W = 800;
const H = 500;

function SvgT({ v }: { v: Loc }) {
  return (
    <>
      <tspan data-l="en">{v.en}</tspan>
      <tspan data-l="tr">{v.tr}</tspan>
    </>
  );
}

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
};

const arc = (cx: number, cy: number, r: number, from: number, to: number) => {
  const [x1, y1] = polar(cx, cy, r, from);
  const [x2, y2] = polar(cx, cy, r, to);
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
};

const ticks = (cx: number, cy: number, n: number, outer: number, minor: number, major: number, every: number) =>
  Array.from({ length: n }, (_, i) => {
    const deg = (i / n) * 360;
    const [x1, y1] = polar(cx, cy, outer, deg);
    const [x2, y2] = polar(cx, cy, i % every === 0 ? major : minor, deg);
    return `M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }).join('');

/* Qirushio: a shared room racing one round timer, scored on a leaderboard. */
function TimerArt() {
  const cx = 400;
  const cy = 250;
  const players = [24, 71, 132, 205, 288];
  return (
    <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      <path className={s.qTicks} d={ticks(cx, cy, 60, 214, 204, 190, 5)} />
      <circle className={s.qTrack} cx={cx} cy={cy} r={172} />
      <circle
        className={`${s.draw} ${s.qSweep}`}
        cx={cx}
        cy={cy}
        r={172}
        pathLength={1}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <g className={s.qPlayers}>
        {players.map((deg, i) => {
          const [x, y] = polar(cx, cy, 148, deg);
          return <circle key={deg} cx={x} cy={y} r={i === 0 ? 7 : 5} className={i === 0 ? s.qLead : s.qDot} />;
        })}
      </g>

      <g className={s.label}>
        <path className={s.qLink} d="M44 44h14a7 7 0 0 1 0 14H44a7 7 0 0 1 0-14zm8 7h16" />
        <text x={82} y={56}>
          <SvgT v={{ en: 'ROOM · SHAREABLE LINK', tr: 'ODA · PAYLAŞILABİLİR BAĞLANTI' }} />
        </text>
        <text x={W - 40} y={56} textAnchor="end">
          <SvgT v={{ en: 'AI-GENERATED QUESTIONS', tr: 'YAPAY ZEKÂ SORULARI' }} />
        </text>
        <text x={W - 40} y={76} textAnchor="end" className={s.dim}>
          <SvgT
            v={{ en: 'language · category · difficulty · scope', tr: 'dil · kategori · zorluk · kapsam' }}
          />
        </text>
        <text x={40} y={H - 40}>
          <SvgT v={{ en: 'RACE THE TIMER', tr: 'ZAMANA KARŞI YARIŞ' }} />
        </text>
        <text x={W - 40} y={H - 116} textAnchor="end">
          <SvgT v={{ en: 'LEADERBOARD', tr: 'SKOR TABLOSU' }} />
        </text>
      </g>
      <g className={s.qBoard}>
        {[150, 112, 76].map((w, i) => (
          <g key={w} transform={`translate(${W - 40 - 170} ${H - 96 + i * 22})`}>
            <text className={s.qRank} x={0} y={9}>
              {i + 1}
            </text>
            <rect className={s.qBar} x={20} y={0} width={w} height={10} style={{ '--d': i * 0.12 } as React.CSSProperties} />
          </g>
        ))}
      </g>
    </svg>
  );
}

/* Screen Timer: one day, with per-site limit, friction and block, kept on the device. */
function DayArt() {
  const cx = 400;
  const cy = 250;
  const r = 166;
  const deg = (h: number) => (h / 24) * 360;
  const modes = [
    { from: 9, to: 17, cls: s.dLimit, label: { en: 'Daily limit', tr: 'Günlük limit' } },
    { from: 17, to: 21, cls: s.dFriction, label: { en: 'Friction', tr: 'Sürtünme' } },
    { from: 21, to: 24, cls: s.dBlock, label: { en: 'Block', tr: 'Engelle' } },
  ];
  return (
    <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      <circle className={s.dRing} cx={cx} cy={cy} r={206} />
      <path className={s.dTicks} d={ticks(cx, cy, 96, 206, 200, 192, 4)} />
      {[0, 6, 12, 18].map((h) => {
        const [x, y] = polar(cx, cy, 226, deg(h));
        return (
          <text key={h} className={s.dHour} x={x} y={y + 4} textAnchor="middle">
            {String(h).padStart(2, '0')}
          </text>
        );
      })}
      <circle className={s.dTrack} cx={cx} cy={cy} r={r} />
      {modes.map((m, i) => (
        <path
          key={m.from}
          className={`${s.draw} ${s.dArc} ${m.cls}`}
          d={arc(cx, cy, r, deg(m.from), deg(m.to))}
          pathLength={1}
          style={{ '--d': i } as React.CSSProperties}
        />
      ))}

      <g className={s.label}>
        {modes.map((m, i) => (
          <g key={m.from} transform={`translate(40 ${H - 104 + i * 26})`}>
            <rect className={m.cls} width={22} height={8} y={-8} rx={0} />
            <text x={34} y={0}>
              <SvgT v={{ en: m.label.en.toUpperCase(), tr: m.label.tr.toLocaleUpperCase('tr') }} />
            </text>
          </g>
        ))}
        <rect className={s.dDevice} x={W - 64} y={36} width={24} height={34} rx={3} />
        <text x={W - 78} y={52} textAnchor="end">
          <SvgT v={{ en: 'STORED ON THE DEVICE', tr: 'CİHAZDA SAKLANIR' }} />
        </text>
        <text x={W - 78} y={70} textAnchor="end" className={s.dim}>
          <SvgT v={{ en: 'no browsing activity leaves it', tr: 'tarama verisi dışarı çıkmaz' }} />
        </text>
      </g>
    </svg>
  );
}

/* Pathyvo: grades, interests and goals plotted into a roadmap, with an AI mentor alongside. */
function RouteArt() {
  const route = 'M70 430C160 430 175 318 270 318S392 402 470 334S560 168 690 150';
  const stops = [
    { x: 70, y: 430, at: 0, label: { en: 'GRADES', tr: 'NOTLAR' }, dx: 0, dy: -22 },
    { x: 270, y: 318, at: 0.3, label: { en: 'INTERESTS', tr: 'İLGİ ALANLARI' }, dx: 0, dy: -22 },
    { x: 470, y: 334, at: 0.62, label: { en: 'GOALS', tr: 'HEDEFLER' }, dx: 0, dy: 34 },
    { x: 690, y: 150, at: 0.98, label: { en: 'ROADMAP', tr: 'YOL HARİTASI' }, dx: 0, dy: -24 },
  ];
  const grid: string[] = [];
  for (let x = 40; x < W; x += 40) for (let y = 40; y < H; y += 40) grid.push(`M${x} ${y}h.01`);
  return (
    <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
      <path className={s.pGrid} d={grid.join('')} />
      <path className={s.pGhost} d={route} />
      <path className={`${s.draw} ${s.pRoute}`} d={route} pathLength={1} />
      {stops.map((st) => (
        <g key={st.x} className={s.pStop} style={{ '--at': st.at } as React.CSSProperties}>
          <circle cx={st.x} cy={st.y} r={st.at > 0.9 ? 11 : 7} className={st.at > 0.9 ? s.pEnd : s.pNode} />
          <text className={s.labelText} x={st.x + st.dx} y={st.y + st.dy} textAnchor={st.x < 100 ? 'start' : 'middle'}>
            <SvgT v={st.label} />
          </text>
        </g>
      ))}
      <g className={s.pChat}>
        <path className={s.pBubble} d="M40 44h208a10 10 0 0 1 10 10v44a10 10 0 0 1-10 10H78l-18 16v-16H50a10 10 0 0 1-10-10V54a10 10 0 0 1 10-10z" />
        <text className={s.labelText} x={58} y={72}>
          <SvgT v={{ en: 'AI MENTOR CHAT', tr: 'YAPAY ZEKÂ MENTOR' }} />
        </text>
        <circle cx={62} cy={90} r={3} className={s.pTyping} />
        <circle cx={74} cy={90} r={3} className={s.pTyping} />
        <circle cx={86} cy={90} r={3} className={s.pTyping} />
      </g>
    </svg>
  );
}

export interface LegendItem {
  v: Loc;
  color?: string;
}

const QIRUSHIO_KEY: LegendItem[] = [
  { v: { en: 'Room · shareable link', tr: 'Oda · paylaşılabilir bağlantı' } },
  { v: { en: 'AI-generated questions', tr: 'Yapay zekâ soruları' } },
  { v: { en: 'Race the timer', tr: 'Zamana karşı yarış' }, color: '#ff9b2f' },
  { v: { en: 'Leaderboard', tr: 'Skor tablosu' }, color: '#4f8dfb' },
];

const SCREEN_TIMER_KEY: LegendItem[] = [
  { v: { en: 'Daily limit', tr: 'Günlük limit' }, color: '#1f6fd6' },
  { v: { en: 'Friction', tr: 'Sürtünme' }, color: '#e9a227' },
  { v: { en: 'Block', tr: 'Engelle' }, color: '#142027' },
  { v: { en: 'Stored on the device', tr: 'Cihazda saklanır' } },
];

export type PrintPlacement = 'round' | 'square' | 'corner';

/**
 * Conceptual plate art, selectable per project in the admin panel. Each piece was drawn from one
 * project's brief (Qirushio, Screen Timer, Pathyvo), so its legend text belongs to that project.
 */
export const PLATE_ART: Record<
  Exclude<PlateArtKey, 'none'>,
  { Art: () => React.JSX.Element; print: PrintPlacement; legend: readonly LegendItem[] }
> = {
  timer: { Art: TimerArt, print: 'round', legend: QIRUSHIO_KEY },
  day: { Art: DayArt, print: 'square', legend: SCREEN_TIMER_KEY },
  route: { Art: RouteArt, print: 'corner', legend: [] },
};
