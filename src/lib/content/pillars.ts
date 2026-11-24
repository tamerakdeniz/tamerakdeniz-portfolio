import type { Loc, Portfolio, PortfolioProject } from './portfolio';

interface PillarDef {
  id: string;
  title: Loc;
  body: Loc;
  /** Candidate technologies, in display priority. Shown only if found in the content. */
  tech: string[];
  /** Weighting for picking related projects. */
  signals: string[];
  categories?: string[];
  journeyLink?: boolean;
}

const DEFS: PillarDef[] = [
  {
    id: 'systems',
    title: { en: 'Systems & backend', tr: 'Sistemler ve backend' },
    body: {
      en: 'The part of a product nobody sees until it breaks. I build services in Python with FastAPI and in Java with Spring Boot, model data in relational databases, and package things with Docker so they behave the same everywhere. Most recently I worked on a Telco CRM microservices MVP in Turkcell’s GYG 5.0 programme.',
      tr: 'Bir ürünün, bozulana kadar kimsenin görmediği kısmı. Python ile FastAPI ve Java ile Spring Boot üzerinde servisler geliştiriyor, veriyi ilişkisel veritabanlarında modelliyor ve her yerde aynı davransın diye Docker ile paketliyorum. En son, Turkcell GYG 5.0 programında bir Telco CRM mikroservis MVP’si üzerinde çalıştım.',
    },
    tech: ['Python', 'FastAPI', 'Java', 'Spring Boot', 'PostgreSQL', 'Docker', 'Kafka', 'Kubernetes'],
    signals: ['FastAPI', 'Python', 'Docker', 'PostgreSQL', 'Supabase', 'Java'],
    journeyLink: true,
  },
  {
    id: 'product',
    title: { en: 'Product & interface', tr: 'Ürün ve arayüz' },
    body: {
      en: 'Interfaces people can actually use, built with TypeScript, React and Next.js. I care about the whole path — from the first screen to a deployed product, including the admin side someone has to maintain afterwards.',
      tr: 'TypeScript, React ve Next.js ile gerçekten kullanılabilen arayüzler. İlk ekrandan yayındaki ürüne kadar tüm yol benim için önemli — sonrasında birinin bakımını yapacağı yönetim tarafı da dahil.',
    },
    tech: ['TypeScript', 'React', 'Next.js', 'TailwindCSS', 'Kotlin'],
    signals: ['TypeScript', 'React', 'Next.js', 'TailwindCSS'],
  },
  {
    id: 'ai',
    title: { en: 'AI & automation', tr: 'Yapay zekâ ve otomasyon' },
    body: {
      en: 'LLMs as one component of a normal application, not the whole product: generating quiz questions, holding a mentoring conversation, estimating a vehicle price. Often with Google’s Gemini models, wired into Python and TypeScript code.',
      tr: 'LLM’ler ürünün tamamı değil, sıradan bir uygulamanın bir bileşeni: quiz soruları üretmek, mentorluk sohbeti yürütmek, bir aracın fiyatını tahmin etmek. Çoğu zaman Google’ın Gemini modelleriyle, Python ve TypeScript koduna bağlanarak.',
    },
    tech: ['LLM', 'Gemini', 'Generative AI', 'Google Cloud'],
    signals: ['LLM', 'Gemini', 'Google Cloud'],
    categories: ['ai'],
  },
];

export interface Pillar {
  id: string;
  title: Loc;
  body: Loc;
  tech: string[];
  related: PortfolioProject[];
  journeyLink: boolean;
}

function mentions(haystack: string, needle: string) {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i').test(haystack);
}

export function buildPillars(portfolio: Portfolio): Pillar[] {
  const corpus = [
    ...portfolio.skills.map((s) => s.name),
    ...portfolio.projects.flatMap((p) => p.stack),
    ...portfolio.projects.map((p) => p.description.en),
    ...portfolio.journey.map((j) => j.description.en),
  ].join(' · ');

  return DEFS.map((def) => {
    const tech = def.tech.filter((t) => mentions(corpus, t)).slice(0, 4);
    const related = portfolio.projects
      .map((p) => {
        const stack = p.stack.join(' · ');
        let score = def.signals.reduce((n, sig) => n + (mentions(stack, sig) ? 1 : 0), 0);
        if (def.categories?.some((c) => p.categories.includes(c))) score += 1;
        return { p, score };
      })
      .filter((x) => x.score >= 2)
      .sort((a, b) => b.score - a.score || a.p.number - b.p.number)
      .slice(0, 3)
      .map((x) => x.p);
    const hasTelco = portfolio.journey.some((j) => /telco crm/i.test(j.description.en));
    return {
      id: def.id,
      title: def.title,
      body: def.body,
      tech,
      related,
      journeyLink: !!def.journeyLink && hasTelco,
    };
  });
}
