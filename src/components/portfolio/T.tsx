import type { Loc } from '@/lib/content/portfolio';

/**
 * Renders both languages; CSS keyed on `html[lang]` hides the inactive one.
 * Works in server components and before hydration, so switching language never re-renders.
 */
export function T({ v }: { v: Loc | null | undefined }) {
  if (!v) return null;
  if (!v.tr || v.en === v.tr) return <>{v.en}</>;
  return (
    <>
      <span data-l="en">{v.en}</span>
      <span data-l="tr" lang="tr">
        {v.tr}
      </span>
    </>
  );
}

/** Block variant for paragraph lists whose structure differs per language. */
export function TBlocks({
  en,
  tr,
  render,
}: {
  en: string[];
  tr: string[];
  render: (paragraphs: string[]) => React.ReactNode;
}) {
  const same = en.length === tr.length && en.every((p, i) => p === tr[i]);
  if (same || tr.length === 0) return <>{render(en)}</>;
  return (
    <>
      <div data-l="en">{render(en)}</div>
      <div data-l="tr" lang="tr">
        {render(tr)}
      </div>
    </>
  );
}
