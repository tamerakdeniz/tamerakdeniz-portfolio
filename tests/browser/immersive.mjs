// node interact.js <outdir> <base-url>
// Keyboard, touch, CV viewer, assistant and a mocked contact submission. Nothing is written to Firebase.
import { chromium } from 'playwright';
import fs from 'node:fs';

const [out, base] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const results = [];
const ok = (name, pass, detail = '') => results.push({ name, pass: !!pass, detail });

async function guard(ctx, log) {
  await ctx.route(/firebaseio\.com|firebasedatabase\.app|127\.0\.0\.1:9000/, (route) => {
    const r = route.request();
    if (r.method() !== 'GET') {
      log.push({ method: r.method(), url: r.url(), body: r.postData() });
      return route.fulfill({ status: 200, contentType: 'application/json', body: r.postData() || '{}' });
    }
    return route.continue();
  });
  await ctx.route('**/api/contact', (route) => { log.push({ method: route.request().method(), url: route.request().url(), body: route.request().postData() }); return route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
  await ctx.route('**/api/chat', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ reply: 'Mocked reply: these are synthetic demonstration projects.' }) })
  );
}

const focusInfo = (page) =>
  page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    return {
      tag: el.tagName,
      text: (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60),
      href: el.getAttribute('href'),
      visible: (() => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < innerHeight && r.width > 0;
      })(),
      outline: getComputedStyle(el).outlineStyle + ' ' + getComputedStyle(el).outlineWidth,
    };
  });

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
  const errors = [];

  /* ---------- Desktop keyboard ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const writes = [];
    await guard(ctx, writes);
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push('desktop pageerror: ' + e.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);

    await page.keyboard.press('Tab');
    const f1 = await focusInfo(page);
    ok('Tab 1 lands on skip link', /skip|atla/i.test(f1?.text || ''), JSON.stringify(f1));
    await page.screenshot({ path: `${out}/kb-01-skip.png` });

    const order = [];
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      order.push(await focusInfo(page));
    }
    ok('Header tab order reaches Index trigger', order.some((o) => /index|surface|yüzey/i.test(o?.text || '')), order.map((o) => o?.text).join(' | '));
    ok('Every focused element is visible', order.every((o) => o?.visible), '');

    // Open index via its trigger, then Esc
    await page.focus('button[aria-controls="expedition-index"]');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(700);
    const dlg = await page.evaluate(() => {
      const d = document.getElementById('expedition-index');
      return { open: !!d && getComputedStyle(d).display !== 'none' && !d.hidden, focusInside: !!d && d.contains(document.activeElement) };
    });
    ok('Index opens with Enter and traps focus inside', dlg.open && dlg.focusInside, JSON.stringify(dlg));
    for (let i = 0; i < 3; i++) await page.keyboard.press('Tab');
    await page.screenshot({ path: `${out}/kb-02-index-tab.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(600);
    const after = await focusInfo(page);
    const closed = await page.evaluate(() => {
      const d = document.getElementById('expedition-index');
      return !d || d.hidden || getComputedStyle(d).display === 'none';
    });
    ok('Esc closes Index and returns focus to trigger', closed && /surface|index|yüzey/i.test(after?.text || ''), JSON.stringify(after));

    // Work plate focus-scroll: focus the 3rd plate's CTA, check it is visible
    const ctas = page.locator('#work a.btn-primary');
    const n = await ctas.count();
    await ctas.nth(n - 1).focus();
    await page.waitForTimeout(1400);
    const last = await focusInfo(page);
    ok('Focusing the last work CTA scrolls its plate into view', last?.visible, JSON.stringify(last));
    await page.screenshot({ path: `${out}/kb-03-work-focus.png` });

    // Lab rows with arrows
    const rows = page.locator('#lab [data-row]');
    await rows.nth(1).focus();
    await page.waitForTimeout(400);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(600);
    const lab = await page.evaluate(() => {
      const a = document.activeElement;
      return { text: a?.textContent?.trim().slice(0, 40), expanded: a?.getAttribute('aria-expanded'), idx: [...document.querySelectorAll('#lab [data-row]')].indexOf(a) };
    });
    ok('ArrowDown moves between lab rows and selects', lab.idx === 3 && lab.expanded === 'true', JSON.stringify(lab));
    await page.screenshot({ path: `${out}/kb-04-lab-arrows.png` });
    await page.keyboard.press('End');
    await page.waitForTimeout(300);
    const end = await page.evaluate(() => [...document.querySelectorAll('#lab [data-row]')].indexOf(document.activeElement));
    const total = await rows.count();
    ok('End jumps to last lab row', end === total - 1, `${end}/${total - 1}`);

    // Architecture nodes
    const nodes = page.locator('#engineering button[aria-controls=arch-detail]');
    const nc = await nodes.count();
    if (nc) {
      await nodes.nth(nc - 1).focus();
      await page.waitForTimeout(500);
      const detail = await page.evaluate(() => document.getElementById('arch-detail')?.querySelector('h3')?.textContent);
      ok('Focusing an architecture node updates the detail', !!detail, detail);
      await page.screenshot({ path: `${out}/kb-05-arch-focus.png` });
    } else ok('Architecture nodes found', false, 'no [data-node]');

    // Assistant hash
    await page.evaluate(() => (location.hash = '#assistant'));
    await page.waitForTimeout(1400);
    const asst = await page.evaluate(() => ({ tag: document.activeElement?.tagName, inAssistant: !!document.activeElement?.closest('#assistant') }));
    ok('#assistant hash opens the assistant and focuses its input', asst.inAssistant && asst.tag === 'INPUT', JSON.stringify(asst));
    await page.keyboard.type('Which demonstration projects are available?');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2500);
    const reply = await page.evaluate(() => document.querySelector('#assistant')?.textContent?.includes('Mocked reply'));
    ok('Assistant sends and renders a reply (mocked /api/chat)', reply);
    await page.screenshot({ path: `${out}/kb-06-assistant.png` });

    // CV viewer
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(400);
    await page.click('header a[data-cv-link]');
    await page.waitForTimeout(1200);
    const cv = await page.evaluate(() => {
      const d = [...document.querySelectorAll('[role=dialog]')].find((x) => x.querySelector('iframe, object, embed') || /cv|özgeçmiş|resume/i.test(x.textContent));
      return { open: !!d, focusInside: !!d && d.contains(document.activeElement) };
    });
    ok('CV link opens the in-page viewer with focus inside', cv.open && cv.focusInside, JSON.stringify(cv));
    await page.screenshot({ path: `${out}/cv-01-open.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    const cvClosed = await page.evaluate(() => ![...document.querySelectorAll('[role=dialog][aria-modal=true]')].some((d) => d.offsetParent));
    ok('Esc closes the CV viewer', cvClosed);

    // Contact form: validation, then mocked submission
    await page.evaluate(() => document.getElementById('contact')?.scrollIntoView());
    await page.waitForTimeout(800);
    const det = page.locator('#contact details').first();
    if (await det.count()) {
      const open = await det.evaluate((d) => d.open);
      if (!open) await det.locator('summary').click();
    }
    await page.waitForTimeout(400);
    await page.locator('#contact button[type=submit]').click();
    await page.waitForTimeout(400);
    const inv = await page.evaluate(() => ({ invalid: document.querySelectorAll('#contact [aria-invalid=true]').length, focus: document.activeElement?.getAttribute('name') }));
    ok('Empty submit shows errors and focuses the first field', inv.invalid === 4 && inv.focus === 'name', JSON.stringify(inv));
    await page.screenshot({ path: `${out}/contact-01-errors.png` });
    await page.fill('#contact [name=name]', 'Playwright Test');
    await page.fill('#contact [name=email]', 'test@example.com');
    await page.fill('#contact [name=subject]', 'Mocked');
    await page.fill('#contact [name=message]', 'Intercepted test message; never reaches Firebase.');
    await page.locator('#contact button[type=submit]').click();
    await page.waitForTimeout(1500);
    const sent = await page.evaluate(() => document.querySelector('#contact form')?.parentElement?.textContent || '');
    ok('Mocked submit uses protected contact endpoint', writes.length === 1 && writes[0].url.endsWith('/api/contact') && JSON.parse(writes[0].body).challengeToken === 'emulator-test-token' && writes[0].method === 'POST', JSON.stringify(writes.map((w) => w.method + ' ' + w.url.replace(/^https:\/\/[^/]+/, '<db>'))));
    ok('Success message rendered', /sent|thank|gönderildi|teşekkür|received|aldım/i.test(sent), sent.slice(-160));
    await page.screenshot({ path: `${out}/contact-02-sent.png` });

    // Ascend
    await page.locator('#contact a[href="#surface"]').first().click();
    await page.waitForTimeout(2500);
    const top = await page.evaluate(() => ({ y: scrollY, focus: document.activeElement?.tagName }));
    ok('Ascend returns to the surface and focuses the h1', top.y < 50 && top.focus === 'H1', JSON.stringify(top));
    await ctx.close();
  }

  /* ---------- Touch (390x844) ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
    await guard(ctx, []);
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push('touch pageerror: ' + e.message));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1200);
    const thumb = page.locator('button[aria-controls="expedition-index"]').last();
    await thumb.tap();
    await page.waitForTimeout(800);
    const open = await page.evaluate(() => { const d = document.getElementById('expedition-index'); return !!d && !d.hidden && getComputedStyle(d).display !== 'none'; });
    ok('Touch: thumb button opens the Index', open);
    await page.screenshot({ path: `${out}/touch-01-index.png` });
    await page.locator('#expedition-index a[href="#lab"]').first().tap();
    await page.waitForTimeout(2000);
    const at = await page.evaluate(() => Math.round(document.getElementById('lab').getBoundingClientRect().top));
    ok('Touch: tapping a chapter jumps there', Math.abs(at) < 120, `lab top ${at}`);
    await page.screenshot({ path: `${out}/touch-02-jumped-lab.png` });
    const row = page.locator('#lab [data-row]').nth(2);
    await row.scrollIntoViewIfNeeded();
    await row.tap();
    await page.waitForTimeout(700);
    const exp = await row.getAttribute('aria-expanded');
    ok('Touch: tapping a lab row expands it', exp === 'true');
    await page.screenshot({ path: `${out}/touch-03-lab-row.png` });
    await row.tap();
    await page.waitForTimeout(400);
    ok('Touch: tapping again collapses it', (await row.getAttribute('aria-expanded')) === 'false');
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok('Touch: no horizontal overflow', ov <= 0, String(ov));
    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(`${out}/results.json`, JSON.stringify({ results, errors }, null, 2));
  for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.pass ? '' : '  -> ' + r.detail}`);
  console.log('errors:', errors);
  if (errors.length || results.some(r => !r.pass)) process.exitCode = 1;
})();
