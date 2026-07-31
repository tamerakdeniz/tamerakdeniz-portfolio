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
  const isLeft = index % 2 === 0;

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
      initial={{ opacity: 0, x: isLeft ? -28 : 28, filter: 'blur(4px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative pb-7 lg:grid lg:grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] lg:items-start"
    >
      <div
        className={`relative pl-8 lg:pl-0 ${
          isLeft
            ? 'lg:col-start-1 lg:pr-8'
            : 'lg:col-start-3 lg:pl-8'
        }`}
      >
        <motion.div
          className="absolute left-0 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-coral-500 shadow-[0_0_0_5px_rgba(15,118,110,0.12)] dark:border-background-dark lg:hidden"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: index * 0.1 + 0.2 }}
        />

        <div className="rounded-lg border border-slate-900/10 bg-white/75 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.07)] backdrop-blur-sm transition-all duration-300 hover:border-teal-500/30 dark:border-white/10 dark:bg-white/[0.045] dark:hover:border-teal-300/25">
          <div className="mb-3 flex flex-row items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-teal-500/20 bg-teal-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-teal-700 dark:text-teal-300">
                  {typeLabel}
                </span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-500">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <h4 className="mt-3 text-xl font-black tracking-normal text-slate-950 dark:text-white">
                {title}
              </h4>
            </div>
            <span className="shrink-0 whitespace-nowrap pt-1 font-mono text-[11px] text-slate-500 dark:text-slate-500 sm:text-xs">
              {period}
            </span>
          </div>
          <p className="mb-2 font-bold text-coral-600 dark:text-coral-300">{company}</p>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p>
        </div>
      </div>

      <div className="hidden lg:col-start-2 lg:row-start-1 lg:flex lg:justify-center">
        <motion.div
          className="mt-1 h-4 w-4 rounded-full border-2 border-white bg-coral-500 shadow-[0_0_0_7px_rgba(15,118,110,0.12)] dark:border-background-dark"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: index * 0.1 + 0.2 }}
        />
      </div>
    </motion.div>
  );
}
