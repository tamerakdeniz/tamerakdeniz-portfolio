'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { useAppStore, selectProjects } from '@/store';
import { PageBackground } from '@/components/ui/InteractiveEffects';

const allCategories = [
  'all', 'web', 'ai', 'startup', 'opensource', 'desktop', 'mobile', 'extension', 'practice', 'test',
] as const;

export default function ProjectsPage() {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');
  const language = useAppStore((s) => s.language);
  const projects = useAppStore(selectProjects);
  const siteDataLoaded = useAppStore((s) => s.siteDataLoaded);

  const publishedProjects = useMemo(
    () =>
      projects
        .filter((p) => p.published)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [projects]
  );

  const availableCategories = useMemo(() => {
    const cats = new Set<string>(['all']);
    publishedProjects.forEach((p) => {
      const pCats = Array.isArray(p.category) ? p.category : [p.category || 'web'];
      pCats.forEach((c) => cats.add(c));
    });
    return allCategories.filter((c) => cats.has(c));
  }, [publishedProjects]);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return publishedProjects;
    return publishedProjects.filter((p) => {
      const pCats = Array.isArray(p.category) ? p.category : [p.category || 'web'];
      return pCats.includes(activeFilter);
    });
  }, [publishedProjects, activeFilter]);

  return (
    <Layout>
      <PageBackground intensity="subtle" />
      <div className="relative z-10 min-h-screen py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 grid gap-6 border-b border-slate-900/10 pb-8 dark:border-white/10 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
            <div>
              <div className="mb-4 h-1 w-16 bg-gradient-to-r from-teal-500 via-coral-400 to-amber-300" />
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-coral-600 dark:text-coral-300">
                {language === 'tr' ? 'ürün kayıtları' : 'build archive'}
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-normal text-slate-950 dark:text-white md:text-6xl">
                {t('projects-title')}
              </h1>
            </div>
            <div className="max-w-2xl lg:justify-self-end">
              <p className="text-base leading-8 text-slate-600 dark:text-slate-400 sm:text-lg">
                {t('projects-subtitle')}
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-slate-900/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.045]">
                  <span className="block text-2xl font-black text-slate-950 dark:text-white">
                    {publishedProjects.length}
                  </span>
                  <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    {language === 'tr' ? 'yayında' : 'live'}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-900/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.045]">
                  <span className="block text-2xl font-black text-slate-950 dark:text-white">
                    {availableCategories.length}
                  </span>
                  <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    {language === 'tr' ? 'kategori' : 'lanes'}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-900/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.045]">
                  <span className="block text-2xl font-black text-slate-950 dark:text-white">
                    AI
                  </span>
                  <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    {language === 'tr' ? 'odak' : 'focus'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            className="mb-10 flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {availableCategories.map((cat, i) => (
              <motion.button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`rounded-lg border px-4 py-2 text-sm font-black uppercase tracking-[0.12em] transition-all ${
                  activeFilter === cat
                    ? 'border-slate-950 bg-slate-950 text-white shadow-[0_16px_45px_rgba(15,23,42,0.14)] dark:border-teal-300 dark:bg-teal-300 dark:text-slate-950'
                    : 'border-slate-900/10 bg-white/70 text-slate-600 backdrop-blur-sm hover:border-teal-500/35 hover:bg-white hover:text-teal-700 dark:border-white/10 dark:bg-white/[0.045] dark:text-slate-300 dark:hover:border-teal-300/25 dark:hover:text-teal-300'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.03 }}
                whileTap={{ scale: 0.95 }}
              >
                {t(`filter-${cat}`) === `filter-${cat}` ? cat.toUpperCase() : t(`filter-${cat}`)}
              </motion.button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {!siteDataLoaded && projects.length === 0 ? (
              <motion.div
                key="loading"
                className="rounded-lg border border-slate-900/10 bg-white/70 py-16 text-center dark:border-white/10 dark:bg-white/[0.045]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <span className="material-symbols-outlined text-5xl text-primary/60 mb-4 block animate-pulse">
                  hourglass_empty
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  {t('projects-loading')}
                </p>
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                key="empty"
                className="rounded-lg border border-slate-900/10 bg-white/70 py-16 text-center dark:border-white/10 dark:bg-white/[0.045]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 mb-4 block">
                  folder_off
                </span>
                <p className="text-slate-600 dark:text-slate-400">
                  {t('no-projects')}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key={activeFilter}
                className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {filtered.map((project, i) => (
                  <ProjectCard key={project.id} project={project} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
