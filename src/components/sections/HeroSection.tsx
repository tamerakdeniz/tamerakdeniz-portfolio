'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAppStore, selectProjects, selectHomeHero } from '@/store';
import { AvailabilityBadge } from '@/components/ui/AvailabilityBadge';
import { MagneticButton } from '@/components/ui/InteractiveEffects';
import { TamerChat } from '@/components/ui/TamerChat';

function ScrambleText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [display, setDisplay] = useState('');
  const [started, setStarted] = useState(false);
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&<>{}[]';

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started || !text) return;
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplay(
        text
          .split('')
          .map((char, idx) => {
            if (char === ' ') return ' ';
            if (idx < iteration) return text[idx];
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );
      iteration += 1 / 3;
      if (iteration >= text.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [started, text]);

  return <>{display || '\u00A0'}</>;
}

function AnimatedCounter({ target, suffix = '+', delay = 0 }: { target: number; suffix?: string; delay?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [started, target]);

  return <>{count}{suffix}</>;
}

function TypewriterLoop({ words, delay = 0 }: { words: string[]; delay?: number }) {
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [text, setText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'pausing' | 'deleting'>('typing');
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timeout);
  }, [delay]);

  const tick = useCallback(() => {
    if (!started) return;
    const word = words[currentWordIdx];

    if (phase === 'typing') {
      if (text.length < word.length) {
        setText(word.slice(0, text.length + 1));
      } else {
        setPhase('pausing');
      }
    } else if (phase === 'pausing') {
      setPhase('deleting');
    } else if (phase === 'deleting') {
      if (text.length > 0) {
        setText(word.slice(0, text.length - 1));
      } else {
        setPhase('typing');
        setCurrentWordIdx((prev) => (prev + 1) % words.length);
      }
    }
  }, [started, text, phase, currentWordIdx, words]);

  useEffect(() => {
    if (!started) return;
    const speed = phase === 'pausing' ? 2000 : phase === 'deleting' ? 35 : 70;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, started, phase]);

  return (
    <span className="text-primary">
      {text}
      <motion.span
        className="inline-block w-[2px] h-[1em] bg-primary ml-0.5 align-middle"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.53, repeat: Infinity, repeatType: 'reverse' }}
      />
    </span>
  );
}

function StatusLine() {
  const { t } = useTranslation();
  const projects = useAppStore(selectProjects);
  const language = useAppStore((s) => s.language);
  const projectCount = projects.filter((p) => p.published).length;
  const startYear = 2021;
  const yearsExp = new Date().getFullYear() - startYear;

  return (
    <motion.div
      className="flex flex-wrap items-center gap-5 text-xs font-mono"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.6, duration: 0.6 }}
    >
      <div className="flex items-center gap-2 text-slate-500">
        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-sm">trending_up</span>
        </span>
        <div>
          <span className="text-slate-900 dark:text-white font-bold text-lg font-sans leading-none">
            <AnimatedCounter target={yearsExp} delay={1.8} />
          </span>
          <span className="text-slate-400 dark:text-slate-600 ml-1.5 text-[10px] uppercase tracking-wider font-sans">
            {language === 'tr' ? 'Yıl' : 'Years'}
          </span>
        </div>
      </div>
      <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
      <div className="flex items-center gap-2 text-slate-500">
        <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary text-sm">deployed_code</span>
        </span>
        <div>
          <span className="text-slate-900 dark:text-white font-bold text-lg font-sans leading-none">
            <AnimatedCounter target={projectCount} delay={2.0} />
          </span>
          <span className="text-slate-400 dark:text-slate-600 ml-1.5 text-[10px] uppercase tracking-wider font-sans">
            {language === 'tr' ? 'Proje' : 'Projects'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function AdminLink() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    if (clickCount >= 3) {
      router.push('/admin');
      setClickCount(0);
    }
    if (clickCount > 0) {
      const timeout = setTimeout(() => setClickCount(0), 2000);
      return () => clearTimeout(timeout);
    }
  }, [clickCount, router]);

  return (
    <button
      onClick={() => setClickCount((c) => c + 1)}
      className="absolute bottom-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center text-slate-300/30 dark:text-slate-700/30 hover:text-slate-400/50 dark:hover:text-slate-600/50 transition-colors cursor-default"
      aria-label="Settings"
    >
      <span className="material-symbols-outlined text-[16px]">settings</span>
    </button>
  );
}

