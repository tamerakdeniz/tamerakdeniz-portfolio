import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.addInitScript(() => {
  window.sceneDraws = 0;
  const draw = WebGL2RenderingContext.prototype.drawArrays;
  WebGL2RenderingContext.prototype.drawArrays = function (...args) {
    window.sceneDraws++;
    return draw.apply(this, args);
  };
});
const results = [];
try {
  await page.goto('http://localhost:3100');
  await page.waitForFunction(() => document.documentElement.dataset.scene === 'on');
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
  const before = await page.evaluate(() => window.sceneDraws);
  await page.waitForTimeout(600);
  assert.equal(await page.evaluate(() => window.sceneDraws), before);
  results.push({ name: 'Simulated document visibility pauses actual WebGL draw calls', pass: true });
  await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
  await page.waitForTimeout(500);
  assert.ok(await page.evaluate((before) => window.sceneDraws > before, before));
  results.push({ name: 'Foreground visibility resumes drawing', pass: true });
  await page.locator('footer a[href="/projects"]').click();
  await page.waitForURL('**/projects');
  assert.equal(await page.locator('.ocean-canvas').count(), 0);
  const afterNavigation = await page.evaluate(() => window.sceneDraws);
  await page.waitForTimeout(400);
  assert.equal(await page.evaluate(() => window.sceneDraws), afterNavigation);
  results.push({ name: 'Client navigation unmounts canvas and stops drawing', pass: true });
} catch (error) { results.push({ name: error.message, pass: false }); process.exitCode = 1; }
finally { await writeFile('artifacts/scene-lifecycle.json', JSON.stringify(results, null, 2)); await browser.close(); }
console.log(results);
