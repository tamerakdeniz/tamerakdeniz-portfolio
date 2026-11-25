/** RTDB removes null/empty nodes and may return numeric-key children as arrays. */
export function storedValue(value) {
  if (!value || typeof value !== 'object') return value ?? null;
  const children = Object.entries(value).map(([key, child]) => [key, storedValue(child)]).filter(([, child]) => child !== null);
  return children.length ? Object.fromEntries(children) : null;
}