export function HeroSection() {
  const { t } = useTranslation();
  const heroSettings = useAppStore(selectHomeHero);
  const language = useAppStore((s) => s.language);
  const setContactModalOpen = useAppStore((s) => s.setContactModalOpen);
  const setCvModalOpen = useAppStore((s) => s.setCvModalOpen);

  const fullTitle = heroSettings.title?.[language] || heroSettings.title?.en || '';
  const words = fullTitle.trim().split(/\s+/).filter(Boolean);

  let part1 = t('hero-title-1');
  let part2 = t('hero-title-2');
  if (words.length >= 2) {
    const mid = Math.ceil(words.length / 2);
    part1 = words.slice(0, mid).join(' ');
    part2 = words.slice(mid).join(' ');
  } else if (words.length === 1) {
    part1 = words[0];
    part2 = '';
  }

  const heroDesc =
    heroSettings.description?.[language] || heroSettings.description?.en || t('hero-description');
  const moreLabel =
    heroSettings.moreLabel?.[language] || heroSettings.moreLabel?.en || t('hero-more-about');

  const typewriterWords =
    language === 'tr'
      ? ['LLM Entegrasyonu', 'Full-Stack', 'Yapay Zeka', 'Akıllı Sistemler', 'Otomasyon']
      : ['LLM Integration', 'Full-Stack', 'AI Products', 'Smart Systems', 'Automation'];

  return (
    <section className="relative lg:overflow-hidden lg:h-[calc(100dvh-4rem)] lg:max-h-[calc(100dvh-4rem)] flex items-center min-h-[calc(100dvh-5rem)] lg:min-h-0">
      {/* backgrounds — contained in a clipped layer to prevent overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 hero-grid" />
        <div className="absolute inset-0 aurora-bg" />
        <motion.div
          className="absolute top-1/4 left-1/4 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[180px] will-change-transform"
          animate={{ opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-[10%] w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[140px] will-change-transform"
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
      </div>

      {/* side accent */}
      <motion.div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-32 bg-gradient-to-b from-transparent via-primary/30 to-transparent hidden lg:block"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      />

      {/* content: left hero + right chat */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-0 flex flex-col lg:flex-row items-center lg:items-center gap-8 lg:gap-12">
        {/* LEFT: hero content */}
        <div className="flex-1 flex flex-col items-start text-left space-y-4 sm:space-y-5 w-full min-w-0">
          <AvailabilityBadge />

          <div className="space-y-1">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-8xl font-black tracking-tighter leading-[1.1]">
              <motion.span
                className="block"
                initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <ScrambleText text={part1} delay={0.3} />
              </motion.span>
              <motion.span
                className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-cyan-400"
                initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <ScrambleText text={part2} delay={0.6} />
              </motion.span>
            </h1>

            {/* typewriter */}
            <motion.div
              className="flex items-center gap-2 text-sm font-mono pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0, duration: 0.5 }}
            >
              <span className="text-slate-400 dark:text-slate-600 select-none">{'>'}</span>
              <span className="text-slate-500 dark:text-slate-500 select-none">focus:</span>
              <TypewriterLoop words={typewriterWords} delay={1.2} />
            </motion.div>
          </div>

          {/* description */}
          <motion.p
            className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md leading-relaxed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            {heroDesc}{' '}
            <Link
              href="/about"
              className="inline-flex items-baseline gap-0 ml-1 text-primary underline underline-offset-4 decoration-1 decoration-primary/40 hover:decoration-primary transition-all group font-medium"
            >
              <span>{moreLabel}</span>
              <span className="material-symbols-outlined text-sm leading-none group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-wrap gap-3 w-full"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            <MagneticButton href="/projects">
              <div className="group relative flex items-center justify-center h-11 px-5 sm:px-7 rounded-xl bg-primary text-white text-sm font-semibold transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-primary/25 active:scale-95 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative">{t('btn-view-projects')}</span>
                <span className="material-symbols-outlined ml-2 text-[18px] group-hover:translate-x-1 transition-transform shrink-0 relative">
                  arrow_forward
                </span>
              </div>
            </MagneticButton>

            <MagneticButton onClick={() => setContactModalOpen(true)}>
              <div className="flex items-center justify-center h-11 px-5 sm:px-7 rounded-xl bg-white/80 dark:bg-[#282e39]/80 backdrop-blur-sm border border-gray-200 dark:border-slate-700/50 text-slate-900 dark:text-white text-sm font-semibold hover:bg-white dark:hover:bg-[#323945] transition-all active:scale-95 hover:border-primary/30">
                {t('btn-contact')}
              </div>
            </MagneticButton>

            <MagneticButton onClick={() => setCvModalOpen(true)}>
              <div className="flex items-center justify-center h-11 px-5 sm:px-7 rounded-xl bg-transparent border border-slate-300/80 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 hover:border-primary/30">
                <span className="material-symbols-outlined mr-1.5 text-[18px] shrink-0">download</span>
                {t('btn-cv')}
              </div>
            </MagneticButton>
          </motion.div>

          {/* stats */}
          <StatusLine />
        </div>

        {/* RIGHT: chat widget */}
        <motion.div
          className="w-full lg:w-[380px] xl:w-[400px] shrink-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
        >
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary/8 via-transparent to-cyan-400/6 rounded-3xl blur-2xl pointer-events-none" />
            {/* Border gradient frame */}
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-cyan-400/15 pointer-events-none" />
            <div className="relative bg-white/50 dark:bg-[#13151a]/70 backdrop-blur-2xl rounded-2xl border border-white/30 dark:border-slate-700/20 shadow-2xl shadow-primary/5 p-4 h-[420px] lg:h-[480px] flex flex-col overflow-hidden">
              <TamerChat />
            </div>
          </div>
        </motion.div>
      </div>

      <AdminLink />

      {/* Copyright */}
      <div className="absolute bottom-3 left-0 right-0 text-center text-[10px] sm:text-xs text-slate-400/60 dark:text-slate-600/60 z-10">
        © {new Date().getFullYear()} Tamer Akdeniz. {language === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
      </div>
    </section>
  );
}
