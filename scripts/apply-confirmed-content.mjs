import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { targetOptions, targetClient } from './firebase-target.mjs';
import { planConfirmedContent } from './confirmed-content-plan.mjs';
try {
  const options = targetOptions({ file: { type: 'string' }, 'database-url': { type: 'string' }, input: { type: 'string' }, output: { type: 'string' }, 'activate-featured': { type: 'boolean' } });
  if (!options.file) throw new Error('Supply an explicit reviewed proposal with --file');
  if (options.input && options.apply) throw new Error('Offline mode is dry-run only');
  const proposal = JSON.parse(await readFile(options.file, 'utf8'));
  const sources = {};
  for (const op of proposal.operations) if (op.sourceFile) sources[op.sourceFile] = JSON.parse(await readFile(op.sourceFile, 'utf8'));
  const client = options.input ? null : targetClient(options);
  const snapshot = options.input ? { value: JSON.parse(await readFile(options.input, 'utf8')) } : await client.snapshot();
  const plan = planConfirmedContent(snapshot.value, proposal, sources, !!options['activate-featured']);
  console.log(JSON.stringify({ project: options.project, dryRun: !options.apply, changed: plan.changed, changes: plan.changes, activateFeatured: !!options['activate-featured'] }, null, 2));
  if (options.output) await writeFile(options.output, JSON.stringify(plan.next), { mode: 0o600 });
  if (options.apply && plan.changed) {
    await mkdir('backups', { recursive: true, mode: 0o700 });
    const file = `backups/confirmed-content-${Date.now()}.json`;
    await writeFile(file, JSON.stringify({ project: options.project, environment: options.environment, before: snapshot.value }), { mode: 0o600, flag: 'wx' });
    await client.replaceSnapshot(plan.next, snapshot.etag);
    console.log(`Applied selected fields atomically; backup ${file}`);
  }
} catch (e) { console.error(e.message); process.exitCode = 1; }
