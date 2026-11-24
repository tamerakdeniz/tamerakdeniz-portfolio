import { CHAPTERS, type ChapterId } from '@/lib/content/copy';
import { T } from './T';

export function ChapterLabel({ id, className }: { id: ChapterId; className?: string }) {
  const chapter = CHAPTERS.find((c) => c.id === id)!;
  return (
    <p className={`chapter-label meta ${className ?? ''}`}>
      <span className="tabular">{chapter.index}</span>
      <strong>
        <T v={chapter.name} />
      </strong>
      <span className="tabular" aria-hidden="true">
        {String(chapter.depth).padStart(2, '0')} m
      </span>
    </p>
  );
}
