import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { COPY } from '@/lib/content/copy';
import { getPortfolio } from '@/lib/content/get-portfolio';
import { OWNER, type Loc, type PortfolioProject } from '@/lib/content/portfolio';
import { stackStrata } from '@/lib/content/strata';
import { PortfolioShell } from '@/components/portfolio/PortfolioShell';
import { PlateFigure } from '@/components/portfolio/PlateFigure';
import { ExternalLinks, KindText } from '@/components/portfolio/ProjectBits';
import { ProjectGallery } from '@/components/portfolio/ProjectGallery';
import { ContourBand } from '@/components/portfolio/ContourField';
import { JsonLd } from '@/components/portfolio/JsonLd';
import { T, TBlocks } from '@/components/portfolio/T';
import s from './project.module.css';

export const revalidate = 60;
export const dynamicParams = true;

type Params = { slug: string };

/**
 * Listed projects get previous/next neighbours; archived ones still resolve by URL (noindex).
 * A former slug resolves to its project so the page can redirect permanently.
 */
async function findProject(raw: string) {
  const portfolio = await getPortfolio();
  const slug = decodeURIComponent(raw);
  const index = portfolio.projects.findIndex((p) => p.slug === slug || p.id === slug);
  const unlisted = index < 0 ? portfolio.unlisted.find((p) => p.slug === slug || p.id === slug) ?? null : null;
  const project = index >= 0 ? portfolio.projects[index] : unlisted;
  const movedTo = !project ? portfolio.redirects[slug] ?? null : project.slug !== slug ? project.slug : null;
  return { portfolio, index, project, archived: !!unlisted, movedTo };
}

export async function generateStaticParams(): Promise<Params[]> {
  const portfolio = await getPortfolio();
  return portfolio.projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const { project, archived, portfolio } = await findProject(slug);
  if (!project) return { title: 'Project not found', robots: { index: false } };
  const owner = portfolio.profile.fullName;
  const title = project.subtitle ? `${project.name.en} — ${project.subtitle.en}` : project.name.en;
  return {
    title,
    description: project.summary.en,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: {
      type: 'article',
      title: `${title} — ${owner}`,
      description: project.summary.en,
      url: `/projects/${project.slug}`,
      ...(ogImage(project) ? { images: [ogImage(project)!] } : {}),
    },
    ...(archived ? { robots: { index: false, follow: true } } : {}),
  };
}

function ogImage(project: PortfolioProject) {
  const shot = project.cover ?? project.desktop[0];
  if (shot) return { url: shot.url, alt: shot.alt.en };
  return project.image ? { url: project.image, alt: `${project.name.en} project mark` } : null;
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
  const { portfolio, index, project, archived, movedTo } = await findProject(slug);
  if (movedTo) permanentRedirect(`/projects/${encodeURIComponent(movedTo)}`);
  if (!project) notFound();

  const total = portfolio.projects.length;
  const prev = index > 0 ? portfolio.projects[index - 1] : null;
  const next = index >= 0 && index < total - 1 ? portfolio.projects[index + 1] : null;
  const owner = portfolio.profile;
  const strata = stackStrata(project.stack);
  const brief = paragraphsOf(project.description);
  const hasLinks = !!(project.links.live || project.links.demo || project.links.source || project.extraLinks.length);
  const gallery = [...project.desktop, ...project.mobile, ...project.diagrams];
  let section = 1;
  const no = () => String(section++).padStart(2, '0');

  const facts: { label: Loc; value: React.ReactNode }[] = [];
  if (project.categories.length) facts.push({ label: COPY.work.kind, value: <KindText project={project} /> });
  if (project.period) facts.push({ label: COPY.project.period, value: <T v={project.period} /> });
  else if (project.year) facts.push({ label: COPY.project.year, value: project.year });
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
          creator: { '@type': 'Person', name: owner.fullName, url: OWNER.siteUrl },
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
                  <Link href="/">{owner.shortName}</Link>
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

            <div className={`editorial-grid ${s.headGrid}`}>
              <div className={s.titleBlock}>
                <p className={`${s.fileNo} meta muted tabular`} data-enter style={{ '--i': 1 } as React.CSSProperties}>
                  {archived ? (
                    <T v={COPY.project.archived} />
                  ) : (
                    <>
                      <T v={COPY.project.file} /> {String(project.number).padStart(2, '0')} <T v={COPY.project.of} />{' '}
                      {String(total).padStart(2, '0')}
                    </>
                  )}
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
                <PlateFigure project={project} priority showProvenance sizes="(min-width: 1024px) 20vw, 50vw" />
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
                    {project.extraLinks.length > 0 && (
                      <ul className={s.links}>
                        {project.extraLinks.map((link) => (
                          <li key={link.url}>
                            <a className="tlink hit" href={link.url} target="_blank" rel="noopener">
                              <T v={link.label} />
                              <span className="arrow arrow-ne" aria-hidden="true">
                                {' '}
                                ↗
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        <section className={`surface-paper ${s.body}`} aria-labelledby="brief-title">
          <div className="wrap">
            <div className={`editorial-grid ${s.briefGrid}`}>
              <h2 id="brief-title" className={`${s.label} meta`}>
                <span className="tabular">{no()}</span> <T v={COPY.project.brief} />
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

            {project.contribution && (
              <div className={`editorial-grid ${s.briefGrid} ${s.strataBlock}`}>
                <h2 className={`${s.label} meta`}>
                  <span className="tabular">{no()}</span> <T v={COPY.project.contribution} />
                </h2>
                <div className={`prose ${s.sectionBody}`}>
                  <TBlocks
                    {...paragraphsOf(project.contribution)}
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
            )}

            {gallery.length > 0 && (
              <div className={`editorial-grid ${s.briefGrid} ${s.strataBlock}`}>
                <h2 className={`${s.label} meta`}>
                  <span className="tabular">{no()}</span> <T v={COPY.project.gallery} />
                </h2>
                <ProjectGallery media={gallery} />
              </div>
            )}

            {strata.length > 0 && (
              <div className={`editorial-grid ${s.briefGrid} ${s.strataBlock}`}>
                <h2 className={`${s.label} meta`}>
                  <span className="tabular">{no()}</span> <T v={COPY.project.strata} />
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
              <div key={i} className={`editorial-grid ${s.briefGrid} ${s.strataBlock}`}>
                <h2 className={`${s.label} meta`}>
                  <span className="tabular">{no()}</span> <T v={section.heading} />
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
