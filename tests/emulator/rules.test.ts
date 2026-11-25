import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { ADMIN, USER, PNG, db, resetDb, upload, removeObject, getObject } from './env';

const sv = { '.sv': 'timestamp' };

function submission(id: string, extra: Record<string, unknown> = {}) {
  return {
    [`contactSubmissions/${id}`]: {
      id,
      name: 'Rules Test',
      email: 'rules@example.test',
      subject: 'Hello',
      message: 'Synthetic emulator message.',
      timestamp: new Date().toISOString(),
      read: false,
      createdAt: sv,
      ...extra,
    },
    'contactMeta/lastAt': sv,
    'contactMeta/lastId': id,
  };
}

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

describe('Realtime Database rules', () => {
  beforeEach(resetDb);

  it('lets anyone read siteData but only admins write it', async () => {
    await db('PUT', 'siteData', { projects: [] }, 'owner');
    assert.equal((await db('GET', 'siteData')).status, 200);
    assert.equal((await db('PUT', 'siteData/projects', [], null)).status, 401);
    assert.equal((await db('PUT', 'siteData/projects', [], USER)).status, 401, 'signed-in non-admin');
    assert.equal((await db('PUT', 'siteData/projects', [], ADMIN)).status, 200);
  });

  it('keeps drafts private to admins', async () => {
    await db('PUT', 'siteDrafts/projects/p1', { id: 'p1', published: false }, 'owner');
    assert.equal((await db('GET', 'siteDrafts')).status, 401);
    assert.equal((await db('GET', 'siteDrafts', undefined, USER)).status, 401);
    assert.equal((await db('GET', 'siteDrafts', undefined, ADMIN)).status, 200);
  });

  it('accepts the admin save shape (siteData + siteDrafts in one update) only from admins', async () => {
    const save = { siteData: { projects: [{ id: 'a', published: true }] }, siteDrafts: { projects: [{ id: 'b' }] } };
    assert.equal((await db('PATCH', '', save, USER)).status, 401);
    assert.equal((await db('PATCH', '', save, ADMIN)).status, 200);
    assert.equal((await db('GET', 'siteData/projects/0/id')).body, 'a');
  });

  it('accepts one well-formed anonymous submission and throttles the next', async () => {
    const first = await db('PATCH', '', submission(newId()));
    assert.equal(first.status, 200, JSON.stringify(first.body));
    const second = await db('PATCH', '', submission(newId()));
    assert.equal(second.status, 401, 'second submission inside the throttle window');
  });

  it('rejects malformed or oversized submissions', async () => {
    const cases: Record<string, unknown>[] = [
      { read: true },
      { message: 'x'.repeat(5001) },
      { email: 'not-an-email' },
      { name: '' },
      { extra: 'field' },
      { createdAt: 1 },
    ];
    for (const extra of cases) {
      await resetDb();
      const res = await db('PATCH', '', submission(newId(), extra));
      assert.equal(res.status, 401, `should reject ${JSON.stringify(extra).slice(0, 40)}`);
    }
    await resetDb();
    const noThrottle = submission(newId());
    delete (noThrottle as Record<string, unknown>)['contactMeta/lastAt'];
    assert.equal((await db('PATCH', '', noThrottle)).status, 401, 'must stamp contactMeta/lastAt');
    await resetDb();
    assert.equal((await db('PATCH', '', submission('../../siteData'))).status, 400);
  });

  it('rejects the old single-path PUT, which carries no server timestamps', async () => {
    const id = newId();
    const entry = { id, name: 'A', email: 'a@b.co', subject: 'S', message: 'M', timestamp: new Date().toISOString(), read: false };
    assert.equal((await db('PUT', `contactSubmissions/${id}`, entry)).status, 401);
  });

  it('prevents cooldown deletion, standalone lockout, and batched submissions', async () => {
    assert.equal((await db('PUT', 'contactMeta/lastAt', sv)).status, 401);
    const first = newId();
    assert.equal((await db('PATCH', '', submission(first))).status, 200);
    assert.equal((await db('DELETE', 'contactMeta/lastAt')).status, 401);
    assert.equal((await db('DELETE', 'contactMeta')).status, 401);
    assert.equal((await db('PATCH', '', { ...submission(newId()), 'contactMeta/lastAt': null })).status, 401);
    await resetDb();
    assert.equal((await db('PATCH', '', { ...submission(newId()), ...submission(newId()) })).status, 401);
  });

  it('refuses accidental drafts in public collections', async () => {
    for (const collection of ['projects', 'skills', 'timeline']) {
      assert.equal((await db('PUT', `siteData/${collection}/0`, { id: 'private', published: false }, ADMIN)).status, 401);
    }
  });

  it('never lets visitors read, edit or delete submissions', async () => {
    const id = newId();
    await db('PATCH', '', submission(id));
    assert.equal((await db('GET', 'contactSubmissions')).status, 401);
    assert.equal((await db('GET', 'contactSubmissions', undefined, USER)).status, 401);
    assert.equal((await db('PUT', `contactSubmissions/${id}/read`, true)).status, 401);
    assert.equal((await db('DELETE', `contactSubmissions/${id}`)).status, 401);
    assert.equal((await db('DELETE', `contactSubmissions/${id}`, undefined, USER)).status, 401);
    assert.equal((await db('PUT', `contactSubmissions/${id}/read`, true, ADMIN)).status, 200);
    assert.equal((await db('PUT', `contactSubmissions/${id}/important`, true, ADMIN)).status, 200);
    assert.equal((await db('DELETE', `contactSubmissions/${id}`, undefined, ADMIN)).status, 200);
  });

  it('denies unknown top-level paths', async () => {
    assert.equal((await db('PUT', 'anything', 1, ADMIN)).status, 401);
    assert.equal((await db('GET', 'activityLog', undefined, USER)).status, 401);
  });
});

describe('Storage rules', () => {
  it('lets admins upload allowed media and nobody else', async () => {
    const path = `portfolio/projects/rules/${Date.now()}.png`;
    assert.equal((await upload(path, PNG, 'image/png', null)).status, 403);
    assert.equal((await upload(path, PNG, 'image/png', USER)).status, 403);
    assert.equal((await upload(path, PNG, 'image/png', ADMIN)).status, 200);
    assert.equal(await getObject(path), 200, 'public read');
  });

  it('rejects disallowed types, oversized files and paths outside portfolio/', async () => {
    assert.equal((await upload(`portfolio/x/${Date.now()}.svg`, PNG, 'image/svg+xml', ADMIN)).status, 403);
    assert.equal((await upload(`portfolio/x/${Date.now()}.html`, PNG, 'text/html', ADMIN)).status, 403);
    const big = new Uint8Array(10 * 1024 * 1024 + 1);
    assert.equal((await upload(`portfolio/x/${Date.now()}.png`, big, 'image/png', ADMIN)).status, 403);
    assert.equal((await upload(`elsewhere/${Date.now()}.png`, PNG, 'image/png', ADMIN)).status, 403);
  });

  it('only admins delete', async () => {
    const path = `portfolio/projects/rules/del-${Date.now()}.png`;
    await upload(path, PNG, 'image/png', ADMIN);
    assert.equal(await removeObject(path, USER), 403);
    assert.equal(await removeObject(path, ADMIN), 204);
  });
});
