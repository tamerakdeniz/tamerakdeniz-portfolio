import { storedValue } from './database-value.mjs';
import { createHash } from 'node:crypto';
const canonical = (v) => Array.isArray(v) ? v.map(canonical) : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canonical(v[k])])) : v;
export const contentHash = (v) => createHash('sha256').update(JSON.stringify(canonical(v ?? null))).digest('hex');
const same = (a, b) => contentHash(storedValue(a)) === contentHash(storedValue(b));
const list = (v) => Object.values(v || {}).filter(Boolean);
const at = (v, path) => path.split('.').reduce((value, key) => value?.[key], v);
const cvIdentity = (data) => ({ cv: data.cv ?? null, activeCvId: data.activeCvId, cvFiles: list(data.cvFiles).map((file) => Object.fromEntries(Object.entries(file).filter(([key]) => key !== 'language'))) });
const photos = (data) => ({ avatars: list(data.aboutEntries).map((e) => ({ id: e.id, avatar: e.avatar })), hero: data.homeHero?.icon, field: data.profile?.fieldPhoto ?? null });

export function planConfirmedContent(root, proposal, sources, activateFeatured = false) {
  if (proposal.format !== 'confirmed-content-patch-v1' || !root?.siteData) throw new Error('Unsupported proposal or missing content');
  const next = structuredClone(root);
  next.siteDrafts ??= {};
  const changes = [];
  for (const operation of proposal.operations) {
    const collection = operation.collection;
    if (!['aboutEntries','projects','timeline'].includes(collection)) throw new Error('Unsupported collection');
    const locations = ['siteData','siteDrafts'].flatMap((node) => Object.entries(next[node]?.[collection] || {}).filter(([, record]) => record != null).map(([key, record]) => ({ node, key, record })));
    if (operation.op === 'upsert-draft-record') {
      const candidate = list(sources[operation.sourceFile]?.[collection]).find((r) => r.id === operation.sourceId);
      if (!candidate || candidate.published !== false) throw new Error('Missing private candidate');
      const matches = locations.filter((l) => l.record.id === candidate.id);
      if (matches.length > 1) throw new Error('Duplicate candidate ID');
      if (matches.length) {
        const record = matches[0].record;
        if (!same({ ...record, published: false }, candidate)) throw new Error('Candidate changed; review before replacing');
      } else {
        next.siteDrafts[collection] = [...list(next.siteDrafts[collection]), candidate];
        changes.push(`siteDrafts/${collection}/${candidate.id}`);
      }
      continue;
    }
    if (operation.op !== 'merge-record') throw new Error('Unsupported operation');
    let matches = locations.filter((l) => l.record.id === operation.match.id);
    if (!matches.length && operation.match.legacyUniqueMatch) matches = locations.filter((l) => Object.entries(operation.match.legacyUniqueMatch).every(([path, value]) => same(at(l.record, path), value)));
    if (matches.length !== 1) throw new Error(`Missing/ambiguous target ${collection}/${operation.match.id}`);
    const { node, key, record } = matches[0];
    const removed = operation.removeFields || [];
    if (Object.entries(operation.set).every(([k, v]) => same(record[k], v)) && removed.every((k) => !(k in record))) continue;
    if (operation.expectedRecordSha256 && contentHash(record) !== operation.expectedRecordSha256) throw new Error(`Stale record: ${operation.match.id}`);
    if (operation.expectedFields && !Object.entries(operation.expectedFields).every(([k,v]) => same(record[k], v))) throw new Error(`Stale fields: ${operation.match.id}`);
    const updated = { ...record, ...operation.set };
    for (const field of removed) delete updated[field];
    next[node][collection][key] = updated;
    changes.push(`${node}/${collection}/${operation.match.id}`);
  }
  // This migration marks the active document English; review that assumption before applying. URLs/bytes stay untouched.
  for (const file of list(next.siteData.cvFiles)) if (file.id === next.siteData.activeCvId && file.language !== 'en') { file.language = 'en'; changes.push(`siteData/cvFiles/${file.id}/language`); }
  if (activateFeatured) {
    const selected = proposal.featuredPlan.orderedProjectIds;
    const projects = list(next.siteData.projects);
    if (!selected.every((id) => projects.some((p) => p.id === id && p.published === true && !p.archived))) throw new Error('Review and publish all selected candidates before activating featured plan');
    for (const project of projects) { project.featured = selected.includes(project.id); if (project.featured) project.featuredOrder = selected.indexOf(project.id); else delete project.featuredOrder; }
    next.siteData.display = { ...next.siteData.display, ...proposal.featuredPlan.displayMerge };
  }
  if (!same(cvIdentity(root.siteData), cvIdentity(next.siteData)) || !same(photos(root.siteData), photos(next.siteData))) throw new Error('CV or photo preservation check failed');
  return { next, changes, changed: !same(root, next) };
}
