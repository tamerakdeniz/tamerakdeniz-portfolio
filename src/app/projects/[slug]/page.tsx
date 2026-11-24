import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { COPY } from '@/lib/content/copy';
import { getPortfolio } from '@/lib/content/get-portfolio';
import { OWNER, type Loc, type PortfolioProject } from '@/lib/content/portfolio';
import { stackStrata } from '@/lib/content/strata';
import { PortfolioShell } from '@/components/portfolio/PortfolioShell';
import { PlateFigure } from '@/components/portfolio/PlateFigure';
import { ExternalLinks, KindText } from '@/components/portfolio/ProjectBits';
import { ContourBand } from '@/components/portfolio/ContourField';
import { JsonLd } from '@/components/portfolio/JsonLd';
import { T, TBlocks } from '@/components/portfolio/T';
import s from './project.module.css';

export const revalidate = 60;
export const dynamicParams = true;

type Params = { slug: string };

async function findProject(slug: string) {
  const portfolio = await getPortfolio();
  const index = portfolio.projects.findIndex((p) => p.slug === slug || p.id === slug);
  return { portfolio, index, project: index >= 0 ? portfolio.projects[index] : null };
}

export async function generateStaticParams(): Promise<Params[]> {
  const portfolio = await getPortfolio();
  return portfolio.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const { project } = await findProject(slug);
  if (!project) return { title: 'Project not found', robots: { index: false } };
  const title = project.subtitle ? `${project.name.en} — ${project.subtitle.en}` : project.name.en;
  return {
    title,
    description: project.summary.en,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: 'article',
      title: `${title} — ${OWNER.fullName}`,
      description: project.summary.en,
      url: `/projects/${project.slug}`,
      ...(project.image ? { images: [{ url: project.image, alt: `${project.name.en} project mark` }] } : {}),
    },
  };
}

function paragraphsOf(value: Loc) {
  const split = (t: string) =>
    t
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);
  return { en: split(value.en), tr: split(value.tr) };
}

/** A single long paragraph gets its first sentence as the lead. */
function withLead(ps: string[]): string[] {
  if (ps.length !== 1) return ps;
  const match = ps[0].match(/^([\s\S]+?[.!?])\s+([\s\S]+)$/);
  return match ? [match[1], match[2]] : ps;
}

function Neighbour({ project, dir }: { project: PortfolioProject; dir: 'prev' | 'next' }) {
  return (
    <Link href={`/projects/${project.slug}`} className={`${s.neighbour} ${dir === 'next' ? s.next : ''}`} rel={dir}>
      <span className="meta muted">
        {dir === 'prev' && <span aria-hidden="true">← </span>}
        <T v={dir === 'prev' ? COPY.project.prev : COPY.project.next} />
        {dir === 'next' && <span aria-hidden="true"> →</span>}
      </span>
      <span className={s.neighbourName}>
        <span className="tabular muted">{String(project.number).padStart(2, '0')} </span>
        <T v={project.name} />
      </span>
    </Link>
  );
}

