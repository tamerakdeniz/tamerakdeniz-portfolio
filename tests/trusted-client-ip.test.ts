import test from 'node:test';
import assert from 'node:assert/strict';
import { getClientIp } from '../src/lib/chat-rate-limit';

test('untrusted proxy headers cannot select the burst or durable quota identity', () => {
  for (const supplied of ['192.0.2.1', '192.0.2.2', '2001:db8::9']) {
    const request = new Request('https://example.test/api/chat', { headers: {
      'x-forwarded-for': supplied, 'x-real-ip': supplied,
      'x-vercel-forwarded-for': '203.0.113.7',
    } });
    assert.equal(getClientIp(request, true), '203.0.113.7');
    assert.equal(getClientIp(request, false), 'unknown');
  }
});

test('missing or malformed trusted addresses fail closed to one shared identity', () => {
  for (const value of ['', 'not-an-ip', '203.0.113.7:1234']) {
    const request = new Request('https://example.test/api/contact', { headers: {
      'x-vercel-forwarded-for': value, 'x-forwarded-for': '192.0.2.1',
    } });
    assert.equal(getClientIp(request, true), 'unknown');
  }
  assert.equal(getClientIp(new Request('https://example.test', {
    headers: { 'x-vercel-forwarded-for': '2001:db8::7' },
  }), true), '2001:db8::7');
});
