import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { timelinePeriod } from '../src/lib/content/timeline';
import { isOrphanCandidate, referencedStoragePaths } from '../src/lib/media-policy';
import { readBoundedJson } from '../src/lib/request-body';
import { validateSiteDataImport } from '../src/lib/content/validate-import';
import type { SiteData, TimelineEntry } from '../src/types';

const locales = ['en', 'tr'].map((language) => JSON.parse(readFileSync(`src/locales/${language}.json`, 'utf8')) as Record<string, string>);
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
test('admin locales: parity, every literal key, dynamic keys and interpolation parity', () => {
  assert.deepEqual(Object.keys(locales[0]).sort(), Object.keys(locales[1]).sort());
  const used = new Set<string>();
  for (const file of files('src').filter((file) => /\.tsx?$/.test(file))) {
    const source = readFileSync(file, 'utf8').replace(/\b(?:id|htmlFor)="[^"]*"/g, '');
    for (const match of source.matchAll(/["'](admin-[a-z0-9-]+)["']/g)) used.add(match[1]);
  }
  for (const [prefix, suffixes] of Object.entries({
    'admin-variant-': ['auto','editorial','technical','mobile','immersive','minimal'],
    'admin-media-kind-': ['cover','logo','desktop','mobile','diagram','video'],
    'admin-media-add-': ['desktop','mobile','diagram','cover','video'],
    'admin-vis-': ['draft','published','archived','draft-hint','published-hint','archived-hint'],
    'admin-timeline-type-': ['work','education','certification','achievement'],
    'admin-nav-': ['dashboard','home','projects','about','skills','timeline','cv','contact','profile','settings'],
    'admin-status-': ['available','not-available','working','open-to-offers'],
  })) for (const suffix of suffixes) used.add(prefix + suffix);
  for (const key of used) {
    for (const locale of locales) assert.ok(locale[key]?.trim(), `Missing ${key}`);
    assert.deepEqual(locales[0][key].match(/{{[^}]+}}/g)?.sort(), locales[1][key].match(/{{[^}]+}}/g)?.sort(), `Interpolation ${key}`);
  }
});
test('timeline: structured completed/current dates override stale legacy periods', () => {
  const entry = { startDate: '2023-11', endDate: '2025-06', current: false, period: { en: '2023 – Present', tr: '2023 – Günümüz' } } as TimelineEntry;
  assert.deepEqual(timelinePeriod(entry), { start: 24286, end: 24305, ongoing: false, period: { en: 'Nov 2023 – Jun 2025', tr: 'Kas 2023 – Haz 2025' } });
  assert.match(timelinePeriod({ ...entry, current: true }).period.en, /Present$/);
  assert.equal(timelinePeriod({ period: { en: '2020 – Present', tr: '' } } as TimelineEntry).ongoing, true);
  assert.equal(timelinePeriod({ period: { en: '', tr: '' } } as TimelineEntry).start, null);
});
test('orphan sweep: shared references, legacy paths, recent and incomplete metadata are protected', () => {
  const managed = 'portfolio/projects/test/cover-1700000000000-abcdef.png';
  const now = Date.now();
  const old = new Date(now - 2 * 86400000).toISOString();
  assert.equal(isOrphanCandidate(managed, old, new Set(), now), true);
  assert.equal(isOrphanCandidate(managed, old, new Set([managed]), now), false);
  assert.equal(isOrphanCandidate('portfolio/projects/legacy/cover.png', old, new Set(), now), false);
  assert.equal(isOrphanCandidate(managed, '', new Set(), now), false);
  assert.equal(isOrphanCandidate(managed, new Date(now).toISOString(), new Set(), now), false);
  const refs = referencedStoragePaths({ profile: { fieldPhoto: { path: managed, url: 'https://firebasestorage.googleapis.com/v0/b/example/o/portfolio%2Fshared.png' } } } as SiteData);
  assert.ok(refs.has(managed)); assert.ok(refs.has('portfolio/shared.png'));
});
test('chat body: byte limit applies without Content-Length, including multibyte UTF-8', async () => {
  const request = (text: string) => new Request('http://localhost/api/chat', { method: 'POST', body: text });
  await assert.rejects(readBoundedJson(request(JSON.stringify({ message: 'ş'.repeat(9000) })), 16000), /PAYLOAD_TOO_LARGE/);
  assert.deepEqual(await readBoundedJson(request('{"message":"Hello"}'), 16000), { message: 'Hello' });
  await assert.rejects(readBoundedJson(request('not JSON'), 16000));
});
test('backup import rejects malformed or partial replacement payloads', () => {
  for (const value of [null, [], {}, { projects: [] }]) assert.throws(() => validateSiteDataImport(value));
});
