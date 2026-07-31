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
      className="group relative border-l border-teal-500/25 pb-7 pl-8 last:pb-0"
    >
      <motion.div
        className="absolute -left-[7px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-coral-500 shadow-[0_0_0_5px_rgba(15,118,110,0.12)] dark:border-background-dark"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: index * 0.1 + 0.2 }}
      />
      <div className="rounded-lg border border-slate-900/10 bg-white/75 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.07)] backdrop-blur-sm transition-all duration-300 group-hover:translate-x-1 group-hover:border-teal-500/30 dark:border-white/10 dark:bg-white/[0.045] dark:group-hover:border-teal-300/25">
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
                {typeLabel}
              </span>
              <span className="font-mono text-[11px] text-slate-500 dark:text-slate-500">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <h4 className="mt-3 text-xl font-black tracking-normal text-slate-950 dark:text-white">{title}</h4>
          </div>
          <span className="font-mono text-sm text-slate-500 dark:text-slate-500">
            {period}
          </span>
        </div>
        <p className="mb-2 font-bold text-coral-600 dark:text-coral-300">{company}</p>
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p>
      </div>
    </motion.div>
  );
}