export default async function ProjectPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const { portfolio, index, project } = await findProject(slug);
  if (!project) notFound();

  const total = portfolio.projects.length;
  const prev = index > 0 ? portfolio.projects[index - 1] : null;
  const next = index < total - 1 ? portfolio.projects[index + 1] : null;
  const strata = stackStrata(project.stack);
  const brief = paragraphsOf(project.description);
  const hasLinks = !!(project.links.live || project.links.demo || project.links.source);

  const facts: { label: Loc; value: React.ReactNode }[] = [];
  if (project.categories.length) facts.push({ label: COPY.work.kind, value: <KindText project={project} /> });
  if (project.year) facts.push({ label: COPY.project.year, value: project.year });
  if (project.role) facts.push({ label: COPY.project.role, value: <T v={project.role} /> });
  if (project.status) facts.push({ label: COPY.project.status, value: project.status });

  return (
    <PortfolioShell portfolio={portfolio}>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CreativeWork',
          name: project.title.en,
          description: project.description.en,
          url: `${OWNER.siteUrl}/projects/${project.slug}`,
          creator: { '@type': 'Person', name: OWNER.fullName, url: OWNER.siteUrl },
          keywords: project.stack.join(', '),
          ...(project.image ? { image: project.image } : {}),
          ...(project.links.source ? { codeRepository: project.links.source } : {}),
        }}
      />
      <article>
        <header className={`surface-dark ${s.head}`}>
          <ContourBand
            seed={project.number * 97 + 13}
            count={8}
            height={180}
            amplitude={22}
            tone="tidal"
            opacity={0.28}
            className={s.band}
            draw={false}
          />
          <div className="wrap">
            <nav className={`${s.crumbs} meta`} aria-label="Breadcrumb" data-enter>
              <ol>
                <li>
                  <Link href="/">Tamer Akdeniz</Link>
                </li>
                <li>
                  <Link href="/projects">
                    <T v={COPY.project.archive} />
                  </Link>
                </li>
                <li aria-current="page">
                  <T v={project.name} />
                </li>
              </ol>
            </nav>

            <div className={`grid ${s.headGrid}`}>
              <div className={s.titleBlock}>
                <p className={`${s.fileNo} meta muted tabular`} data-enter style={{ '--i': 1 } as React.CSSProperties}>
                  <T v={COPY.project.file} /> {String(project.number).padStart(2, '0')} <T v={COPY.project.of} />{' '}
                  {String(total).padStart(2, '0')}
                </p>
                <h1 className={`display ${s.h1}`} data-enter style={{ '--i': 2 } as React.CSSProperties}>
                  <T v={project.name} />
                </h1>
                {project.subtitle && (
                  <p className={`serif ${s.subtitle}`} data-enter style={{ '--i': 3 } as React.CSSProperties}>
                    <T v={project.subtitle} />
                  </p>
                )}
              </div>
              <div className={s.plateCol} data-enter style={{ '--i': 3 } as React.CSSProperties}>
                <PlateFigure project={project} priority sizes="(min-width: 1024px) 20vw, 50vw" />
              </div>
            </div>

            {(facts.length > 0 || hasLinks) && (
              <div className={s.factsRow}>
                {facts.length > 0 && (
                  <dl className={s.facts}>
                    {facts.map((f, i) => (
                      <div key={i}>
                        <dt className="meta muted">
                          <T v={f.label} />
                        </dt>
                        <dd>{f.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {hasLinks && (
                  <div className={s.linksBox}>
                    <p className="meta muted">
                      <T v={COPY.project.links} />
                    </p>
                    <ExternalLinks project={project} className={s.links} />
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <section className={`surface-paper ${s.body}`} aria-labelledby="brief-title">
          <div className="wrap">
            <div className={`grid ${s.briefGrid}`}>
              <h2 id="brief-title" className={`${s.label} meta`}>
                <span className="tabular">01</span> <T v={COPY.project.brief} />
              </h2>
              <div className={s.brief}>
                <TBlocks
                  en={brief.en}
                  tr={brief.tr}
                  render={(ps) => (
                    <>
                      {withLead(ps).map((p, i) => (
                        <p key={i} className={i === 0 ? s.briefLead : undefined}>
                          {p}
                        </p>
                      ))}
                    </>
                  )}
                />
              </div>
            </div>

            {strata.length > 0 && (
              <div className={`grid ${s.briefGrid} ${s.strataBlock}`}>
                <h2 className={`${s.label} meta`}>
                  <span className="tabular">02</span> <T v={COPY.project.strata} />
                </h2>
                <figure className={s.strataFig}>
                  <ol className={s.strata}>
                    {strata.map((layer, i) => (
                      <li key={layer.id} className={s.stratum} style={{ '--n': i } as React.CSSProperties}>
                        <span className={`${s.layerName} meta`}>
                          <T v={layer.name} />
                        </span>
                        <ul className={s.techs}>
                          {layer.items.map((t) => (
                            <li key={t}>{t}</li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ol>
                  <figcaption className={`${s.note} meta-plain`}>
                    <T v={COPY.project.strataNote} />
                  </figcaption>
                </figure>
              </div>
            )}

            {project.sections.map((section, i) => (
              <div key={i} className={`grid ${s.briefGrid} ${s.strataBlock}`}>
                <h2 className={`${s.label} meta`}>
                  <span className="tabular">{String(i + 3).padStart(2, '0')}</span> <T v={section.heading} />
                </h2>
                <div className={`prose ${s.sectionBody}`}>
                  <TBlocks
                    {...paragraphsOf(section.body)}
                    render={(ps) => (
                      <>
                        {ps.map((p, j) => (
                          <p key={j}>{p}</p>
                        ))}
                      </>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <nav className={`surface-paper ${s.pager}`} aria-label="Project navigation">
          <div className={`wrap ${s.pagerGrid}`}>
            {prev ? <Neighbour project={prev} dir="prev" /> : <span />}
            <Link href="/projects" className={`tlink hit ${s.back}`}>
              <T v={COPY.project.back} />
            </Link>
            {next ? <Neighbour project={next} dir="next" /> : <span />}
          </div>
        </nav>
      </article>
    </PortfolioShell>
  );
}
