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
      className={`rounded-md px-3 py-2 text-sm font-bold transition-all ${
        active
          ? 'bg-slate-950 text-white shadow-[0_12px_32px_rgba(15,23,42,0.18)] dark:bg-teal-300 dark:text-slate-950'
          : 'text-slate-600 hover:bg-slate-900/[0.055] hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white'
      }`}
    >
      {label}
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
      className="rounded-md px-3 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-coral-500/10 hover:text-coral-600 dark:text-slate-300 dark:hover:text-coral-300"
    >
      {label}
    </button>
  );
}

export function Navbar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-900/10 bg-[#f6f8f2]/86 backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-[#090d0d]/88">
      <nav className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-1.5 sm:gap-3">
          <Link href="/" className="group flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <motion.div
              className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-900/10 bg-white/75 shadow-sm dark:border-white/10 dark:bg-white/[0.045] min-[370px]:flex"
              whileHover={{ rotate: [0, -6, 6, 0] }}
              transition={{ duration: 0.45 }}
            >
              <Image
                src="/img/logo-nobg.png"
                alt="Tamer Akdeniz logo"
                width={32}
                height={32}
                className="h-8 w-8 object-contain transition-all dark:brightness-0 dark:invert"
              />
            </motion.div>
            <div className="min-w-0">
              <h2 className="whitespace-nowrap text-sm font-black tracking-normal text-slate-950 transition-colors group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300 sm:text-base">
                Tamer Akdeniz
              </h2>
              <p className="hidden text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-500 sm:block">
                AI product systems
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-1 rounded-lg border border-slate-900/10 bg-white/60 p-1 backdrop-blur dark:border-white/10 dark:bg-white/[0.035] lg:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.key}
                href={link.href}
                label={link.label}
                active={isActive(link.href)}
              />
            ))}
            <div className="mx-1 h-6 w-px bg-slate-900/10 dark:bg-white/10" />
            <NavButton label={t('nav-cv')} onClick={() => setCvModalOpen(true)} />
            <NavButton label={t('nav-contact')} onClick={() => setContactModalOpen(true)} />
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              href="/admin"
              className="hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-900/10 bg-white/55 text-slate-400 transition-all hover:border-teal-500/30 hover:text-teal-700 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-500 dark:hover:text-teal-300 lg:flex"
              aria-label="Admin"
            >
              <span className="material-symbols-outlined text-[18px]">settings</span>
            </Link>

            <motion.button
              onClick={toggleLanguage}
              className="relative h-9 w-16 cursor-pointer rounded-lg border border-slate-900/10 bg-white/55 transition-colors dark:border-white/10 dark:bg-white/[0.035]"
              aria-label="Toggle language"
              whileTap={{ scale: 0.95 }}
            >
              <span
                className={`absolute left-2 top-1/2 z-10 -translate-y-1/2 text-[10px] font-black text-slate-500 transition-opacity ${
                  language === 'tr' ? 'opacity-0' : 'opacity-100'
                }`}
              >
                TR
              </span>
              <span
                className={`absolute right-2 top-1/2 z-10 -translate-y-1/2 text-[10px] font-black text-slate-500 transition-opacity ${
                  language === 'en' ? 'opacity-0' : 'opacity-100'
                }`}
              >
                EN
              </span>
              <motion.span
                className="absolute top-1/2 z-20 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md bg-slate-950 text-white shadow-md dark:bg-teal-300 dark:text-slate-950"
                animate={{ left: language === 'tr' ? '3px' : '33px' }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              >
                <span className="material-symbols-outlined text-[17px]">language</span>
              </motion.span>
            </motion.button>

            <motion.button
              onClick={toggleTheme}
              className="relative h-9 w-16 cursor-pointer rounded-lg border border-slate-900/10 bg-white/55 transition-colors dark:border-white/10 dark:bg-white/[0.035]"
              aria-label="Toggle theme"
              whileTap={{ scale: 0.95 }}
            >
              <span
                className={`material-symbols-outlined pointer-events-none absolute left-1.5 top-1/2 z-10 -translate-y-1/2 text-[18px] text-amber-500 transition-opacity ${
                  theme === 'dark' ? 'opacity-30' : 'opacity-100'
                }`}
              >
                light_mode
              </span>
              <span
                className={`material-symbols-outlined pointer-events-none absolute right-1.5 top-1/2 z-10 -translate-y-1/2 text-[18px] text-teal-600 transition-opacity dark:text-teal-300 ${
                  theme === 'light' ? 'opacity-30' : 'opacity-100'
                }`}
              >
                dark_mode
              </span>
              <motion.span
                className="absolute top-1/2 z-20 h-7 w-7 -translate-y-1/2 rounded-md bg-slate-950 shadow-md dark:bg-teal-300"
                animate={{ left: theme === 'light' ? '3px' : '33px' }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            </motion.button>

            <motion.button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-900/10 bg-white/55 text-slate-700 transition-colors hover:bg-white dark:border-white/10 dark:bg-white/[0.035] dark:text-white lg:hidden"
              aria-label="Toggle navigation"
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
            className="overflow-hidden border-t border-slate-900/10 bg-[#f6f8f2]/96 backdrop-blur-xl dark:border-white/10 dark:bg-[#090d0d]/96 lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="space-y-1 px-4 py-4">
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
                    className={`block rounded-lg px-4 py-3 text-sm font-bold transition-all ${
                      isActive(link.href)
                        ? 'bg-slate-950 text-white dark:bg-teal-300 dark:text-slate-950'
                        : 'text-slate-700 hover:bg-slate-900/[0.055] dark:text-slate-300 dark:hover:bg-white/[0.06]'
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
                  onClick={() => {
                    setMobileOpen(false);
                    setCvModalOpen(true);
                  }}
                  className="block w-full rounded-lg px-4 py-3 text-left text-sm font-bold text-slate-700 transition-all hover:bg-coral-500/10 hover:text-coral-600 dark:text-slate-300 dark:hover:text-coral-300"
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
                  onClick={() => {
                    setMobileOpen(false);
                    setContactModalOpen(true);
                  }}
                  className="block w-full rounded-lg px-4 py-3 text-left text-sm font-bold text-slate-700 transition-all hover:bg-teal-500/10 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300"
                >
                  {t('nav-contact')}
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
