'use client';

import { COPY } from '@/lib/content/copy';
import { T } from './T';

export function PrintButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.print()}>
      <T v={COPY.recruiter.print} />
    </button>
  );
}
