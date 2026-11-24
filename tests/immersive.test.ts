import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { parsePeriod } from '@/lib/content/portfolio';
import { assetSpecFor } from '@/lib/content/assets';
import { EDGES, NODES } from '@/lib/content/architecture';

const ym = (m: number | null) => (m === null ? null : [Math.floor(m / 12), (m % 12) + 1]);

test('periods: month names, full names, open ends and bare years', () => {
  const now = new Date(2026, 10, 25);
  assert.deepEqual(ym(parsePeriod('Mar 2026 - July 2026', now).start), [2026, 3]);
  assert.deepEqual(ym(parsePeriod('Mar 2026 - July 2026', now).end), [2026, 7]);
  assert.deepEqual(ym(parsePeriod('April 2025 - Jun 2025', now).start), [2025, 4]);
  assert.deepEqual(ym(parsePeriod('Nov 2023 - Present', now).end), [2026, 11]);
  assert.deepEqual(ym(parsePeriod('2020', now).start), [2020, 1]);
  assert.equal(parsePeriod('no date here', now).start, null);
});

test('assets: known logos get matched backplates, unknown images a neutral one', () => {
  assert.equal(assetSpecFor('eren-karot').plate, 'black');
  assert.equal(assetSpecFor('adana-panjur').plate, 'ink');
  const unknown = assetSpecFor('something-new');
  assert.equal(unknown.kind, 'logo');
  assert.equal(unknown.plate, 'white');
});

test('architecture: every edge joins real nodes and every cited file exists', () => {
  const ids = new Set(NODES.map((n) => n.id));
  assert.equal(ids.size, NODES.length);
  for (const e of EDGES) {
    assert.ok(ids.has(e.from), `${e.id} from ${e.from}`);
    assert.ok(ids.has(e.to), `${e.id} to ${e.to}`);
  }
  for (const n of NODES) {
    assert.ok(EDGES.some((e) => e.from === n.id || e.to === n.id), `${n.id} is connected`);
    for (const f of n.files) assert.ok(existsSync(f), `${n.id}: ${f} exists`);
  }
});
