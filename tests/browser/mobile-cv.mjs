// Mobile CV viewer: real PDF pages at phone widths, desktop iframe unchanged.
// Emulated Chromium only — not a physical handset.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.argv[2] || 'http://localhost:3210';
const out = 'artifacts/mobile-cv';
await mkdir(out, { recursive: true });

const widths = [320, 360, 390, 412, 430];
const results = [];
const browser = await chromium.launch({ channel: 'chrome' });

function record(name, pass, detail = '') {
  results.push({ name, pass: !!pass, detail });
  if (!pass) console.error('FAIL', name, detail);
  else console.log('ok', name);
}

async function paintSample(page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('[data-cv-pages] canvas');
    if (!(canvas instanceof HTMLCanvasElement)) return null;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return null;
    const { width, height } = canvas;
    const pixels = context.getImageData(0, 0, width, height).data;
    let ink = 0;
    const stride = 8 * 4;
    for (let i = 0; i < pixels.length; i += stride) {
      if (pixels[i] < 245 || pixels[i + 1] < 245 || pixels[i + 2] < 245) ink += 1;
    }
    const text = [...document.querySelectorAll('[data-cv-pages] .sr-only')].map((node) => node.textContent || '').join(' ');
    const box = canvas.getBoundingClientRect();
    return {
      pages: document.querySelectorAll('[data-cv-page]').length,
      width,
      height,
      cssWidth: Math.round(box.width),
      cssHeight: Math.round(box.height),
      ink,
      textLength: text.trim().length,
      text: text.replace(/\s+/g, ' ').trim().slice(0, 240),
    };
  });
}

try {
  const home = await fetch(base);
  const html = await home.text();
  record('favicon links stay in the document', html.includes('/favicon-mta-transparent.ico') && html.includes('/favicon-mta-transparent-light.ico'));
  record('Open Graph image stays registered', html.includes('/og-image.png') || html.includes('og-image.png'));

  for (const lang of ['en', 'tr']) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: lang });
    await context.addInitScript((language) => localStorage.setItem('portfolio_language', language), lang);
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    const earlyAssets = [];
    page.on('request', (request) => {
      const url = request.url();
      if (/pdf\.worker|pdfjs-dist|render-cv-pdf/.test(url)) earlyAssets.push(url);
    });
    await page.goto(base, { waitUntil: 'networkidle' });
    const beforeOpen = earlyAssets.length;
    record(`${lang} homepage does not load PDF.js before the viewer opens`, beforeOpen === 0, earlyAssets.join(' '));

    for (const width of widths) {
      await page.setViewportSize({ width, height: 800 });
      await page.click('header a[data-cv-link]');
      const canvas = page.locator('[data-cv-pages] canvas');
      await canvas.first().waitFor({ state: 'visible', timeout: 30000 });
      await page.waitForFunction(() => document.querySelector('[role="dialog"]')?.getAttribute('data-cv-state') === 'ready');
      const sample = await paintSample(page);
      const dialog = await page.locator('[role="dialog"]').boundingBox();
      assert.ok(sample, 'canvas sample');
      assert.ok(sample.pages >= 1, 'page count');
      assert.ok(sample.ink > 40, `ink ${sample.ink}`);
      assert.ok(sample.textLength > 40, `text ${sample.text}`);
      assert.ok(sample.cssWidth >= width - 80 && sample.cssWidth <= width, `css width ${sample.cssWidth} viewport ${width}`);
      assert.ok(dialog && dialog.width <= width + 1);
      record(`${lang} ${width}px renders CV page text`, true, `${sample.pages}p ${sample.cssWidth}px ink=${sample.ink} “${sample.text.slice(0, 80)}”`);
      if (lang === 'en' && width === 390) {
        await page.screenshot({ path: `${out}/en-390.png` });
        const before = sample.cssWidth;
        await page.locator('[data-cv-zoom="in"]').click();
        await page.waitForFunction((start) => {
          const node = document.querySelector('[data-cv-pages] canvas');
          return node instanceof HTMLCanvasElement && node.getBoundingClientRect().width > start + 20;
        }, before);
        const zoomed = await paintSample(page);
        assert.ok(zoomed && zoomed.ink > 40 && zoomed.cssWidth > before);
        record('zoom in enlarges the rendered page', true, `${before} → ${zoomed.cssWidth}`);
        await page.screenshot({ path: `${out}/en-390-zoom.png` });
      }
      if (lang === 'tr' && width === 360) await page.screenshot({ path: `${out}/tr-360.png` });
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => !document.querySelector('[role="dialog"]'));
    }

    await page.setViewportSize({ width: 390, height: 800 });
    await page.route(/\/api\/download-cv|\/resume\/.*\.pdf/, (route) => route.abort());
    await page.click('header a[data-cv-link]');
    await page.getByText(lang === 'tr' ? 'Özgeçmiş burada önizlenemedi' : 'This CV could not be previewed here').waitFor();
    const failed = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const box = dialog?.getBoundingClientRect();
      return {
        state: dialog?.getAttribute('data-cv-state'),
        height: box?.height ?? 0,
        viewport: window.innerHeight,
        canvases: document.querySelectorAll('[data-cv-pages] canvas').length,
        download: !!dialog?.querySelector('a[download]'),
        open: !!dialog?.querySelector('a[target="_blank"]'),
      };
    });
    assert.equal(failed.state, 'error');
    assert.equal(failed.canvases, 0);
    assert.ok(failed.download && failed.open);
    assert.ok(failed.height < failed.viewport * 0.75, `dialog height ${failed.height}`);
    record(`${lang} failed load stays a compact fallback`, true, `height ${Math.round(failed.height)}`);
    await page.screenshot({ path: `${out}/${lang}-error.png` });
    await page.keyboard.press('Escape');
    record(`${lang} viewer produced no page errors`, pageErrors.length === 0, pageErrors.join(' | '));
    await context.close();
  }

  const desktop = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await desktop.newPage();
  const desktopPdf = [];
  page.on('request', (request) => {
    if (/pdf\.worker|pdfjs|render-cv-pdf/.test(request.url())) desktopPdf.push(request.url());
  });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.click('header a[data-cv-link]');
  await page.locator('[role="dialog"] iframe').waitFor();
  const desktopState = await page.evaluate(() => ({
    state: document.querySelector('[role="dialog"]')?.getAttribute('data-cv-state'),
    iframe: !!document.querySelector('[role="dialog"] iframe'),
    pages: document.querySelectorAll('[data-cv-page]').length,
  }));
  assert.equal(desktopState.state, 'desktop');
  assert.equal(desktopState.iframe, true);
  assert.equal(desktopState.pages, 0);
  record('desktop keeps the iframe viewer', true);
  record('desktop viewer does not load PDF.js', desktopPdf.length === 0, desktopPdf.join(' '));
  await page.goto(`${base}/resume`, { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('a[download]').count() > 0, true);
  record('recruiter view still offers the CV download', true);
  await desktop.close();
} catch (error) {
  record(error instanceof Error ? error.message : String(error), false);
  process.exitCode = 1;
} finally {
  await writeFile(`${out}/results.json`, JSON.stringify({ results }, null, 2));
  await browser.close();
  const failed = results.filter((item) => !item.pass);
  console.log(`${results.filter((item) => item.pass).length}/${results.length} checks passed`);
  if (failed.length) process.exitCode = 1;
}
