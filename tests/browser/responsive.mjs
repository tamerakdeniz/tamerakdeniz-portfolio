import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base = 'http://localhost:3100';
const out = 'artifacts/responsive';
await mkdir(out, { recursive: true });
const results = [];
const errors = [];
const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
try {
  for (const lang of ['en', 'tr']) {
    const context = await browser.newContext({ storageState: 'artifacts/cms-lifecycle/admin-session.json' });
    await context.addInitScript((lang) => localStorage.setItem('portfolio_language', lang), lang);
    const page = await context.newPage();
    page.on('pageerror', (e) => errors.push(e.message));
    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of ['/', '/projects', '/projects/demo-project-1', '/projects/demo-project-2', '/resume', '/admin']) {
        const response = await page.goto(base + route);
        assert.equal(response.status(), 200, route);
        await page.evaluate(() => document.fonts.ready);
        if (route === '/admin') await page.locator('aside').waitFor({ state: 'attached' });
        await page.waitForTimeout(350);
        const dimensions = await page.evaluate(() => ({ viewport: innerWidth, scroll: document.documentElement.scrollWidth, lang: document.documentElement.lang, scene: document.documentElement.dataset.scene || 'fallback' }));
        assert.ok(dimensions.scroll <= width + 1, `${lang} ${width} ${route}: overflow ${dimensions.scroll}`);
        assert.equal(dimensions.lang, lang);
        const name = `${lang}-${width}-${route.replaceAll('/', '_') || 'home'}`;
        await page.screenshot({ path: `${out}/${name}.png`, fullPage: route !== '/' });
        results.push({ lang, width, route, pass: true, ...dimensions });
      }
    }
    await context.close();
  }
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, storageState: 'artifacts/cms-lifecycle/admin-session.json' });
  const admin = await context.newPage();
  await admin.goto(base + '/admin');
  await admin.locator('aside').getByRole('button', { name: /Profile & display/ }).click();
  const home = await context.newPage();
  for (const count of [0, 1, 3, 6]) {
    await admin.getByLabel('Featured project count', { exact: true }).fill(String(count));
    const saved = admin.waitForResponse((r) => r.url().endsWith('/api/revalidate'));
    await admin.getByRole('button', { name: 'Save', exact: true }).click();
    assert.equal((await saved).status(), 200);
    await home.goto(base);
    assert.equal(await home.locator('#work [data-plate-i]').count(), count);
    await home.locator('#work').scrollIntoViewIfNeeded();
    await home.screenshot({ path: `${out}/featured-${count}.png` });
    results.push({ name: `Featured count ${count} saved through admin`, pass: true });
  }
  await home.goto(base);
  await home.waitForTimeout(1500);
  const gpu = await home.evaluate(() => {
    const canvas = document.querySelector('.ocean-canvas');
    const gl = canvas?.getContext('webgl2');
    const ext = gl?.getExtension('WEBGL_debug_renderer_info');
    return { active: document.documentElement.dataset.scene === 'on', renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : null };
  });
  if (gpu.active) {
    await home.evaluate(() => document.querySelector('.ocean-canvas').dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
    assert.equal(await home.locator('html').getAttribute('data-scene'), null);
  }
  results.push({ name: 'WebGL capability and context loss', pass: true, ...gpu, contextLossTested: gpu.active });
  await home.emulateMedia({ reducedMotion: 'reduce' });
  await home.goto(base);
  await home.waitForTimeout(800);
  assert.equal(await home.locator('.ocean-canvas').count(), 0);
  await home.mouse.wheel(0, 800);
  await home.waitForTimeout(400);
  assert.ok(await home.evaluate(() => scrollY > 0));
  results.push({ name: 'Reduced motion uses fallback and native wheel scroll', pass: true });
  assert.deepEqual(errors, []);
} catch (e) { results.push({ name: e.message, pass: false }); console.error(e); process.exitCode = 1; }
finally { await writeFile(`${out}/results.json`, JSON.stringify({ results, errors }, null, 2)); await browser.close(); }
console.log(`${results.filter((r) => r.pass).length}/${results.length} responsive and lifecycle checks passed`);
