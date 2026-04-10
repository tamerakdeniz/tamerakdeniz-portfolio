'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store';
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
      className="group bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-gray-200/80 dark:border-slate-800/80 hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/20 transition-all h-full"
      style={{ display: 'grid', gridTemplateRows: 'auto 1fr' }}
    >
      <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center overflow-hidden relative">
        {project.image ? (
          <img
            src={project.image}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="material-symbols-outlined text-6xl text-primary/50">code</span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <div className="p-6 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map((cat) => (
            <span
              key={cat}
              className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full"
            >
              {categoryDisplayName[cat]?.[lang] || cat.toUpperCase()}
            </span>
          ))}
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">{description}</p>
        <div className="flex flex-wrap gap-2 mb-4 mt-auto">
          {(project.techStack || []).map((tech) => (
            <span
              key={tech}
              className="px-2 py-1 bg-gray-100/80 dark:bg-slate-800/80 text-xs rounded-md"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-auto">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2 bg-gray-100/80 dark:bg-slate-800/80 rounded-xl text-center font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
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
              className={`flex-1 px-4 py-2 bg-white/10 dark:bg-white/5 border border-gray-200 dark:border-slate-700 backdrop-blur-md rounded-xl text-center font-medium hover:bg-gray-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm active:scale-95 overflow-hidden ${!project.liveUrl ? 'bg-primary text-white border-primary hover:bg-blue-700 dark:bg-primary dark:text-white' : ''}`}
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
              className="group/btn flex-1 px-4 py-2 bg-primary text-white rounded-xl text-center font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm active:scale-95 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
              <span className="material-symbols-outlined text-base relative">rocket_launch</span>
              <span className="relative">{t('view-live')}</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
