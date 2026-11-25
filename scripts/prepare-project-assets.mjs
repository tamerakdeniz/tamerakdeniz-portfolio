// Local, explicit preparation only: no Firebase client, credentials, uploads or publishing.
import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { parseArgs } from 'node:util';
import sharp from 'sharp';

const root = process.cwd();
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const list = (value) => value ? Object.values(value).filter(Boolean) : [];
const safeId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]+$/.test(value);
const bilingual = (value) => value && typeof value.en === 'string' && value.en.trim() && typeof value.tr === 'string' && value.tr.trim();
const classifications = ['authentic-web', 'authentic-native', 'simulated-demo', 'ai-concept', 'editorial-illustration', 'architecture-diagram', 'logo', 'video'];
const verifications = ['verified', 'simulated', 'conceptual', 'unverified'];
const kinds = ['cover', 'desktop', 'mobile', 'diagram', 'logo', 'video'];
const json = async (file) => JSON.parse(await readFile(file, 'utf8'));
const relative = (file) => path.relative(root, file).split(path.sep).join('/');
const writeJson = async (file, value) => writeFile(file, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });

try {
  const { values } = parseArgs({ options: {
    input: { type: 'string', multiple: true }, project: { type: 'string' }, all: { type: 'boolean', default: false },
    assets: { type: 'string' }, output: { type: 'string', default: 'artifacts/project-assets' },
    directions: { type: 'string' }, capture: { type: 'boolean', default: false },
    'browser-channel': { type: 'string' },
  } });
  if (!values.input?.length || (!values.project && !values.all) || (values.project && values.all)) throw new Error('Use --input EXPORT.json [--input CANDIDATES.json] and exactly one of --project ID or --all');
  const output = path.resolve(values.output);
  const artifactRoot = path.resolve(root, 'artifacts');
  if (output !== artifactRoot && !output.startsWith(`${artifactRoot}${path.sep}`)) throw new Error('Output must stay inside ignored artifacts/; inventory can contain private draft records');
  const records = new Map();
  for (const file of values.input) {
    const data = await json(file);
    for (const record of list(data.projects ?? data.siteData?.projects)) {
      if (!safeId(record.id)) throw new Error('Every project needs a safe stable ID');
      if (records.has(record.id)) throw new Error(`Duplicate input project: ${record.id}; choose the reviewed version explicitly`);
      records.set(record.id, record);
    }
  }
  const selected = values.all ? [...records.values()] : [records.get(values.project)].filter(Boolean);
  if (!selected.length) throw new Error(`Project not found: ${values.project}`);
  const directions = values.directions ? await json(values.directions) : { projects: [] };
  const assetsDocument = values.assets ? await json(values.assets) : [];
  const sources = Array.isArray(assetsDocument) ? assetsDocument : assetsDocument.assets;
  if (!Array.isArray(sources)) throw new Error('Assets must be an array or contain assets[]');
  await mkdir(output, { recursive: true, mode: 0o700 });
  const manifest = { version: 1, purpose: 'local-review-only', assets: [] };
  const inventory = [];
  let browser;
  try {
    for (const project of selected) {
      const direction = directions.projects.find((item) => item.projectId === project.id);
      const projectDir = path.join(output, project.id);
      await mkdir(path.join(projectDir, 'originals'), { recursive: true, mode: 0o700 });
      await mkdir(path.join(projectDir, 'optimized'), { recursive: true, mode: 0o700 });
      const selectedSources = sources.filter((asset) => asset.projectId === project.id);
      const report = { projectId: project.id, published: project.published === true, title: project.title, research: direction?.evidence ?? [], missing: [...(direction?.missing ?? ['No reviewed project-specific art direction yet.'])], captures: selectedSources.filter((asset) => asset.capture).map((asset) => asset.capture) };
      // Private structured content is kept exclusively under ignored artifacts/.
      await writeJson(path.join(projectDir, 'project-record.local.json'), project);
      await writeJson(path.join(projectDir, 'art-brief.json'), direction ?? { projectId: project.id, status: 'private-or-unreviewed', instruction: 'Prepare a project-specific brief privately before generation; no generic product UI.' });
      if (values.capture) {
        const allowedUrl = direction?.captureUrl;
        if (!allowedUrl || project.published !== true || allowedUrl !== project.liveUrl) {
          report.captures.push({ status: 'skipped', reason: 'Capture requires a published record and an exact reviewed public URL in the explicit directions input.' });
        } else {
          const url = new URL(allowedUrl);
          if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Capture allows reviewed public HTTPS URLs only');
          browser ??= await (await import('playwright')).chromium.launch({ headless: true, ...(values['browser-channel'] ? { channel: values['browser-channel'] } : {}) });
          for (const viewport of [{ width: 1440, height: 900, kind: 'desktop' }, { width: 390, height: 844, kind: 'mobile' }]) {
            const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, serviceWorkers: 'block', acceptDownloads: false });
            // No writes, analytics submissions, AI calls, sign-ins, clicks or entered data.
            await context.route('**/*', async (route) => {
              const request = route.request();
              const parsed = new URL(request.url());
              const paidOrTracking = /generativelanguage|anthropic|deepgram|openai|google-analytics|doubleclick|sentry/i.test(parsed.hostname);
              if (!['GET', 'HEAD'].includes(request.method()) || paidOrTracking || /\/(api\/)?(chat|generate|transcribe|completion)(\/|$)/i.test(parsed.pathname)) return route.abort();
              return route.continue();
            });
            try {
              const page = await context.newPage();
              const response = await page.goto(allowedUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
              await page.waitForTimeout(1800);
              const title = await page.title();
              if (!response?.ok()) throw new Error(`HTTP ${response?.status() ?? 'unknown'}`);
              if (/DEPLOYMENT_NOT_FOUND|Access Denied|Just a moment|404: This page/i.test(await page.locator('body').innerText())) throw new Error('Error or access gate; no portfolio image accepted');
              const mediaId = `${project.id}-public-${viewport.kind}`;
              const file = path.join(projectDir, 'originals', `${mediaId}.png`);
              await page.screenshot({ path: file, animations: 'disabled' });
              const capture = { status: 'captured-needs-visual-review', sourceUrl: allowedUrl, finalUrl: page.url(), title, capturedAt: new Date().toISOString(), viewport, method: 'Playwright; fresh anonymous context; navigation only; non-GET/HEAD blocked', file: relative(file) };
              report.captures.push(capture);
              const previous = selectedSources.findIndex((asset) => asset.mediaId === mediaId);
              if (previous !== -1) selectedSources.splice(previous, 1);
              selectedSources.push({ projectId: project.id, mediaId, file: relative(file), kind: viewport.kind, classification: 'authentic-web', verification: 'unverified', source: allowedUrl, attribution: 'Project public website; existing page artwork retains its original ownership.', alt: { en: `${project.title.en} public website, ${viewport.kind} viewport`, tr: `${project.title.tr} herkese açık web sitesi, ${viewport.kind === 'mobile' ? 'mobil' : 'masaüstü'} görünümü` }, caption: { en: 'Public web capture pending visual review; no authenticated or native application is implied.', tr: 'Görsel inceleme bekleyen herkese açık web görüntüsü; oturum açılmış veya yerel uygulama olduğu iddia edilmez.' }, capture });
            } catch (error) {
              report.captures.push({ status: 'unavailable', sourceUrl: allowedUrl, viewport, reason: error.message });
            } finally { await context.close(); }
          }
        }
      }
      const seen = new Set();
      for (const asset of selectedSources) {
        if (!safeId(asset.mediaId) || seen.has(asset.mediaId)) throw new Error(`Invalid or duplicate mediaId for ${project.id}`);
        seen.add(asset.mediaId);
        if (!kinds.includes(asset.kind) || !classifications.includes(asset.classification) || !verifications.includes(asset.verification)) throw new Error(`Explicit kind, classification and verification required: ${asset.mediaId}`);
        if (!bilingual(asset.alt) || !bilingual(asset.caption) || !asset.source || !asset.attribution) throw new Error(`Bilingual alt/caption, source and attribution required: ${asset.mediaId}`);
        if (asset.kind === 'video' || asset.classification === 'video') throw new Error('Video needs manual preparation; this image pipeline does not silently transcode or import video');
        const input = path.resolve(asset.file);
        const bytes = await readFile(input);
        const originalHash = digest(bytes);
        if (asset.sha256 && asset.sha256 !== originalHash) throw new Error(`Source checksum mismatch: ${asset.mediaId}`);
        const metadata = await sharp(bytes, { limitInputPixels: 40000000 }).metadata();
        if (!['jpeg', 'png', 'webp', 'avif'].includes(metadata.format) || (metadata.pages ?? 1) > 1) throw new Error(`Only still JPEG/PNG/WebP/AVIF sources are accepted: ${asset.mediaId}`);
        const ext = metadata.format === 'jpeg' ? 'jpg' : metadata.format;
        const original = path.join(projectDir, 'originals', `${asset.mediaId}-${originalHash.slice(0, 12)}.${ext}`);
        if (input !== original) {
          try { await copyFile(input, original, 1); } catch (error) { if (error.code !== 'EEXIST') throw error; if (digest(await readFile(original)) !== originalHash) throw new Error('Retained original mismatch'); }
        }
        const variants = [];
        for (const width of [1600, 800]) {
          const optimized = await sharp(bytes).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: asset.kind === 'diagram' ? 90 : 84, effort: 5 }).toBuffer({ resolveWithObject: true });
          const hash = digest(optimized.data);
          const file = path.join(projectDir, 'optimized', `${asset.mediaId}-${width}-${hash.slice(0, 12)}.webp`);
          await writeFile(file, optimized.data, { mode: 0o600 });
          variants.push({ file: relative(file), width: optimized.info.width, height: optimized.info.height, bytes: optimized.data.length, sha256: hash, contentType: 'image/webp' });
        }
        const { file: _file, sha256: _hash, width: _width, height: _height, contentType: _type, ...rest } = asset;
        void _file; void _hash; void _width; void _height; void _type;
        manifest.assets.push({ ...rest, ...variants[0], order: asset.order ?? seen.size - 1, original: { file: relative(original), sha256: originalHash, bytes: bytes.length, width: metadata.width, height: metadata.height }, variants });
      }
      report.preparedAssets = manifest.assets.filter((asset) => asset.projectId === project.id).length;
      await writeJson(path.join(projectDir, 'research-manifest.json'), report);
      inventory.push(report);
    }
  } finally { await browser?.close(); }
  await writeJson(path.join(output, 'media-manifest.json'), manifest);
  await writeJson(path.join(output, 'inventory.local.json'), inventory);
  console.log(JSON.stringify({ output: relative(output), projects: selected.length, assets: manifest.assets.length, capture: values.capture, networkWrites: false, published: false }));
} catch (error) { console.error(error.message); process.exitCode = 1; }
