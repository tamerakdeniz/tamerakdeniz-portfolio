import { CvLink } from '@/components/portfolio/CvLink';
import type { Metadata } from 'next';
import Link from 'next/link';
import { COPY } from '@/lib/content/copy';
import { getPortfolio } from '@/lib/content/get-portfolio';
import { OWNER, hostOf, type JourneyEntry, type PortfolioProject } from '@/lib/content/portfolio';
import { PortfolioShell } from '@/components/portfolio/PortfolioShell';
import { groupSkills } from '@/components/portfolio/Instruments';
import { PrintButton } from '@/components/portfolio/PrintButton';
import { T, TBlocks } from '@/components/portfolio/T';
import s from './resume.module.css';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolio();
  return {
  title: 'Recruiter view',
  description: `${profile.fullName} on one page: summary, selected projects, experience, education and skills.`,
  alternates: { canonical: '/resume' },
  robots: { index: false, follow: true },
};
}

function ProjectEntry({ project }: { project: PortfolioProject }) {
  const url = project.links.live || project.links.demo;
  return (
    <li className={s.project}>
      <h3 className={s.itemTitle}>
        <Link href={`/projects/${project.slug}`}>
          <T v={project.name} />
        </Link>
        {project.subtitle && (
          <span className={s.itemSub}>
            {' '}
            — <T v={project.subtitle} />
          </span>
        )}
      </h3>
      <p className={s.itemText}>
        <T v={project.summary} />
      </p>
      <p className={`${s.itemMeta} meta-plain`}>
        {project.stack.join(' · ')}
        {url && (
          <>
            {' · '}
            <a href={url}>{hostOf(url)}</a>
          </>
        )}
        {project.links.source && (
          <>
            {' · '}
            <a href={project.links.source}>
              <T v={COPY.work.source} />
            </a>
          </>
        )}
      </p>
    </li>
  );
}

function JourneyItem({ entry }: { entry: JourneyEntry }) {
  return (
    <li className={s.entry}>
      <p className={`${s.when} meta-plain tabular`}>
        <T v={entry.period} />
      </p>
      <div>
        <h3 className={s.itemTitle}>
          <T v={entry.title} />
        </h3>
        <p className={s.org}>
          <>{entry.url ? <a href={entry.url} target="_blank" rel="noreferrer"><T v={entry.org} /></a> : <T v={entry.org} />}</>
        </p>
        <p className={s.itemText}>
          <T v={entry.description} />
        </p>
      </div>
    </li>
  );
}

export default async function ResumePage() {
  const portfolio = await getPortfolio();
  const { contact, cv, about, journey, featured, archive } = portfolio;
  const work = journey.filter((j) => j.type === 'work');
  const education = journey.filter((j) => j.type !== 'work');
  const skills = groupSkills(portfolio.skills);

  return (
    <PortfolioShell portfolio={portfolio} mode="resume">
      <article className={`surface-paper ${s.page}`}>
        <div className={`wrap ${s.sheet}`}>
          <div className={s.toolbar} data-chrome>
            <p className="meta muted">
              <T v={COPY.recruiter.note} />
            </p>
            <div className={s.toolbarActions}>
              <PrintButton className="btn btn-line" />
              <CvLink className="btn btn-primary" cv={cv} download>
                <T v={COPY.recruiter.cv} />
                <span className="arrow" aria-hidden="true">
                  ↓
                </span>
              </CvLink>
            </div>
          </div>

          <header className={s.head}>
            <p className={`${s.eyebrow} meta`}>
              <T v={COPY.recruiter.eyebrow} />
            </p>
            <h1 className={s.name}>{portfolio.profile.fullName}</h1>
            <p className={s.role}>
              <T v={portfolio.profile.role} /> <span aria-hidden="true">·</span> <T v={contact.location} />
            </p>
            <ul className={s.contact} aria-label="Contact">
              <li>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
              {contact.social.linkedin && (
                <li>
                  <a href={contact.social.linkedin}>{hostOf(contact.social.linkedin)}{new URL(contact.social.linkedin).pathname.replace(/\/$/, '')}</a>
                </li>
              )}
              {contact.social.github && (
                <li>
                  <a href={contact.social.github}>{hostOf(contact.social.github)}{new URL(contact.social.github).pathname.replace(/\/$/, '')}</a>
                </li>
              )}
              <li>
                <a href={OWNER.siteUrl}>{hostOf(OWNER.siteUrl)}</a>
              </li>
            </ul>
          </header>

          {about.paragraphs.en.length > 0 && (
            <section className={s.block} aria-labelledby="r-summary">
              <h2 id="r-summary" className={`${s.blockTitle} meta`}>
                <T v={COPY.recruiter.summary} />
              </h2>
              <div className={s.blockBody}>
                <TBlocks
                  en={about.paragraphs.en}
                  tr={about.paragraphs.tr}
                  render={(ps) => <p className={s.summary}>{ps[0]}</p>}
                />
              </div>
            </section>
          )}

          {work.length > 0 && (
            <section className={s.block} aria-labelledby="r-experience">
              <h2 id="r-experience" className={`${s.blockTitle} meta`}>
                <T v={COPY.recruiter.experience} />
              </h2>
              <ol className={`${s.blockBody} ${s.list}`}>
                {work.map((e) => (
                  <JourneyItem key={e.id} entry={e} />
                ))}
              </ol>
            </section>
          )}

          {featured.length > 0 && (
            <section className={s.block} aria-labelledby="r-selected">
              <h2 id="r-selected" className={`${s.blockTitle} meta`}>
                <T v={COPY.recruiter.selected} />
              </h2>
              <ol className={`${s.blockBody} ${s.list}`}>
                {featured.map((p) => (
                  <ProjectEntry key={p.id} project={p} />
                ))}
              </ol>
            </section>
          )}

          {skills.length > 0 && (
            <section className={s.block} aria-labelledby="r-skills">
              <h2 id="r-skills" className={`${s.blockTitle} meta`}>
                <T v={COPY.recruiter.skills} />
              </h2>
              <dl className={`${s.blockBody} ${s.skills}`}>
                {skills.map((g) => (
                  <div key={g.id}>
                    <dt className="meta">
                      <T v={g.name} />
                    </dt>
                    <dd>{g.items.join(', ')}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {education.length > 0 && (
            <section className={s.block} aria-labelledby="r-education">
              <h2 id="r-education" className={`${s.blockTitle} meta`}>
                <T v={COPY.recruiter.education} />
              </h2>
              <ol className={`${s.blockBody} ${s.list}`}>
                {education.map((e) => (
                  <JourneyItem key={e.id} entry={e} />
                ))}
              </ol>
            </section>
          )}

          {archive.length > 0 && (
            <section className={s.block} aria-labelledby="r-other">
              <h2 id="r-other" className={`${s.blockTitle} meta`}>
                <T v={COPY.recruiter.other} />
              </h2>
              <ul className={`${s.blockBody} ${s.others}`}>
                {archive.map((p) => (
                  <li key={p.id}>
                    <Link href={`/projects/${p.slug}`}>
                      <T v={p.name} />
                    </Link>
                    <span className={s.otherSum}>
                      {' '}
                      — <T v={p.summary} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className={s.back} data-chrome>
            <Link className="tlink hit" href="/">
              <span aria-hidden="true">← </span>
              <T v={COPY.recruiter.back} />
            </Link>
          </p>
        </div>
      </article>
    </PortfolioShell>
  );
}
