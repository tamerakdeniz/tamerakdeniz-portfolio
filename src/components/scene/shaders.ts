export const VERTEX = /* glsl */ `#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

/**
 * One full-screen pass: surface and sky, light shafts, caustic underside, a bathymetric
 * seabed in perspective (iso-lines of a height field), marine snow in parallax layers,
 * a pointer torch and, at the end of the page, a single horizon line.
 */
export const FRAGMENT = /* glsl */ `#version 300 es
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform float uDepth;
uniform float uWater;
uniform float uScroll;
uniform float uVel;
uniform vec2 uPointer;
uniform float uEnergy;
uniform float uLayers;
uniform float uDpr;

out vec4 outColor;

const vec3 PAPER = vec3(0.929, 0.925, 0.902);
const vec3 PAPER_SHADE = vec3(0.886, 0.882, 0.851);
const vec3 INK = vec3(0.078, 0.125, 0.153);
const vec3 SURF = vec3(0.118, 0.302, 0.341);
const vec3 MID = vec3(0.071, 0.176, 0.212);
const vec3 DEEP = vec3(0.039, 0.090, 0.118);
const vec3 ABYSS = vec3(0.020, 0.043, 0.063);
const vec3 TIDAL = vec3(0.271, 0.549, 0.549);
const vec3 SIGNAL = vec3(0.710, 0.961, 0.824);

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = r * p * 2.03 + 11.7;
    a *= 0.5;
  }
  return v;
}

