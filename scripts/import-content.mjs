import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { targetClient, targetOptions } from './firebase-target.mjs';

const list = (value) => value ? Object.values(value).filter(Boolean) : [];
const localized = (value) => value && typeof value.en === 'string' && typeof value.tr === 'string';
try {
  const options = targetOptions({ file: { type: 'string' }, 'database-url': { type: 'string' }, 'media-manifest': { type: 'string' }, bucket: { type: 'string' }, 'backup-dir': { type: 'string' } });
  if (!options.file) throw new Error('Specify --file content/portfolio-candidates.json');
  const input = JSON.parse(await readFile(options.file, 'utf8'));
  if (input.version !== 1) throw new Error('Expected content schema version 1');
  const allowed = ['projects', 'skills', 'timeline'];
  if (Object.keys(input).some((key) => !['version', ...allowed].includes(key))) throw new Error('Import is scoped to projects, skills and timeline only');
  for (const collection of allowed) {
    if (input[collection] === undefined) continue;
    if (!Array.isArray(input[collection])) throw new Error(`${collection} must be an array`);
    const ids = new Set();
    for (const item of input[collection]) {
      if (!item || typeof item.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(item.id) || ids.has(item.id)) throw new Error(`Invalid or duplicate stable ID in ${collection}`);
      ids.add(item.id);
      if (item.published !== false) throw new Error(`Draft-first import requires published:false: ${item.id}`);
      if (collection !== 'skills' && (!localized(item.title) || !localized(item.description))) throw new Error(`Both languages are required: ${item.id}`);
      if (collection === 'projects' && (!Array.isArray(item.techStack) || !item.category || typeof item.image !== 'string')) throw new Error(`Incomplete project: ${item.id}`);
      if (collection === 'timeline' && (!localized(item.company) || !localized(item.period) || !['work','education','certification','achievement'].includes(item.type))) throw new Error(`Incomplete timeline: ${item.id}`);
    }
  }
  const client = targetClient(options);
  const [publicData, drafts] = await Promise.all([client.db('siteData'), client.db('siteDrafts')]);
  const patch = {};
  for (const collection of allowed) {
    if (!input[collection]?.length) continue;
    const publicIds = new Set(list(publicData?.[collection]).map((item) => item.id));
    const old = new Map(list(drafts?.[collection]).map((item) => [item.id, item]));
    for (const candidate of input[collection]) {
      if (publicIds.has(candidate.id)) throw new Error(`Refusing to overwrite published ${collection}/${candidate.id}; edit through admin`);
      old.set(candidate.id, candidate);
    }
    patch[`siteDrafts/${collection}`] = [...old.values()];
  }
  const mediaDocument = options['media-manifest'] ? JSON.parse(await readFile(options['media-manifest'], 'utf8')) : [];
  const assets = Array.isArray(mediaDocument) ? mediaDocument : mediaDocument.assets;
  if (!Array.isArray(assets)) throw new Error('Media manifest must be an array or contain assets[]');
  const uploads = [];
  for (const asset of assets) {
    const project = patch['siteDrafts/projects']?.find((item) => item.id === asset.projectId);
    if (!project || !asset.mediaId || !localized(asset.alt)) throw new Error('Manifest must reference an imported project and include mediaId and bilingual alt');
    const file = path.resolve(asset.file);
    const bytes = await readFile(file);
    const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };
    const ext = extensions[asset.contentType];
    if (!ext || !bytes.length || bytes.length > 10 * 1024 * 1024) throw new Error(`Invalid media type or size: ${asset.mediaId}`);
    const hash = createHash('sha256').update(bytes).digest('hex');
    if (asset.sha256 && asset.sha256 !== hash) throw new Error(`Media checksum mismatch: ${asset.mediaId}`);
    const objectPath = `portfolio/projects/${project.id}/import-${hash}.${ext}`;
    const bucket = options.environment === 'emulator' ? 'demo-portfolio.appspot.com' : options.bucket;
    if (!bucket || ![`${options.project}.appspot.com`, `${options.project}.firebasestorage.app`].includes(bucket)) throw new Error('Specify a Storage bucket belonging to the explicit target project');
    uploads.push({ asset, project, bytes, objectPath, bucket });
  }
  console.log(JSON.stringify({ environment: options.environment, project: options.project, dryRun: !options.apply, paths: Object.keys(patch), candidates: Object.fromEntries(allowed.map((key) => [key, input[key]?.length ?? 0])), mediaFiles: uploads.length }, null, 2));
  if (options.apply) {
    const backupDir = options['backup-dir'] || 'backups';
    await mkdir(backupDir, { recursive: true, mode: 0o700 });
    const backup = path.join(backupDir, `content-${Date.now()}.json`);
    await writeFile(backup, JSON.stringify({ project: options.project, environment: options.environment, siteData: publicData, siteDrafts: drafts }, null, 2), { mode: 0o600 });
    for (const upload of uploads) {
      const { asset, project, bytes, objectPath, bucket } = upload;
      const base = `${client.storageOrigin}/v0/b/${bucket}/o`;
      const headers = { Authorization: `Bearer ${client.token}` };
      let response = await fetch(`${base}/${encodeURIComponent(objectPath)}`, { headers });
      let metadata;
      if (response.status === 404) {
        const boundary = `upload-${randomUUID()}`;
        const body = Buffer.concat([Buffer.from(`--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify({ name: objectPath, contentType: asset.contentType, cacheControl: 'public,max-age=31536000,immutable', metadata: { firebaseStorageDownloadTokens: randomUUID() } })}\r\n--${boundary}\r\nContent-Type: ${asset.contentType}\r\n\r\n`), bytes, Buffer.from(`\r\n--${boundary}--`)]);
        response = await fetch(`${base}?name=${encodeURIComponent(objectPath)}`, { method: 'POST', headers: { ...headers, 'Content-Type': `multipart/related; boundary=${boundary}`, 'X-Goog-Upload-Protocol': 'multipart' }, body });
      }
      if (!response.ok) throw new Error(`Media upload/read failed: ${asset.mediaId} (${response.status}); content was not saved`);
      metadata = await response.json();
      const token = metadata.downloadTokens || metadata.metadata?.firebaseStorageDownloadTokens;
      const url = `${base}/${encodeURIComponent(objectPath)}?alt=media${token ? `&token=${encodeURIComponent(token.split(',')[0])}` : ''}`;
      const media = { id: asset.mediaId, kind: asset.kind, url, path: objectPath, alt: asset.alt, caption: asset.caption || { en: '', tr: '' }, contentType: asset.contentType, width: asset.width, height: asset.height, order: asset.order ?? uploads.indexOf(upload) };
      project.media = [...(project.media || []).filter((item) => item.id !== asset.mediaId), media];
    }
    // Detect concurrent changes after potentially long uploads; stop instead of overwriting them.
    const fresh = await client.db('siteDrafts');
    if (JSON.stringify(fresh) !== JSON.stringify(drafts)) throw new Error('Drafts changed during import. No database write performed; retry after reviewing the other editor.');
    if (Object.keys(patch).length) await client.db('', 'PATCH', patch);
    console.log(`Imported private drafts. Backup: ${backup}. Publish reviewed records from the admin panel.`);
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
