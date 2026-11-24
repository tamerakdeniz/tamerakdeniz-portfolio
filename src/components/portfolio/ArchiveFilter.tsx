'use client';

import { useEffect, useState } from 'react';
import { COPY } from '@/lib/content/copy';
import type { Loc } from '@/lib/content/portfolio';
import { pick } from '@/lib/content/portfolio';
import { useLang } from '@/lib/lang';
import s from './Archive.module.css';

export interface FilterOption {
  id: string;
  label: Loc;
  count: number;
}

/** Sets `data-filter` on the target list; server-generated CSS hides non-matching items. */
export function ArchiveFilter({ targetId, options, total }: { targetId: string; options: FilterOption[]; total: number }) {
  const lang = useLang();
  const [active, setActive] = useState('all');

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (target) target.dataset.filter = active;
  }, [active, targetId]);

  const count = active === 'all' ? total : (options.find((o) => o.id === active)?.count ?? 0);
  const all: FilterOption = { id: 'all', label: COPY.archive.all, count: total };

  return (
    <div className={s.filter}>
      <div role="group" aria-label={pick(COPY.archive.filter, lang)} className={s.chips}>
        {[all, ...options].map((o) => (
          <button
            key={o.id}
            type="button"
            className={s.chip}
            aria-pressed={active === o.id}
            onClick={() => setActive(o.id)}
          >
            {pick(o.label, lang)}
            <span className={`${s.chipCount} tabular`}>{o.count}</span>
          </button>
        ))}
      </div>
      <p className={`${s.showing} meta`} aria-live="polite">
        {pick(COPY.archive.showing, lang)} <span className="tabular">{count}</span> / {total}{' '}
        {pick(COPY.archive.projects, lang)}
      </p>
    </div>
  );
}
