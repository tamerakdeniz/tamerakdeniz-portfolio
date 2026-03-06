'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { useAppStore, selectProjects } from '@/store';
import { PageBackground, SectionHeading } from '@/components/ui/InteractiveEffects';

const allCategories = [
  'all', 'web', 'ai', 'startup', 'opensource', 'desktop', 'mobile', 'practice', 'test',
] as const;

export default function ProjectsPage() {
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState('all');
  const projects = useAppStore(selectProjects);

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
      if (Array.isArray(p.category)) {
        p.category.forEach((c) => cats.add(c));
      } else if (p.category) {
        cats.add(p.category);
      }
    });
    return allCategories.filter((c) => cats.has(c));
  }, [publishedProjects]);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return publishedProjects;
    return publishedProjects.filter((p) => {
      if (Array.isArray(p.category)) return p.category.includes(activeFilter);
      return p.category === activeFilter;
    });
  }, [publishedProjects, activeFilter]);

  return (
    <Layout>
      <PageBackground intensity="subtle" />
      <div className="min-h-screen py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title={t('projects-title')}
            subtitle={t('projects-subtitle')}
          />

          <motion.div
            className="flex flex-wrap justify-center gap-3 mb-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {availableCategories.map((cat, i) => (
              <motion.button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-5 py-2 rounded-full font-medium transition-all text-sm ${
                  activeFilter === cat
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm border border-gray-200/80 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:border-primary/30'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.03 }}
                whileTap={{ scale: 0.95 }}
              >
                {t(`filter-${cat}`)}
              </motion.button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                className="text-center py-16"
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
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
