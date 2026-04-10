'use client';

import { useAppStore, selectAvailability } from '@/store';
import { motion } from 'framer-motion';

const statusConfig = {
  available: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    text: 'text-green-600 dark:text-green-400',
    dot: 'bg-green-500',
    label: { en: 'Open to Work', tr: 'Çalışmaya Açık' },
  },
  'not-available': {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-600 dark:text-red-400',
    dot: 'bg-red-500',
    label: { en: 'Not available', tr: 'Müsait değil' },
  },
  working: {
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/20',
    text: 'text-gray-600 dark:text-gray-400',
    dot: 'bg-gray-500',
    label: { en: 'Actively working', tr: 'Aktif olarak çalışıyor' },
  },
  'open-to-offers': {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    text: 'text-yellow-600 dark:text-yellow-400',
    dot: 'bg-yellow-500',
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
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${config.bg} border ${config.border} ${config.text} text-xs font-bold uppercase tracking-wide`}
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
