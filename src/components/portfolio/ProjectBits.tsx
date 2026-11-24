import { COPY, PROJECT_CATEGORIES } from '@/lib/content/copy';
import type { PortfolioProject } from '@/lib/content/portfolio';
import { T } from './T';

export function KindText({ project, limit }: { project: PortfolioProject; limit?: number }) {
  const cats = limit ? project.categories.slice(0, limit) : project.categories;
  return (
    <>
      {cats.map((c, i) => (
        <span key={c}>
          {i > 0 && ', '}
          <T v={PROJECT_CATEGORIES[c] ?? { en: c, tr: c }} />
        </span>
      ))}
    </>
  );
}

export function StackText({ project, limit }: { project: PortfolioProject; limit?: number }) {
  const list = limit ? project.stack.slice(0, limit) : project.stack;
  const rest = limit ? project.stack.length - list.length : 0;
  return (
    <>
      {list.join(' / ')}
      {rest > 0 && ` +${rest}`}
    </>
  );
}

export function ExternalLinks({
  project,
  className,
  linkClassName = 'tlink hit',
}: {
  project: PortfolioProject;
  className?: string;
  linkClassName?: string;
}) {
  const { live, demo, source } = project.links;
  if (!live && !demo && !source) return null;
  const name = project.name.en;
  return (
    <ul className={className}>
      {live && (
        <li>
          <a className={linkClassName} href={live} target="_blank" rel="noopener">
            <T v={COPY.work.live} />
            <span className="sr-only">: {name}</span>
            <span className="arrow arrow-ne" aria-hidden="true">
              {' '}
              ↗
            </span>
          </a>
        </li>
      )}
      {demo && demo !== live && (
        <li>
          <a className={linkClassName} href={demo} target="_blank" rel="noopener">
            <T v={COPY.work.demo} />
            <span className="sr-only">: {name}</span>
            <span className="arrow arrow-ne" aria-hidden="true">
              {' '}
              ↗
            </span>
          </a>
        </li>
      )}
      {source && (
        <li>
          <a className={linkClassName} href={source} target="_blank" rel="noopener">
            <T v={COPY.work.source} />
            <span className="sr-only">: {name}</span>
            <span className="arrow arrow-ne" aria-hidden="true">
              {' '}
              ↗
            </span>
          </a>
        </li>
      )}
    </ul>
  );
}
