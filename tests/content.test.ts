import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import type { SiteData } from '@/types';
import { buildPortfolio, OWNER, SOCIAL_PREVIEW_IMAGE, slugify, safeUrl } from '@/lib/content/portfolio';
import { CHAPTERS } from '@/lib/content/copy';
import { stackStrata } from '@/lib/content/strata';
import { buildPillars } from '@/lib/content/pillars';
import { contourRings, contourLines, seedFrom } from '@/lib/contours';

const fixture = {
  projects: {
    a: {
      id: 'a',
      order: 2,
      published: true,
      title: { en: 'Screen Timer – Focus Extension', tr: 'Screen Timer – Odak Eklentisi' },
      description: { en: 'Blocks distractions. Second sentence.', tr: 'Dikkat dağıtanları engeller. İkinci cümle.' },
      category: ['web', 'extension'],
      techStack: ['JavaScript', 'Chrome Extension (Manifest v3)'],
      liveUrl: 'javascript:alert(1)',
      githubUrl: 'https://github.com/example/screen-timer',
    },
    b: {
      id: 'b',
      order: 1,
      published: true,
      title: { en: 'Qirushio – AI Quiz', tr: '' },
      description: { en: 'Real-time quiz game.', tr: '' },
      category: 'ai',
      techStack: ['Python', 'FastAPI', 'LLM', 'Docker', 'PostgreSQL'],
      liveUrl: 'https://qirushio.example',
    },
    c: { id: 'c', order: 0, published: false, title: { en: 'Hidden', tr: 'Gizli' }, description: { en: 'x', tr: 'x' } },
    d: { id: 'd', order: 3, published: true, title: { en: 'Çevik Forklift', tr: 'Çevik Forklift' }, description: { en: 'Site.', tr: 'Site.' } },
    e: { id: 'e', order: 4, published: true, title: { en: 'Çevik Forklift', tr: 'Çevik Forklift' }, description: { en: 'Dup.', tr: 'Dup.' } },
  },
  timeline: [
    { id: 't1', order: 0, type: 'work', title: { en: 'Developer', tr: 'Geliştirici' }, company: { en: 'Turkcell', tr: 'Turkcell' }, period: { en: 'Mar 2026 - July 2026', tr: 'Mart 2026 - Temmuz 2026' }, description: { en: 'Telco CRM microservices.', tr: 'Telco CRM.' } },
    { id: 't2', order: 1, type: 'education', title: { en: 'BSc', tr: 'Lisans' }, company: { en: 'University', tr: 'Üniversite' }, period: { en: '2022 - Present', tr: '2022 - Günümüz' }, description: { en: '', tr: '' } },
    { id: 't3', order: 2, published: false, type: 'work', title: { en: 'Hidden', tr: 'Gizli' }, company: { en: '', tr: '' }, period: { en: '2020', tr: '2020' }, description: { en: '', tr: '' } },
  ],
  skills: [
    { id: 's1', name: 'Python', category: 'backend', order: 0 },
    { id: 's2', name: 'Spring Boot', category: ['backend'], order: 1 },
  ],
  availability: { status: 'available' },
} as unknown as SiteData;

test('projects: only published, ordered, split into featured and archive', () => {
  const p = buildPortfolio(fixture);
  assert.deepEqual(
    p.projects.map((x) => x.id),
    ['b', 'a', 'd', 'e']
  );
  assert.deepEqual(p.projects.map((x) => x.number), [1, 2, 3, 4]);
  assert.equal(p.featured.length, 3);
  assert.deepEqual(p.archive.map((x) => x.id), ['e']);
});

test('projects: titles split into name and subtitle; empty TR falls back to EN', () => {
  const [q, s] = buildPortfolio(fixture).projects;
  assert.deepEqual(q.name, { en: 'Qirushio', tr: 'Qirushio' });
  assert.deepEqual(q.subtitle, { en: 'AI Quiz', tr: 'AI Quiz' });
  assert.equal(s.summary.en, 'Blocks distractions.');
  assert.equal(s.summary.tr, 'Dikkat dağıtanları engeller.');
});

test('projects: unsafe URLs are dropped, safe ones kept', () => {
  const s = buildPortfolio(fixture).projects[1];
  assert.equal(s.links.live, undefined);
  assert.equal(s.links.source, 'https://github.com/example/screen-timer');
  assert.equal(safeUrl('/resume/cv.pdf'), '/resume/cv.pdf');
  assert.equal(safeUrl('data:text/html,hi'), undefined);
});

