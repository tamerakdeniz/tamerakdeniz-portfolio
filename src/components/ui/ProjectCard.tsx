'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store';
import { CachedImage } from '@/components/ui/CachedImage';
import type { Project, Language } from '@/types';

const categoryDisplayName: Record<string, Record<Language, string>> = {
  web: { en: 'Web', tr: 'Web' },
  ai: { en: 'AI', tr: 'AI' },
  startup: { en: 'Startup', tr: 'Girişim' },
  opensource: { en: 'Open Source', tr: 'Açık Kaynak' },
  desktop: { en: 'Desktop App', tr: 'Masaüstü' },
  mobile: { en: 'Mobile App', tr: 'Mobil' },
  extension: { en: 'Chrome Extension', tr: 'Chrome Eklentisi' },
  practice: { en: 'Practice', tr: 'Alıştırma' },
  test: { en: 'Test', tr: 'Test' },
};

export function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  const { t } = useTranslation();
  const lang = useAppStore((s) => s.language);

  const title = project.title[lang] || project.title.en;
  const description = project.description[lang] || project.description.en;
  const categories = Array.isArray(project.category)
    ? project.category
    : [project.category || 'web'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group relative grid h-full overflow-hidden rounded-lg border border-slate-900/10 bg-white/75 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-all hover:border-teal-500/35 hover:bg-white dark:border-white/10 dark:bg-white/[0.045] dark:hover:border-teal-300/25"
      style={{ display: 'grid', gridTemplateRows: 'auto 1fr' }}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-black/35">
        {project.image ? (
          <CachedImage
            src={project.image}
            alt={title}
            loading={index < 6 ? 'eager' : 'lazy'}
            fetchPriority={index < 3 ? 'high' : undefined}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-teal-500/50">code_blocks</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent opacity-80" />
        <div className="absolute bottom-3 left-4 rounded-md border border-white/15 bg-black/35 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur">
          Build {String(index + 1).padStart(2, '0')}
        </div>
      </div>
      <div className="relative flex flex-col p-5 pl-6">
        <div className="absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-teal-500 via-coral-400 to-amber-300 opacity-80" />
        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <span
              key={cat}
              className="inline-block rounded-md border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-teal-700 dark:text-teal-300"
            >
              {categoryDisplayName[cat]?.[lang] || cat.toUpperCase()}
            </span>
          ))}
        </div>
        <h3 className="text-xl font-black tracking-normal text-slate-950 transition-colors group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(project.techStack || []).map((tech) => (
            <span
              key={tech}
              className="rounded-md bg-slate-900/[0.055] px-2 py-1 text-[11px] font-medium text-slate-600 dark:bg-white/[0.06] dark:text-slate-300"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="mt-auto flex flex-col gap-2 pt-5 sm:flex-row">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-900/10 bg-slate-900/[0.04] px-4 py-2 text-sm font-bold text-slate-700 transition-all hover:border-teal-500/30 hover:bg-teal-500/10 active:scale-95 dark:border-white/10 dark:bg-white/[0.045] dark:text-slate-300"
            >
              <span className="material-symbols-outlined text-base">code</span>
              {t('view-code')}
            </a>
          )}
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-lg border px-4 py-2 text-sm font-bold transition-all active:scale-95 ${
                !project.liveUrl
                  ? 'border-slate-950 bg-slate-950 text-white hover:bg-teal-700 dark:border-teal-300 dark:bg-teal-300 dark:text-slate-950'
                  : 'border-slate-900/10 bg-white/35 text-slate-700 hover:border-coral-500/30 hover:bg-coral-500/10 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300'
              }`}
            >
              <span className="material-symbols-outlined text-base">open_in_new</span>
              <span>{t('view-demo')}</span>
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-teal-700 active:scale-95 dark:bg-teal-300 dark:text-slate-950 dark:hover:bg-coral-300"
            >
              <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-white/0 via-white/20 to-white/0 transition-transform duration-700 group-hover/btn:translate-x-[100%]" />
              <span className="material-symbols-outlined text-base relative">rocket_launch</span>
              <span className="relative">{t('view-live')}</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
