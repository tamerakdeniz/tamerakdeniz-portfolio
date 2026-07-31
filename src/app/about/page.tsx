'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { SkillCard } from '@/components/ui/SkillCard';
import { TimelineItem } from '@/components/ui/TimelineItem';
import { useAppStore, selectAboutEntries, selectSkills, selectTimeline } from '@/store';
import { PageBackground } from '@/components/ui/InteractiveEffects';
import { CachedImage } from '@/components/ui/CachedImage';

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

  const maxShow = expanded ? filteredSkills.length : 8;
  const visibleSkills = filteredSkills.slice(0, maxShow);
  const remaining = filteredSkills.length - maxShow;

  const sortedTimeline = [...timeline]
    .filter((item) => item.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const title = activeEntry?.title?.[language] || activeEntry?.title?.en || 'Tamer Akdeniz';
  const rawContent = activeEntry?.content?.[language] || activeEntry?.content?.en || '';
  const paragraphs = rawContent.split(/\n\s*\n/).filter((p: string) => p.trim());
  const avatarText = activeEntry?.avatar?.text || 'TA';
  const avatarUrl = activeEntry?.avatar?.imageUrl || '/img/underwaterme.jpg';

  const principles =
    language === 'tr'
      ? [
          ['01', 'Belirsizliği aç', 'Problemi netleştirmeden ekrana koşmaz.'],
          ['02', 'Akışı kur', 'AI, frontend ve veriyi tek ürün ritmine bağlar.'],
          ['03', 'Çalışanı göster', 'Sunumdan önce çalışan prototip ve canlı çıktı üretir.'],
        ]
      : [
          ['01', 'Open the unknown', 'Does not run to UI before the problem is sharp.'],
          ['02', 'Wire the flow', 'Connects AI, frontend, and data into one product rhythm.'],
          ['03', 'Show working proof', 'Prefers running prototypes and shipped output over slides.'],
        ];

  return (
    <Layout>
      <PageBackground intensity="subtle" />
      <div className="relative z-10 min-h-screen py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-stretch">
            <motion.aside
              className="relative min-h-[420px] overflow-hidden rounded-lg border border-slate-900/10 bg-slate-950 shadow-[0_30px_90px_rgba(15,23,42,0.18)] dark:border-white/10"
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.65 }}
            >
              <CachedImage
                src={avatarUrl}
                alt={avatarText}
                loading="eager"
                fetchPriority="high"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,13,13,0.12),rgba(9,13,13,0.82)),linear-gradient(90deg,rgba(9,13,13,0.72),transparent_62%)]" />
              <div className="absolute left-4 top-4 rounded-md border border-white/15 bg-black/35 px-3 py-2 backdrop-blur">
                <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-teal-200">
                  {language === 'tr' ? 'profil koordinatı' : 'profile coordinate'}
                </span>
                <span className="mt-1 block text-xs text-white/70">Istanbul / AI systems</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-coral-200">
                  Tamer Akdeniz
                </p>
                <h1 className="mt-2 max-w-sm text-3xl font-black leading-tight tracking-normal text-white sm:text-4xl">
                  {language === 'tr'
                    ? 'Derine bakan, ürüne dönüştüren geliştirici.'
                    : 'A developer who looks deeper and turns it into product.'}
                </h1>
              </div>
            </motion.aside>

            <motion.div
              className="rounded-lg border border-slate-900/10 bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] sm:p-8 lg:p-10"
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.65, delay: 0.1 }}
            >
              <div className="mb-5 h-1 w-16 bg-gradient-to-r from-teal-500 via-coral-400 to-amber-300" />
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-coral-600 dark:text-coral-300">
                {t('about-title')}
              </p>
              <h2 className="mt-3 text-4xl font-black tracking-normal text-slate-950 dark:text-white md:text-6xl">
                {title}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-400 sm:text-lg">
                {t('about-subtitle')}
              </p>

              {paragraphs.length > 0 && (
                <div className="mt-8 grid gap-4">
                  {paragraphs.map((p: string, i: number) => (
                    <motion.p
                      key={i}
                      className="border-l border-teal-500/25 pl-4 text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + i * 0.08 }}
                    >
                      {p}
                    </motion.p>
                  ))}
                </div>
              )}

              <div className="mt-8 grid gap-3 md:grid-cols-3">
                {principles.map(([number, heading, body], index) => (
                  <motion.div
                    key={heading}
                    className="rounded-lg border border-slate-900/10 bg-slate-900/[0.035] p-4 dark:border-white/10 dark:bg-white/[0.035]"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + index * 0.08 }}
                  >
                    <span className="font-mono text-[11px] text-coral-600 dark:text-coral-300">
                      {number}
                    </span>
                    <h3 className="mt-3 text-sm font-black text-slate-950 dark:text-white">
                      {heading}
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-400">
                      {body}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          <section className="mt-16">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-coral-600 dark:text-coral-300">
                  {language === 'tr' ? 'araç tezgâhı' : 'tool bench'}
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950 dark:text-white md:text-4xl">
                  {t('skills-title')}
                </h2>
              </div>
              <div className="relative z-40">
                <motion.button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 rounded-lg border border-slate-900/10 bg-white/75 px-4 py-2 text-sm font-bold text-slate-700 backdrop-blur-sm transition-all hover:border-teal-500/35 hover:bg-white dark:border-white/10 dark:bg-white/[0.045] dark:text-slate-300"
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
                    className="absolute right-0 top-full z-40 mt-2 max-h-[400px] min-w-[220px] overflow-y-auto rounded-lg border border-slate-900/10 bg-white/95 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-[#111817]/95"
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
                        className={`w-full border-b border-slate-900/10 px-4 py-3 text-left text-sm font-bold transition-all last:border-0 dark:border-white/10 ${
                          selectedCategory === cat
                            ? 'bg-slate-950 text-white dark:bg-teal-300 dark:text-slate-950'
                            : 'text-slate-700 hover:bg-teal-500/10 dark:text-slate-300'
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
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {visibleSkills.map((skill, i) => (
                <SkillCard key={skill.name} skill={skill} index={i} />
              ))}
              {remaining > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setExpanded(true)}
                  className="flex min-h-[112px] cursor-pointer flex-col items-center justify-center rounded-lg border border-slate-900/10 bg-white/75 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.07)] backdrop-blur-sm transition-all hover:scale-[1.02] hover:border-teal-500/30 hover:bg-white dark:border-white/10 dark:bg-white/[0.045]"
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md border border-teal-500/20 bg-teal-500/10">
                    <span className="material-symbols-outlined text-3xl text-teal-700 dark:text-teal-300">add</span>
                  </div>
                  <span className="text-center text-xs font-bold">+{remaining}</span>
                </motion.button>
              )}
            </div>
          </section>

          <section className="mt-16 grid gap-8 lg:grid-cols-[0.34fr_0.66fr]">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-coral-600 dark:text-coral-300">
                {language === 'tr' ? 'zaman kaydı' : 'time log'}
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-normal text-slate-950 dark:text-white md:text-4xl">
                {t('timeline-title')}
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
                {language === 'tr'
                  ? 'Eğitim, iş ve sertifikalar tek bir üretim hattında okunur.'
                  : 'Education, work, and certificates read as one production line.'}
              </p>
            </div>
            <div>
              {sortedTimeline.map((item, i) => (
                <TimelineItem key={item.id || i} item={item} index={i} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
