import Link from 'next/link';
import { PROJECT_CATEGORIES } from '@/lib/content/copy';
import type { PortfolioProject } from '@/lib/content/portfolio';
import { ArchiveFilter, type FilterOption } from './ArchiveFilter';
import { AccessText } from './LabIndex';
import { KindText, StackText } from './ProjectBits';
import { ProjectPlate } from './ProjectPlate';
import { T } from './T';
import s from './Archive.module.css';

const LIST_ID = 'archive-list';

export function ArchiveGrid({ projects }: { projects: PortfolioProject[] }) {
  const counts = new Map<string, number>();
  projects.forEach((p) => p.categories.forEach((c) => counts.set(c, (counts.get(c) ?? 0) + 1)));
  const known = Object.keys(PROJECT_CATEGORIES);
  const options: FilterOption[] = [...counts.entries()]
    .sort((a, b) => {
      const ia = known.indexOf(a[0]);
      const ib = known.indexOf(b[0]);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    })
    .map(([id, count]) => ({ id, count, label: PROJECT_CATEGORIES[id] ?? { en: id, tr: id } }));

  const rules = options
    .map((o) => {
      const v = JSON.stringify(o.id);
      return `#${LIST_ID}[data-filter=${v}] > li:not([data-cat~=${v}]){display:none}`;
    })
    .join('');

  return (
    <>
      <style>{rules}</style>
      {options.length > 1 && <ArchiveFilter targetId={LIST_ID} options={options} total={projects.length} />}
      <ol id={LIST_ID} className={s.grid} data-filter="all">
        {projects.map((p) => (
          <li key={p.id} className={s.card} data-cat={p.categories.join(' ')}>
            <div className={s.plate}>
              <ProjectPlate project={p} shape="square" tone="deep" figure="A" />
            </div>
            <div className={s.cardBody}>
              <p className={`${s.cardMeta} meta tabular`}>
                <span>{String(p.number).padStart(2, '0')}</span>
                <span className={s.kind}>
                  <KindText project={p} limit={2} />
                </span>
              </p>
              <h2 className={s.cardTitle}>
                <Link href={`/projects/${p.slug}`} className={s.cardLink}>
                  <T v={p.name} />
                </Link>
              </h2>
              {p.subtitle && (
                <p className={s.cardSub}>
                  <T v={p.subtitle} />
                </p>
              )}
              <p className={`${s.cardStack} meta-plain`}>
                <StackText project={p} limit={4} />
              </p>
              <p className={`${s.cardAccess} meta`}>
                <span>
                  <AccessText project={p} />
                </span>
                <span className={s.go} aria-hidden="true">
                  →
                </span>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
