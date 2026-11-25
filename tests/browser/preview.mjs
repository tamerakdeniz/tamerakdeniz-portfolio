// Requires an isolated preview-mode app at :3101, backed by demo-portfolio emulators.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage();
try {
  await page.goto('http://localhost:3101/admin');
  await page.locator('input[type=email]').fill('admin@example.test');
  await page.locator('input[type=password]').fill('Emulator-only-123!');
  await page.locator('button[type=submit]').click();
  await page.getByText('Preview is read-only. Changes cannot be saved.', { exact: true }).waitFor();
  await page.locator('aside').getByRole('button', { name: /Profile & display/ }).click();
  await page.getByLabel('Full display name', { exact: true }).fill('PREVIEW MUST NOT SAVE');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.waitForTimeout(500);
  const response = await fetch('http://127.0.0.1:9000/siteData/profile/fullName.json?ns=demo-portfolio-default-rtdb');
  assert.notEqual(await response.json(), 'PREVIEW MUST NOT SAVE');
  await page.screenshot({ path: 'artifacts/preview-readonly.png', fullPage: true });
  await writeFile('artifacts/preview-results.json', JSON.stringify({ notice: true, saveBlocked: true, environment: 'temporary preview-mode dev copy; fixed demo-portfolio services' }));
  console.log('PASS preview notice and blocked save');
} finally { await browser.close(); }
