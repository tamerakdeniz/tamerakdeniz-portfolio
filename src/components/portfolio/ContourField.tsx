import { contourLines, contourRings } from '@/lib/contours';
import { OWNER } from '@/lib/content/portfolio';

/** Hero topography: sparse rings around one summit, with the site's single signal marker. */
export function HeroContours({ className }: { className?: string }) {
  const cx = 368;
  const cy = 300;
  const rings = contourRings({
    seed: 1907,
    count: 17,
    cx,
    cy,
    inner: 16,
    gap: 17,
    wobble: 0.22,
    lean: [-3.2, 2.4],
    points: 56,
  });

  return (
    <svg
      className={`contour ${className ?? ''}`}
      viewBox="0 0 720 640"
      aria-hidden="true"
      focusable="false"
      data-enter-draw
    >
      <g strokeWidth={0.9}>
        {rings.map((d, i) => (
          <path
            key={i}
            d={d}
            pathLength={1}
            stroke={i % 5 === 4 ? 'var(--paper)' : 'var(--tidal)'}
            strokeOpacity={i % 5 === 4 ? 0.5 : Math.max(0.22, 0.62 - i * 0.025)}
            strokeWidth={i % 5 === 4 ? 1.1 : 0.75}
            style={{ '--p': i } as React.CSSProperties}
          />
        ))}
      </g>

      <g className="hero-marker">
        <line x1={cx - 30} y1={cy} x2={cx - 10} y2={cy} stroke="var(--signal)" strokeWidth={1} />
        <line x1={cx + 10} y1={cy} x2={cx + 30} y2={cy} stroke="var(--signal)" strokeWidth={1} />
        <line x1={cx} y1={cy - 30} x2={cx} y2={cy - 10} stroke="var(--signal)" strokeWidth={1} />
        <line x1={cx} y1={cy + 10} x2={cx} y2={cy + 30} stroke="var(--signal)" strokeWidth={1} />
        <circle cx={cx} cy={cy} r={4.5} fill="var(--signal)" />
        <line
          x1={cx + 6}
          y1={cy - 6}
          x2={cx + 92}
          y2={cy - 92}
          stroke="var(--signal)"
          strokeWidth={0.8}
          strokeOpacity={0.7}
        />
        <text
          x={cx + 98}
          y={cy - 96}
          fill="var(--signal)"
          fontFamily="var(--font-mono-stack)"
          fontSize={12}
          letterSpacing="0.08em"
        >
          {OWNER.monogram} · 00 m
        </text>
      </g>
    </svg>
  );
}

/** A band of bathymetric lines; density rises with `count` and `compress`, as the site descends. */
export function ContourBand({
  seed,
  count,
  height = 160,
  amplitude = 22,
  compress = 1,
  tone = 'tidal',
  opacity = 0.5,
  className,
  draw = true,
}: {
  seed: number;
  count: number;
  height?: number;
  amplitude?: number;
  compress?: number;
  tone?: 'tidal' | 'line' | 'ink' | 'paper';
  opacity?: number;
  className?: string;
  draw?: boolean;
}) {
  const width = 1440;
  const gap = (height - amplitude * 2) / Math.max(1, count - 1);
  const lines = contourLines({
    seed,
    count,
    width,
    top: amplitude,
    gap: gap * (compress > 1 ? 1.6 : 1),
    amplitude,
    compress,
    points: 24,
    precision: 0,
  });
  const color =
    tone === 'tidal'
      ? 'var(--tidal)'
      : tone === 'ink'
        ? 'var(--ink)'
        : tone === 'paper'
          ? 'var(--paper)'
          : 'var(--line)';

  return (
    <svg
      className={`contour ${className ?? ''}`}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      data-draw={draw ? '' : undefined}
    >
      {lines.map((d, i) => (
        <path
          key={i}
          d={d}
          pathLength={1}
          stroke={color}
          strokeOpacity={opacity * (i % 4 === 3 ? 1.4 : 1)}
          strokeWidth={i % 4 === 3 ? 1 : 0.7}
          vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

/** The closing frame: one horizon line, the signal resting on it. */
export function Horizon({ className }: { className?: string }) {
  return (
    <svg
      className={`contour ${className ?? ''}`}
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      data-draw
    >
      <path
        d="M0 40 L1440 40"
        pathLength={1}
        stroke="var(--paper)"
        strokeOpacity={0.6}
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
