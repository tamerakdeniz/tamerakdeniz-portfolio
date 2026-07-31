'use client';

import { useAppStore, selectAvailability } from '@/store';
import { motion } from 'framer-motion';

const statusConfig = {
  available: {
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/25',
    text: 'text-teal-700 dark:text-teal-300',
    dot: 'bg-teal-500',
    label: { en: 'Open to Work', tr: 'Çalışmaya Açık' },
  },
  'not-available': {
    bg: 'bg-coral-500/10',
    border: 'border-coral-500/25',
    text: 'text-coral-600 dark:text-coral-300',
    dot: 'bg-coral-500',
    label: { en: 'Not available', tr: 'Müsait değil' },
  },
  working: {
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    text: 'text-slate-600 dark:text-slate-400',
    dot: 'bg-slate-500',
    label: { en: 'Actively working', tr: 'Aktif olarak çalışıyor' },
  },
  'open-to-offers': {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
    label: { en: 'Open to offers', tr: 'Tekliflere açık' },
  },
};

export function AvailabilityBadge() {
  const availability = useAppStore(selectAvailability);
  const language = useAppStore((s) => s.language);

  const config = statusConfig[availability.status] || statusConfig.available;
  const label =
    availability.customLabel?.[language] ||
    config.label[language] ||
    config.label.en;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={`inline-flex items-center gap-2 rounded-md px-3 py-1 ${config.bg} border ${config.border} ${config.text} text-xs font-black uppercase tracking-[0.14em]`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.dot} opacity-75`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}
        />
      </span>
      <span>{label}</span>
    </motion.div>
  );
}
