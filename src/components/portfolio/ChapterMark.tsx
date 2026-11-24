import { CHAPTERS, type ChapterId } from '@/lib/content/copy';
import { T } from './T';

/** The small instrument label every chapter shares: number, name and metaphorical depth. */
export function ChapterMark({ id, className }: { id: ChapterId; className?: string }) {
  const c = CHAPTERS.find((ch) => ch.id === id)!;
  return (
    <p className={`chapter-mark meta ${className ?? ''}`}>
      <span className="tabular chapter-mark-no">{c.index}</span>
      <span className="chapter-mark-name">
        <T v={c.name} />
      </span>
      <span className="chapter-mark-rule" aria-hidden="true" />
      <span className="tabular chapter-mark-depth">{String(c.depth).padStart(2, '0')} m</span>
    </p>
  );
}
