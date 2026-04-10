'use client';

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store';
import type { TimelineEntry } from '@/types';

export function TimelineItem({
  item,
  index,
}: {
  item: TimelineEntry;
  index: number;
}) {
  const { t } = useTranslation();
  const lang = useAppStore((s) => s.language);

  const title = item.title[lang] || item.title.en;
  const company = item.company[lang] || item.company.en;
  const period = item.period[lang] || item.period.en;
  const description = item.description[lang] || item.description.en;

  const typeLabel =
    item.type === 'education'
      ? t('timeline-education')
      : item.type === 'certification'
        ? t('timeline-certification')
        : t('timeline-work');

  return (
    <motion.div
      initial={{ opacity: 0, x: -30, filter: 'blur(4px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative pl-8 border-l-2 border-primary/20 pb-8 last:pb-0 group"
    >
      <motion.div
        className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full border-4 border-white dark:border-background-dark"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: index * 0.1 + 0.2 }}
      />
      <div className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200/80 dark:border-slate-800/80 hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/20 transition-all group-hover:translate-x-1 duration-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
          <div className="flex items-center gap-3">
            <h4 className="text-xl font-bold">{title}</h4>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase">
              {typeLabel}
            </span>
          </div>
          <span className="text-sm text-slate-500 dark:text-slate-500 mt-1 md:mt-0 font-mono">
            {period}
          </span>
        </div>
        <p className="text-primary font-semibold mb-2">{company}</p>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
