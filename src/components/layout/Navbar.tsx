'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store';

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="relative text-sm font-medium transition-colors group py-1"
    >
      <span className={active ? 'text-primary' : 'text-slate-600 dark:text-slate-300 group-hover:text-primary'}>
        {label}
      </span>
      <motion.div
        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
        initial={false}
        animate={{ scaleX: active ? 1 : 0, opacity: active ? 1 : 0 }}
        whileHover={{ scaleX: 1, opacity: 0.5 }}
        transition={{ duration: 0.2 }}
        style={{ originX: 0.5 }}
      />
    </Link>
  );
}

function NavButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative text-sm font-medium transition-colors group py-1 text-slate-600 dark:text-slate-300 hover:text-primary"
    >
      <span>{label}</span>
      <motion.div
        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full"
        initial={{ scaleX: 0, opacity: 0 }}
        whileHover={{ scaleX: 1, opacity: 0.5 }}
        transition={{ duration: 0.2 }}
        style={{ originX: 0.5 }}
      />
    </button>
  );
}

export function Navbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHome = pathname === '/';

  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const language = useAppStore((s) => s.language);
  const toggleLanguage = useAppStore((s) => s.toggleLanguage);
  const setCvModalOpen = useAppStore((s) => s.setCvModalOpen);
  const setContactModalOpen = useAppStore((s) => s.setContactModalOpen);

  const navLinks = [
    { href: '/', label: t('nav-home'), key: 'home' },
    { href: '/about', label: t('nav-about'), key: 'about' },
    { href: '/projects', label: t('nav-projects'), key: 'projects' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHome
          ? 'glass md:bg-transparent md:backdrop-blur-none border-b border-gray-200/80 dark:border-[#282e39]/80 md:border-transparent'
          : 'glass border-b border-gray-200/80 dark:border-[#282e39]/80'
      }`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-20 md:h-16">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 md:flex-row md:items-center md:gap-3 group"
          >
            <motion.div whileHover={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 0.5 }}>
              <Image
                src="/img/logo-nobg.png"
                alt="Logo"
                width={40}
                height={40}
                className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10 object-contain dark:brightness-0 dark:invert transition-all"
              />
            </motion.div>
            <h2 className="text-slate-900 dark:text-white text-sm md:text-lg font-bold tracking-tight group-hover:text-primary transition-colors">
              Tamer Akdeniz
            </h2>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.key}
                href={link.href}
                label={link.label}
                active={isActive(link.href)}
              />
            ))}
            <NavButton label={t('nav-cv')} onClick={() => setCvModalOpen(true)} />
            <NavButton label={t('nav-contact')} onClick={() => setContactModalOpen(true)} />
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={toggleLanguage}
              className="relative w-16 h-8 rounded-full bg-gray-200 dark:bg-[#282e39] transition-colors cursor-pointer"
              aria-label="Toggle language"
              whileTap={{ scale: 0.95 }}
            >
              <span
                className={`absolute left-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 z-10 transition-opacity ${
                  language === 'tr' ? 'opacity-0' : 'opacity-100'
                }`}
              >
                TR
              </span>
              <span
                className={`absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 z-10 transition-opacity ${
                  language === 'en' ? 'opacity-0' : 'opacity-100'
                }`}
              >
                EN
              </span>
              <motion.span
                className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-white dark:bg-slate-700 rounded-full shadow-md z-20 flex items-center justify-center"
                animate={{ left: language === 'tr' ? '2px' : '34px' }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <span className="material-symbols-outlined text-[18px] text-primary">language</span>
              </motion.span>
            </motion.button>

            <motion.button
              onClick={toggleTheme}
              className="relative w-16 h-8 rounded-full bg-gray-200 dark:bg-[#282e39] transition-colors cursor-pointer"
              aria-label="Toggle theme"
              whileTap={{ scale: 0.95 }}
            >
              <span
                className={`material-symbols-outlined absolute left-1.5 top-1/2 -translate-y-1/2 text-[18px] text-amber-500 z-10 pointer-events-none transition-opacity ${
                  theme === 'dark' ? 'opacity-30' : 'opacity-100'
                }`}
              >
                light_mode
              </span>
              <span
                className={`material-symbols-outlined absolute right-1.5 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 dark:text-blue-400 z-10 pointer-events-none transition-opacity ${
                  theme === 'light' ? 'opacity-30' : 'opacity-100'
                }`}
              >
                dark_mode
              </span>
              <motion.span
                className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-white dark:bg-slate-700 rounded-full shadow-md z-20"
                animate={{ left: theme === 'light' ? '2px' : '34px' }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            </motion.button>

            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center size-10 rounded-xl hover:bg-gray-200 dark:hover:bg-[#282e39] transition-colors text-slate-600 dark:text-white"
              whileTap={{ scale: 0.9 }}
            >
              <motion.span
                className="material-symbols-outlined text-[20px]"
                animate={{ rotate: mobileOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {mobileOpen ? 'close' : 'menu'}
              </motion.span>
            </motion.button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden border-t border-gray-200 dark:border-[#282e39] bg-white/95 dark:bg-background-dark/95 backdrop-blur-xl overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-3 rounded-xl transition-all ${
                      isActive(link.href)
                        ? 'text-primary font-medium bg-primary/5'
                        : 'hover:bg-gray-100 dark:hover:bg-[#282e39]'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <button
                  onClick={() => { setMobileOpen(false); setCvModalOpen(true); }}
                  className="w-full text-left block px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#282e39] transition-all"
                >
                  {t('nav-cv')}
                </button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <button
                  onClick={() => { setMobileOpen(false); setContactModalOpen(true); }}
                  className="w-full text-left block px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-[#282e39] transition-all"
                >
                  {t('nav-contact')}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
