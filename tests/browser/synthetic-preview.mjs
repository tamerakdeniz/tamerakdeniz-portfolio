// The public Preview must be reproducible entirely from these synthetic fixtures.
import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
const data = JSON.parse(await readFile('content/preview-snapshot.json', 'utf8'));
assert.equal(data.profile.fullName, 'Demo Example');
assert.ok(data.projects.every(p => p.id.startsWith('demo-project-') && p.published === true));
assert.ok(!JSON.stringify(data).match(/firebasestorage|[?&]token=|data:|storageBucket/));
const base = 'http://localhost:3101';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
const external = [];
page.on('request', request => {
  const url = new URL(request.url());
  if (['http:', 'https:'].includes(url.protocol) && !['localhost', '127.0.0.1'].includes(url.hostname)) external.push(url.origin);
});
try {
  for (const route of ['/', '/about', '/projects', '/resume']) {
    const response = await page.goto(base + route);
    assert.equal(response.status(), 200);
    await page.waitForLoadState('networkidle');
    assert.match(await page.locator('body').innerText(), /Demo Example|Demonstration|Synthetic/);
  }
  for (const project of data.projects) {
    assert.equal((await page.goto(`${base}/projects/${project.slug}`)).status(), 200);
    assert.match(await page.locator('main').innerText(), new RegExp(project.title.en));
  }
  const sitemap = await (await fetch(base + '/sitemap.xml')).text();
  const projectPaths = [...sitemap.matchAll(/<loc>[^<]*\/projects\/([^<]+)<\/loc>/g)].map(match => match[1]).sort();
  assert.deepEqual(projectPaths, data.projects.map(p => p.slug).sort());
  const cv = await fetch(base + data.cvFiles[0].dataUrl);
  assert.equal(cv.status, 200);
  assert.match(await cv.text(), /SYNTHETIC DEMONSTRATION - NOT A PERSONAL CV/);
  assert.deepEqual(external, [], 'Synthetic Preview loads no remote media or external service');
  await mkdir('artifacts/release-gate', { recursive: true });
  await writeFile('artifacts/release-gate/synthetic-preview-results.json', JSON.stringify({ pass: true, projects: data.projects.length, externalRequests: 0, syntheticCv: true }));
  console.log('PASS synthetic profile, project routes, sitemap, demonstration CV and zero external requests');
} finally { await browser.close(); }
