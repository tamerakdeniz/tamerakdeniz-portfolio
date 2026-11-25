import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { targetOptions, targetClient } from './firebase-target.mjs';
import { digest, planLegacyDrafts } from './legacy-draft-plan.mjs';
try {
  const options = targetOptions({ 'database-url': { type: 'string' }, input: { type: 'string' }, 'backup-dir': { type: 'string' }, rollback: { type: 'string' } });
  if (options.input && options.apply) throw new Error('Offline input is dry-run only');
  const client = options.input ? null : targetClient(options);
  const snapshot = options.input ? { value: JSON.parse(await readFile(options.input, 'utf8')), etag: null } : await client.snapshot();
  let plan;
  if (options.rollback) {
    const backup = JSON.parse(await readFile(options.rollback, 'utf8'));
    if (backup.project !== options.project || backup.environment !== options.environment) throw new Error('Backup target mismatch');
    // Never silently restore stale content over later admin edits. Inbox changes are preserved.
    const currentContent = { siteData: snapshot.value.siteData, siteDrafts: snapshot.value.siteDrafts ?? null };
    if (digest(currentContent) !== backup.afterContentHash) throw new Error('Content changed after migration; perform a reviewed selective recovery');
    plan = { next: { ...snapshot.value, siteData: backup.before.siteData, siteDrafts: backup.before.siteDrafts ?? null }, changed: true, summary: 'Rollback restores old PUBLIC draft exposure; requires explicit owner approval' };
  } else plan = planLegacyDrafts(snapshot.value);
  console.log(JSON.stringify({ project: options.project, environment: options.environment, dryRun: !options.apply, summary: plan.summary, changed: plan.changed }, null, 2));
  if (options.apply && plan.changed) {
    const dir = options['backup-dir'] || 'backups';
    await mkdir(dir, { recursive: true, mode: 0o700 });
    const backupPath = `${dir}/legacy-drafts-${Date.now()}.json`;
    await writeFile(backupPath, JSON.stringify({ project: options.project, environment: options.environment, before: snapshot.value, afterContentHash: digest({ siteData: plan.next.siteData, siteDrafts: plan.next.siteDrafts ?? null }) }), { mode: 0o600, flag: 'wx' });
    // RTDB supports conditional PUT, not conditional PATCH. A root ETag prevents overwriting
    // ANY intervening write; all unrelated paths come verbatim from the same snapshot.
    await client.replaceSnapshot(plan.next, snapshot.etag);
    console.log(`Atomic migration complete. Private backup: ${backupPath}`);
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
