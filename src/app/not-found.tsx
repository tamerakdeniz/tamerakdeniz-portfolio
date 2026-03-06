'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { PageBackground } from '@/components/ui/InteractiveEffects';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <Layout>
      <PageBackground intensity="subtle" />
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-10rem)] relative z-10">
        <div className="text-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-[120px] md:text-[180px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-400">
              404
            </h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-gray-200/80 dark:border-slate-800/80 max-w-md mx-auto"
          >
            <h2 className="text-2xl font-bold mb-3">{t('404-title')}</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {t('404-description')}
            </p>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-primary/25 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="material-symbols-outlined relative">home</span>
                <span className="relative">{t('404-home')}</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
