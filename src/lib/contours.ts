/**
 * Deterministic contour geometry. Same seed → same paths, on the server and in the browser.
 * Coordinates are rounded to one decimal so serialized markup is stable and compact.
 */

export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFrom(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

type Pt = [number, number];

/** Catmull-Rom spline through points, as cubic Béziers. */
function smoothPath(points: Pt[], closed: boolean, precision = 1): string {
  const n = points.length;
  if (n < 2) return '';
  const f = 10 ** precision;
  const r1 = (v: number) => Math.round(v * f) / f;
  const at = (i: number): Pt =>
    closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))];
  let d = `M${r1(points[0][0])} ${r1(points[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${r1(c1x)} ${r1(c1y)} ${r1(c2x)} ${r1(c2y)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return closed ? `${d}Z` : d;
}

interface Harmonic {
  k: number;
  amp: number;
  phase: number;
  drift: number;
}

function harmonics(rand: () => number, count: number, maxK: number): Harmonic[] {
  return Array.from({ length: count }, (_, i) => ({
    k: 2 + Math.floor(rand() * (maxK - 1)),
    amp: (0.35 + rand() * 0.65) / (i + 1),
    phase: rand() * Math.PI * 2,
    drift: (rand() - 0.5) * 0.5,
  }));
}

export interface RingOptions {
  seed: number;
  count: number;
  cx: number;
  cy: number;
  /** Radius of the innermost ring. */
  inner: number;
  /** Average spacing between rings; spacing grows outward. */
  gap: number;
  /** 0–1: how irregular the rings are. */
  wobble?: number;
  /** Center drift per ring, so rings read as terrain rather than targets. */
  lean?: Pt;
  points?: number;
  /** Decimal places in the output. */
  precision?: number;
}

/** Closed, nested contour rings around a summit — the hero's topography. */
export function contourRings(o: RingOptions): string[] {
  const rand = seeded(o.seed);
  const waves = harmonics(rand, 4, 5);
  const wobble = o.wobble ?? 0.18;
  const points = o.points ?? 72;
  const lean = o.lean ?? [0, 0];
  const paths: string[] = [];
  let radius = o.inner;

  for (let ring = 0; ring < o.count; ring++) {
    const jitter = 0.75 + rand() * 0.5;
    const cx = o.cx + lean[0] * ring;
    const cy = o.cy + lean[1] * ring;
    const growth = 1 + ring * 0.06;
    const pts: Pt[] = [];
    for (let i = 0; i < points; i++) {
      const t = (i / points) * Math.PI * 2;
      let offset = 0;
      for (const w of waves) offset += w.amp * Math.sin(w.k * t + w.phase + w.drift * ring);
      const r = radius * (1 + wobble * offset * Math.min(1, 0.45 + ring * 0.08));
      pts.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r * 0.86]);
    }
    paths.push(smoothPath(pts, true, o.precision));
    radius += o.gap * jitter * growth;
  }
  return paths;
}

/**
 * Standalone SVG of closed rings around a point, for project plates.
 * Served as a cacheable image so repeated plates don't inflate the HTML.
 */
export function specimenSvg(seed: number, count = 10): string {
  const rings = contourRings({
    seed,
    count,
    cx: 300,
    cy: 200,
    inner: 92,
    gap: 22,
    wobble: 0.16,
    lean: [1.5, -1],
    points: 48,
  });
  const paths = rings
    .map(
      (d, i) =>
        `<path d="${d}" stroke-opacity="${i % 4 === 3 ? 0.32 : 0.16}" stroke-width="${i % 4 === 3 ? 1 : 0.75}" vector-effect="non-scaling-stroke"/>`
    )
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#142027" stroke-linecap="round">${paths}</svg>`;
}

export interface LineOptions {
  seed: number;
  count: number;
  width: number;
  /** y of the first line. */
  top: number;
  /** Average spacing between lines. */
  gap: number;
  /** Peak vertical displacement. */
  amplitude: number;
  /** How quickly spacing tightens as lines descend (>1 = denser lower down). */
  compress?: number;
  points?: number;
  precision?: number;
}

/** Open bathymetric lines that run across a band — chapter dividers and technical fields. */
export function contourLines(o: LineOptions): string[] {
  const rand = seeded(o.seed);
  const waves = harmonics(rand, 3, 4);
  const points = o.points ?? 40;
  const compress = o.compress ?? 1;
  const paths: string[] = [];
  let y = o.top;
  for (let line = 0; line < o.count; line++) {
    const pts: Pt[] = [];
    const amp = o.amplitude * (0.6 + 0.4 * Math.sin(line * 0.7 + waves[0].phase));
    for (let i = 0; i <= points; i++) {
      const u = i / points;
      let offset = 0;
      for (const w of waves) {
        offset += w.amp * Math.sin(w.k * u * Math.PI + w.phase + w.drift * line * 1.6);
      }
      pts.push([u * o.width, y + offset * amp]);
    }
    paths.push(smoothPath(pts, false, o.precision));
    y += o.gap / Math.pow(compress, line);
  }
  return paths;
}