test('slugs: transliterated, unique and stable', () => {
  const slugs = buildPortfolio(fixture).projects.map((x) => x.slug);
  assert.deepEqual(slugs, ['qirushio', 'screen-timer', 'cevik-forklift', 'cevik-forklift-e']);
  assert.equal(slugify('Şık Ürün Görüşü'), 'sik-urun-gorusu');
});

test('journey: unpublished hidden; years and ongoing derived from period', () => {
  const j = buildPortfolio(fixture).journey;
  assert.equal(j.length, 2);
  assert.deepEqual([j[0].startYear, j[0].endYear, j[0].ongoing], ['2026', '2026', false]);
  assert.deepEqual([j[1].startYear, j[1].endYear, j[1].ongoing], ['2022', null, true]);
});

test('fallbacks: empty data still renders contact, CV and public Tamer Akdeniz branding', () => {
  const p = buildPortfolio(null);
  assert.equal(OWNER.fullName, 'Tamer Akdeniz');
  assert.equal(OWNER.shortName, 'Tamer Akdeniz');
  assert.equal(OWNER.monogram, 'TA');
  assert.equal(p.profile.fullName, 'Tamer Akdeniz');
  assert.equal(p.profile.shortName, 'Tamer Akdeniz');
  assert.equal(p.projects.length, 0);
  assert.match(p.contact.email, /@/);
  assert.equal(p.cv.viewUrl, '/resume/Mustafa-Tamer-Akdeniz-Resume.pdf');
  assert.equal(p.cv.fileName, 'Mustafa-Tamer-Akdeniz-Resume.pdf');
  assert.equal(p.availability, null);

  const ogBytes = readFileSync('public/og-image.png');
  assert.equal(ogBytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(ogBytes.readUInt32BE(16), SOCIAL_PREVIEW_IMAGE.width);
  assert.equal(ogBytes.readUInt32BE(20), SOCIAL_PREVIEW_IMAGE.height);
  assert.equal(SOCIAL_PREVIEW_IMAGE.width, 1200);
  assert.equal(SOCIAL_PREVIEW_IMAGE.height, 630);
  assert.match(SOCIAL_PREVIEW_IMAGE.url, /^https:\/\/(www\.)?tamerakdeniz\.com\/og-image\.png$/);
});

test('chapters: seven, in order, 10 m apart, with the anchors the nav uses', () => {
  assert.deepEqual(
    CHAPTERS.map((c) => c.id),
    ['surface', 'about', 'work', 'lab', 'engineering', 'journey', 'contact']
  );
  CHAPTERS.forEach((c, i) => assert.equal(c.depth, i * 10));
});

test('strata: technologies grouped by layer, unknowns kept under Other', () => {
  const layers = stackStrata(['React', 'FastAPI', 'PostgreSQL', 'Docker', 'LLM', 'Mystery Tool']);
  assert.deepEqual(
    layers.map((l) => l.id),
    ['interface', 'intelligence', 'services', 'data', 'infrastructure', 'other']
  );
  assert.deepEqual(stackStrata(['JavaScript'])[0].items, ['JavaScript']);
});

test('pillars: only list technologies that appear somewhere in the content', () => {
  const pillars = buildPillars(buildPortfolio(fixture));
  const systems = pillars.find((p) => p.id === 'systems')!;
  assert.ok(systems.tech.includes('FastAPI'));
  assert.ok(!systems.tech.includes('Kafka'));
  assert.ok(systems.journeyLink);
  assert.deepEqual(systems.related.map((p) => p.id), ['b']);
});

test('contours: deterministic for a seed, different across seeds', () => {
  const opts = { seed: seedFrom('qirushio'), count: 5, cx: 200, cy: 150, inner: 20, gap: 18 };
  const rings = contourRings(opts);
  assert.equal(rings.length, 5);
  assert.deepEqual(rings, contourRings(opts));
  assert.notDeepEqual(rings, contourRings({ ...opts, seed: seedFrom('pathyvo') }));
  rings.forEach((d) => assert.match(d, /^M[\d.-]+ [\d.-]+C.*Z$/));
  const lines = contourLines({ seed: 7, count: 3, width: 800, top: 10, gap: 30, amplitude: 10 });
  assert.equal(lines.length, 3);
  lines.forEach((d) => assert.match(d, /^M[\d.-]+ [\d.-]+C/));
});
