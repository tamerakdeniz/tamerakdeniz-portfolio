import { COPY, SKILL_CATEGORIES } from '@/lib/content/copy';
import type { Loc, PortfolioSkill } from '@/lib/content/portfolio';
import { T } from './T';
import s from './Instruments.module.css';

export function groupSkills(skills: PortfolioSkill[]): { id: string; name: Loc; items: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const skill of skills) {
    const id = skill.categories.find((c) => c in SKILL_CATEGORIES) ?? 'other';
    groups.set(id, [...(groups.get(id) ?? []), skill.name]);
  }
  return Object.keys(SKILL_CATEGORIES)
    .filter((id) => groups.has(id))
    .map((id) => ({ id, name: SKILL_CATEGORIES[id], items: groups.get(id)! }));
}

export function Instruments({ skills }: { skills: PortfolioSkill[] }) {
  const groups = groupSkills(skills);
  if (groups.length === 0) return null;

  return (
    <section className={`chapter surface-paper ${s.instruments}`} aria-labelledby="instruments-title">
      <div className="wrap">
        <div className={`grid ${s.head}`}>
          <h2 id="instruments-title" className={`h2 ${s.h}`}>
            <T v={COPY.about.skills} />
          </h2>
          <p className={`${s.intro} muted`}>
            <T v={COPY.about.skillsIntro} />
          </p>
        </div>
        <div className={s.groups}>
          {groups.map((g, i) => (
            <section key={g.id} className={s.group} aria-labelledby={`skills-${g.id}`}>
              <h3 id={`skills-${g.id}`} className={`${s.groupName} meta`}>
                <span className="tabular">{String(i + 1).padStart(2, '0')}</span>
                <T v={g.name} />
                <span className={`${s.count} tabular`}>{g.items.length}</span>
              </h3>
              <ul className={s.items}>
                {g.items.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