/* Cheap caustic web: interfering distorted waves. */
float caustic(vec2 p, float t) {
  vec2 q = p;
  float c = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    q += vec2(sin(q.y * 1.7 + t * 0.6 + fi), cos(q.x * 1.5 - t * 0.5 + fi * 1.3)) * 0.45;
    c += 1.0 / (1.0 + 18.0 * abs(sin(q.x + q.y * 0.6) * cos(q.y - q.x * 0.4)));
  }
  return c / 3.0;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uRes;
  vec2 p = (frag - 0.5 * uRes) / uRes.y;
  float t = uTime;
  float px = 1.0 / uRes.y;
  vec2 pointerP = vec2(uPointer.x * 0.5 * uRes.x / uRes.y, uPointer.y * 0.5);

  /* ── Waterline (y-up) with swell and pointer ripples ───────── */
  float wy = 1.0 - uWater;
  float swell = sin(p.x * 7.0 + t * 0.7) * 0.0022 + sin(p.x * 19.0 - t * 1.1) * 0.0009;
  float dx = abs(p.x - pointerP.x);
  float ripple = uEnergy * sin(dx * 70.0 - t * 7.0) * exp(-dx * 7.0) * 0.006;
  wy += swell + ripple;

  float below = wy - uv.y;
  vec3 col;

  if (below < 0.0) {
    /* Sky: a paper field, slightly shaded toward the waterline, with a printed meniscus. */
    float lift = clamp(-below, 0.0, 1.0);
    col = mix(PAPER_SHADE, PAPER, smoothstep(0.0, 0.35, lift));
    float meniscus = 1.0 - smoothstep(0.0, 1.6 * px, -below);
    col = mix(col, INK, meniscus * 0.85);
    float rule = 1.0 - smoothstep(0.0, 1.0 * px, abs(-below - 7.0 * px));
    col = mix(col, INK, rule * 0.12);
  } else {
    /* ── Water column ─────────────────────────────────────── */
    float shade = clamp(below * 0.85 + uDepth * 1.7, 0.0, 1.6);
    col = mix(SURF, MID, smoothstep(0.0, 0.5, shade));
    col = mix(col, DEEP, smoothstep(0.5, 1.05, shade));
    col = mix(col, ABYSS, smoothstep(1.05, 1.6, shade));

    float light = 1.0 - smoothstep(0.0, 0.3, uDepth);
    float nearSurface = exp(-below * 5.0);

    /* Underside of the surface: a bright, caustic band. */
    float band = exp(-below * 34.0);
    float cs = caustic(vec2(p.x * 9.0, below * 30.0) + vec2(uPointer.x * 0.6, 0.0), t);
    col += TIDAL * band * (0.35 + 0.65 * cs) * 0.55 * light;
    col += SIGNAL * (1.0 - smoothstep(0.0, 2.0 * px, below)) * 0.35 * light;

    /* Light shafts from a sun above and to the side; the pointer leans them. */
    vec2 sun = vec2(-0.35 + uPointer.x * 0.22, 0.95 - uWater * 0.4);
    vec2 dir = p - sun;
    float ang = atan(dir.x, -dir.y);
    float r1 = smoothstep(0.52, 1.0, noise(vec2(ang * 16.0, t * 0.11)));
    float r2 = smoothstep(0.58, 1.0, noise(vec2(ang * 38.0 + 4.0, t * 0.17)));
    float shafts = (r1 * 0.65 + r2 * 0.45) * exp(-length(dir) * 1.15);
    shafts *= smoothstep(0.0, 0.06, below);
    col += vec3(0.50, 0.80, 0.78) * shafts * 0.30 * light;

    /* Faint caustics drifting through the upper water. */
    float drift = caustic(p * 5.5 + vec2(t * 0.05, -uScroll * 0.4), t * 0.7);
    col += TIDAL * drift * 0.05 * light * nearSurface;
  }

  /* ── Bathymetric seabed in perspective ───────────────────── */
  float desc = smoothstep(0.0, 0.6, uDepth);
  float approach = pow(desc, 0.55);
  float settle = smoothstep(0.84, 0.99, uDepth);
  float pitch = mix(-0.16, -0.6, approach);
  pitch = mix(pitch, -0.035, settle) + uPointer.y * 0.035;
  float yaw = uPointer.x * 0.07;
  float height = mix(7.5, 1.35, approach);
  height = mix(height, 2.4, settle);

  vec3 rd = normalize(vec3(p.x, p.y, -1.4));
  float cp = cos(pitch), sp = sin(pitch);
  rd = vec3(rd.x, rd.y * cp - rd.z * sp, rd.y * sp + rd.z * cp);
  float cy = cos(yaw), sy = sin(yaw);
  rd = vec3(rd.x * cy - rd.z * sy, rd.y, rd.x * sy + rd.z * cy);

  float torchAmt = smoothstep(0.05, 0.22, uDepth);
  vec2 tp = p - pointerP;
  float torch = exp(-dot(tp, tp) * 10.0) * torchAmt;

  /* Derivatives must run in uniform control flow, so the seabed is always evaluated and masked. */
  float seabedVis = smoothstep(0.01, 0.11, uDepth) * smoothstep(0.0, 0.02, below);
  float facing = smoothstep(-0.0005, -0.02, rd.y);
  float dist = height / max(-rd.y, 0.004);
  vec2 xz = (rd * dist).xz + vec2(0.0, -uDepth * 38.0 - t * 0.035);
  float hgt = fbm(xz * 0.16);
  float freq = mix(15.0, 30.0, smoothstep(0.2, 0.75, uDepth));
  float f = hgt * freq;
  float fw = fwidth(f);
  float g = abs(fract(f - 0.5) - 0.5) / max(fw, 1e-4);
  float line = 1.0 - clamp(g - 0.35, 0.0, 1.0);
  float fm = f / 5.0;
  float fwm = fwidth(fm);
  float gm = abs(fract(fm - 0.5) - 0.5) / max(fwm, 1e-4);
  float major = 1.0 - clamp(gm - 0.9, 0.0, 1.0);
  float alias = 1.0 - smoothstep(0.2, 0.7, fw);
  float fog = exp(-dist * mix(0.06, 0.15, desc));
  float lit = (line * 0.34 + major * 0.42) * alias * fog * seabedVis * facing;
  vec3 lineCol = mix(TIDAL, SIGNAL, torch * 0.6);
  col += lineCol * lit * (0.75 + torch * 2.2);

  /* ── The horizon the page settles on ─────────────────────── */
  float horizonY = -1.4 * tan(pitch);
  float hz = exp(-abs(p.y - horizonY) * 260.0) * settle;
  float hzGlow = exp(-abs(p.y - horizonY) * 9.0) * settle;
  col += PAPER * hz * 0.24 + TIDAL * hzGlow * 0.06;

  /* ── Marine snow: parallax layers that streak with velocity ─ */
  float underwater = smoothstep(-0.002, 0.01, below);
  float snow = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    if (fi >= uLayers) break;
    float k = fi / 4.0;
    float scale = mix(26.0, 6.5, k);
    float par = mix(0.18, 1.35, k);
    vec2 q = p - vec2(uPointer.x * par * 0.035 + sin(t * 0.05 + fi) * 0.02, -uScroll * par - t * 0.004 * (1.0 + fi));
    q *= scale;
    vec2 id = floor(q);
    vec2 fr = fract(q) - 0.5;
    vec2 hsh = hash22(id + fi * 17.0);
    if (hsh.x > mix(0.52, 0.34, k)) continue;
    vec2 pos = (hash22(id * 1.7 + 3.1 + fi) - 0.5) * 0.7;
    vec2 d = fr - pos;
    d.y /= 1.0 + min(abs(uVel) * par * 90.0, 7.0);
    float rad = mix(0.03, 0.075, k) * (0.6 + 0.7 * hsh.y);
    float soft = mix(0.3, 0.75, k * k);
    float a = 1.0 - smoothstep(rad * (1.0 - soft), rad, length(d));
    float tw = 0.65 + 0.35 * sin(t * (0.4 + hsh.y) + hsh.x * 6.283);
    snow += a * tw * mix(0.24, 0.5, k) * (1.0 - k * 0.55);
  }
  col += vec3(0.74, 0.86, 0.86) * snow * underwater * (0.55 + torch * 1.4);

  col += TIDAL * torch * 0.05 * underwater;

  /* Vignette and dithering against banding. */
  vec2 v = uv - 0.5;
  col *= 1.0 - dot(v, v) * 0.55 * underwater;
  col += (hash12(frag + fract(t) * 91.0) - 0.5) / 255.0 * 2.0;

  outColor = vec4(col, 1.0);
}
`;
