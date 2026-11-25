import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { generateChatWithModelFallback } from '../src/lib/gemini-chat';

test('assistant uses mocked provider fallback and bounded output; no external quota', async () => {
  const calls: { body: Record<string, unknown> }[] = [];
  const stub = mock.method(globalThis, 'fetch', async (_input: unknown, init: RequestInit) => {
    calls.push({ body: JSON.parse(String(init.body)) });
    if (calls.length === 1) return new Response(JSON.stringify({ error: { message: 'Unavailable' } }), { status: 503 });
    return new Response(JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: 'Synthetic provider response.' }] }, finishReason: 'STOP' }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
  try {
    const result = await generateChatWithModelFallback({ apiKey: 'test-not-a-real-key', systemInstruction: 'Published context only', prompt: 'Test', maxOutputTokens: 512, timeoutMs: 200 });
    assert.equal(result, 'Synthetic provider response.');
    assert.equal(calls.length, 2);
    assert.equal((calls[0].body.generationConfig as { maxOutputTokens: number }).maxOutputTokens, 512);
  } finally { stub.mock.restore(); }
});
