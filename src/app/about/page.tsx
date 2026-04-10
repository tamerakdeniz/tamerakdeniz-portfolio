'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { SkillCard } from '@/components/ui/SkillCard';
import { TimelineItem } from '@/components/ui/TimelineItem';
import { useAppStore, selectAboutEntries, selectSkills, selectTimeline } from '@/store';
import { PageBackground, SectionHeading, GlassCard } from '@/components/ui/InteractiveEffects';

const skillCategories = [
  'all', 'mobile', 'frontend', 'backend', 'database', 'devops', 'ai', 'tools', 'other',
] as const;

export default function AboutPage() {
  const { t } = useTranslation();
  const language = useAppStore((s) => s.language);
  const aboutEntries = useAppStore(selectAboutEntries);
  const siteData = useAppStore((s) => s.siteData);
  const skills = useAppStore(selectSkills);
  const timeline = useAppStore(selectTimeline);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const activeAboutId = siteData?.activeAboutId;
  const activeEntry = activeAboutId
    ? aboutEntries.find((e) => e.id === activeAboutId) || aboutEntries[0]
    : aboutEntries[0];

  const filteredSkills = skills
    .filter((s) => s.published !== false)
    .filter((s) => {
      if (selectedCategory === 'all') return true;
      if (Array.isArray(s.category)) return s.category.includes(selectedCategory);
      return s.category === selectedCategory;
    })
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const maxShow = expanded ? filteredSkills.length : 7;
  const visibleSkills = filteredSkills.slice(0, maxShow);
  const remaining = filteredSkills.length - maxShow;

  const sortedTimeline = [...timeline]
    .filter((item) => item.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const title = activeEntry?.title?.[language] || activeEntry?.title?.en || '';
  const rawContent = activeEntry?.content?.[language] || activeEntry?.content?.en || '';
  const paragraphs = rawContent.split(/\n\s*\n/).filter((p: string) => p.trim());
  const avatarText = activeEntry?.avatar?.text || 'TA';
  const avatarUrl = activeEntry?.avatar?.imageUrl || '';

  return (
    <Layout>
      <PageBackground intensity="subtle" />
      <div className="min-h-screen py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title={t('about-title')}
            subtitle={t('about-subtitle')}
          />

          {/* Bio */}
          {activeEntry && (
            <GlassCard className="mb-16 p-8 md:p-12" delay={0.2} hoverEffect={false}>
              <div className="flex flex-col md:flex-row gap-8">
                <motion.div
                  className="shrink-0"
                  initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', delay: 0.4 }}
                >
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-5xl font-bold mx-auto md:mx-0 overflow-hidden shadow-lg shadow-primary/20">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={avatarText} className="w-full h-full object-cover" />
                    ) : (
                      avatarText
                    )}
                  </div>
                </motion.div>
                <div className="flex-1">
                  <motion.h3
                    className="text-2xl font-bold mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {title}
                  </motion.h3>
                  {paragraphs.map((p: string, i: number) => (
                    <motion.p
                      key={i}
                      className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                    >
                      {p}
                    </motion.p>
                  ))}
                </div>
              </div>
            </GlassCard>
          )}

          {/* Skills */}
          <div className="mb-16">
            <div className="grid grid-cols-3 items-center mb-8 relative">
              <div className="relative z-40">
                <motion.button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm border border-gray-200/80 dark:border-slate-700/80 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300 font-medium hover:border-primary/30"
                  whileTap={{ scale: 0.97 }}
                >
                  <span>{t(`category-${selectedCategory}`)}</span>
                  <motion.span
                    className="material-symbols-outlined text-sm"
                    animate={{ rotate: dropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    expand_more
                  </motion.span>
                </motion.button>
                {dropdownOpen && (
                  <motion.div
                    className="absolute top-full left-0 mt-2 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200/80 dark:border-slate-800/80 z-40 min-w-[200px] max-h-[400px] overflow-y-auto"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {skillCategories.map((cat, i) => (
                      <motion.button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setDropdownOpen(false);
                          setExpanded(false);
                        }}
                        className={`w-full text-left px-4 py-3 transition-all border-b border-gray-100/80 dark:border-slate-700/80 last:border-0 ${
                          selectedCategory === cat
                            ? 'bg-primary text-white'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-gray-100/80 dark:hover:bg-slate-800/80'
                        }`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                      >
                        {t(`category-${cat}`)}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
              <motion.h3
                className="text-3xl font-bold text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {t('skills-title')}
              </motion.h3>
              <div />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {visibleSkills.map((skill, i) => (
                <SkillCard key={skill.name} skill={skill} index={i} />
              ))}
              {remaining > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setExpanded(true)}
                  className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:scale-105 cursor-pointer hover:border-primary/30"
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="mb-2 flex items-center justify-center h-10 w-10">
                    <span className="material-symbols-outlined text-3xl text-primary">add</span>
                  </div>
                  <span className="font-medium text-center text-xs">+{remaining}</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <motion.h3
              className="text-3xl font-bold mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {t('timeline-title')}
            </motion.h3>
            <div className="space-y-8">
              {sortedTimeline.map((item, i) => (
                <TimelineItem key={item.id || i} item={item} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
