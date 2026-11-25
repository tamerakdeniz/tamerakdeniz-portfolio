import { contentHash } from './confirmed-content-plan.mjs';
import { storedValue } from './database-value.mjs';
export const digest = (value) => contentHash(storedValue(value));
const entries = (value) => Object.entries(value || {}).filter(([, v]) => v != null);

/** Preserve every unrelated path; move only records hidden by the public adapter. */
export function planLegacyDrafts(root) {
  if (!root?.siteData || typeof root.siteData !== 'object') throw new Error('Missing siteData backup');
  const next = structuredClone(root);
  const summary = [];
  for (const collection of ['projects', 'skills', 'timeline']) {
    const source = root.siteData[collection];
    const destination = entries(root.siteDrafts?.[collection]).map(([, value]) => value);
    const ids = new Set();
    for (const item of destination) {
      if (!item.id || ids.has(item.id)) throw new Error(`Missing/duplicate private ID in ${collection}; resolve before migrating`);
      ids.add(item.id);
    }
    const kept = [];
    let moved = 0;
    for (const [key, item] of entries(source)) {
      const hidden = collection === 'projects' ? item.published !== true : item.published === false;
      if (!hidden) { kept.push([key, item]); continue; }
      const id = item.id || `legacy-${collection}-${digest({ key, item }).slice(0, 20)}`;
      const candidate = { ...item, id, published: false };
      const existing = destination.find((d) => d.id === id);
      if (existing && digest(existing) !== digest(candidate)) throw new Error(`Conflicting private/public ID in ${collection}: ${id}`);
      if (!existing) { destination.push(candidate); ids.add(id); }
      moved++;
    }
    if (moved) {
      // Retain object keys/array indexes so the still-live reader keeps its legacy shape.
      next.siteData[collection] = Object.fromEntries(kept);
      next.siteDrafts ??= {};
      next.siteDrafts[collection] = destination;
    }
    summary.push({ collection, moved, publicRemaining: kept.length });
  }
  return { next, summary, changed: summary.some((s) => s.moved > 0) };
}
