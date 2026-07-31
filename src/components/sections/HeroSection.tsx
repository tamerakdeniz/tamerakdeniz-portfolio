'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  useAppStore,
  selectProjects,
  selectHomeHero,
  selectSkills,
} from '@/store';
import { AvailabilityBadge } from '@/components/ui/AvailabilityBadge';
import { CachedImage } from '@/components/ui/CachedImage';
import { MagneticButton } from '@/components/ui/InteractiveEffects';
import { TamerChat } from '@/components/ui/TamerChat';
import type { Project, Skill } from '@/types';

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

  return (
    <span className="relative inline-block" aria-label={text}>
      <span className="invisible whitespace-pre">{text}</span>
      <span className="absolute inset-0 whitespace-pre" aria-hidden="true">
        {display || text}
      </span>
    </span>
  );
}

function AnimatedCounter({
  target,
  suffix = '+',
  delay = 0,
}: {
  target: number;
  suffix?: string;
  delay?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    const duration = 1600;
    const steps = 48;
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

  return (
    <>
      {count}
      {suffix}
    </>
  );
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
    if (!started || words.length === 0) return;
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
    const speed = phase === 'pausing' ? 1700 : phase === 'deleting' ? 34 : 64;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, started, phase]);

  return (
    <span className="text-teal-700 dark:text-teal-300">
      {text}
      <motion.span
        className="inline-block w-[2px] h-[1em] bg-teal-600 dark:bg-teal-300 ml-0.5 align-middle"
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.53, repeat: Infinity, repeatType: 'reverse' }}
      />
    </span>
  );
}

function splitHeroTitle(fullTitle: string, fallbackA: string, fallbackB: string) {
  const words = fullTitle.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
  }
  if (words.length === 1) return [words[0], ''];
  return [fallbackA, fallbackB];
}

function getProjectTitle(project: Project, language: 'en' | 'tr') {
  return project.title?.[language] || project.title?.en || 'Untitled';
}

function getSkillName(skill: Skill) {
  return skill.name || skill.iconKey || 'tool';
}

function SignalMetric({
  icon,
  value,
  label,
  delay,
}: {
  icon: string;
  value: React.ReactNode;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-lg border border-slate-900/10 dark:border-white/10 bg-white/65 dark:bg-white/[0.035] p-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/70 to-transparent" />
      <span className="material-symbols-outlined mb-4 block text-[20px] text-coral-500">
        {icon}
      </span>
      <div className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">
        {value}
      </div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">
        {label}
      </div>
    </motion.div>
  );
}

function ProjectSignal({
  item,
  index,
  language,
}: {
  item: {
    title: string;
    stack: string[];
    image?: string;
    href?: string;
  };
  index: number;
  language: 'en' | 'tr';
}) {
  const content = (
    <motion.article
      className="group grid grid-cols-[64px_1fr_auto] items-center gap-3 rounded-lg border border-slate-900/10 dark:border-white/10 bg-white/70 dark:bg-white/[0.035] p-2 transition-all hover:border-teal-500/40 hover:bg-white/95 dark:hover:bg-white/[0.065]"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1 + index * 0.08, duration: 0.45 }}
    >
      <div className="relative h-14 overflow-hidden rounded-md bg-slate-100 dark:bg-black/30">
        {item.image ? (
          <CachedImage
            src={item.image}
            alt={item.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="material-symbols-outlined text-teal-500/70">deployed_code</span>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-sm font-bold text-slate-900 dark:text-white">
          {item.title}
        </h3>
        <p className="mt-1 truncate text-[11px] font-mono text-slate-500 dark:text-slate-500">
          {(item.stack.length ? item.stack : ['product', 'system']).slice(0, 3).join(' / ')}
        </p>
      </div>
      <span className="material-symbols-outlined text-[18px] text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-teal-500">
        {item.href ? 'arrow_forward' : 'radio_button_unchecked'}
      </span>
    </motion.article>
  );

  if (!item.href) return content;

  return (
    <Link href={item.href} aria-label={`${language === 'tr' ? 'Projeye git' : 'Open project'}: ${item.title}`}>
      {content}
    </Link>
  );
}

export function HeroSection() {
  const { t } = useTranslation();
  const heroSettings = useAppStore(selectHomeHero);
  const projects = useAppStore(selectProjects);
  const skills = useAppStore(selectSkills);
  const language = useAppStore((s) => s.language);
  const setContactModalOpen = useAppStore((s) => s.setContactModalOpen);
  const setCvModalOpen = useAppStore((s) => s.setCvModalOpen);

  const fullTitle = heroSettings.title?.[language] || heroSettings.title?.en || '';
  const [part1, part2] = splitHeroTitle(
    fullTitle,
    t('hero-title-1'),
    t('hero-title-2')
  );
  const heroDesc =
    heroSettings.description?.[language] || heroSettings.description?.en || t('hero-description');
  const moreLabel =
    heroSettings.moreLabel?.[language] || heroSettings.moreLabel?.en || t('hero-more-about');

  const publishedProjects = projects
    .filter((p) => p.published)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const visibleSkills = skills
    .filter((skill) => skill.published !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(0, 8);

  const yearsExp = Math.max(1, new Date().getFullYear() - 2021);
  const typewriterWords =
    visibleSkills.length > 0
      ? visibleSkills.slice(0, 5).map(getSkillName)
      : language === 'tr'
        ? ['LLM entegrasyonu', 'ürün mimarisi', 'hızlı prototip', 'otomasyon']
        : ['LLM integration', 'product architecture', 'rapid prototyping', 'automation'];

  const fallbackSignals =
    language === 'tr'
      ? [
          {
            title: 'Autonomous Tutor',
            stack: ['AI', 'öğrenme', 'ürün'],
            image: '/img/portfolio-logo/autonomous-tutor.png',
          },
          {
            title: 'FiyatIQ',
            stack: ['otomasyon', 'veri', 'web'],
            image: '/img/portfolio-logo/fiyatiq.png',
          },
          {
            title: 'Wxco Food',
            stack: ['mobil', 'sipariş', 'sistem'],
            image: '/img/portfolio-logo/wxcofood.png',
          },
        ]
      : [
          {
            title: 'Autonomous Tutor',
            stack: ['AI', 'learning', 'product'],
            image: '/img/portfolio-logo/autonomous-tutor.png',
          },
          {
            title: 'FiyatIQ',
            stack: ['automation', 'data', 'web'],
            image: '/img/portfolio-logo/fiyatiq.png',
          },
          {
            title: 'Wxco Food',
            stack: ['mobile', 'orders', 'system'],
            image: '/img/portfolio-logo/wxcofood.png',
          },
        ];

  const projectSignals =
    publishedProjects.length > 0
      ? publishedProjects.slice(0, 3).map((project) => ({
          title: getProjectTitle(project, language),
          stack: project.techStack || [],
          image: project.image,
          href: '/projects',
        }))
      : fallbackSignals;

  return (
    <section className="relative min-h-[calc(100dvh-4rem)] overflow-hidden bg-[#f6f8f2] text-slate-950 dark:bg-[#090d0d] dark:text-white">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 hero-grid opacity-80" />
        <div className="absolute inset-0 aurora-bg" />
        <div className="absolute inset-x-0 top-0 h-48 bg-[linear-gradient(180deg,rgba(20,184,166,0.16),transparent)] dark:bg-[linear-gradient(180deg,rgba(20,184,166,0.11),transparent)]" />
        <motion.div
          className="absolute left-[8%] top-0 h-full w-px bg-gradient-to-b from-transparent via-teal-400/30 to-transparent"
          animate={{ opacity: [0.15, 0.45, 0.15] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-[16%] top-0 h-full w-px bg-gradient-to-b from-transparent via-coral-400/25 to-transparent"
          animate={{ opacity: [0.1, 0.35, 0.1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8 lg:py-6">
        <div className="grid flex-1 items-center gap-6 lg:grid-cols-[minmax(0,1.04fr)_minmax(380px,0.96fr)] lg:gap-8">
          <div className="min-w-0">
            <motion.div
              className="flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AvailabilityBadge />
              <span className="rounded-md border border-slate-900/10 bg-white/65 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-400">
                {language === 'tr' ? 'İstanbul / AI ürün sistemleri' : 'Istanbul / AI product systems'}
              </span>
            </motion.div>

            <div className="relative mt-7 border-l border-slate-900/10 pl-4 dark:border-white/10 sm:pl-6">
              <span className="mb-3 block text-[11px] font-black uppercase tracking-[0.24em] text-coral-600 dark:text-coral-300">
                Tamer Akdeniz
              </span>
              <h1 className="max-w-4xl break-words text-5xl font-black leading-[0.95] tracking-normal text-slate-950 dark:text-white sm:text-6xl md:text-7xl xl:text-8xl">
                <motion.span
                  className="block"
                  initial={{ opacity: 0, y: 36, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                >
                  <ScrambleText text={part1} delay={0.25} />
                </motion.span>
                {part2 && (
                  <motion.span
                    className="block text-teal-700 dark:text-teal-300"
                    initial={{ opacity: 0, y: 36, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <ScrambleText text={part2} delay={0.45} />
                  </motion.span>
                )}
              </h1>
            </div>

            <motion.div
              className="mt-5 flex items-center gap-2 text-sm font-mono"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.5 }}
            >
              <span className="text-slate-400 select-none">{'>'}</span>
              <span className="text-slate-500 select-none">
                {language === 'tr' ? 'odak' : 'focus'}:
              </span>
              <TypewriterLoop words={typewriterWords} delay={1} />
            </motion.div>

            <motion.p
              className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.75 }}
            >
              {heroDesc}{' '}
              <Link
                href="/about"
                className="inline-flex items-baseline gap-1 text-teal-700 underline decoration-teal-500/30 underline-offset-4 transition-colors hover:text-coral-600 hover:decoration-coral-500 dark:text-teal-300 dark:hover:text-coral-300"
              >
                <span>{moreLabel}</span>
                <span className="material-symbols-outlined text-sm leading-none">arrow_forward</span>
              </Link>
            </motion.p>

            <motion.div
              className="mt-7 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.95 }}
            >
              <MagneticButton href="/projects">
                <div className="group relative flex h-12 items-center justify-center overflow-hidden rounded-lg bg-slate-950 px-5 text-sm font-bold text-white transition-all hover:bg-teal-700 active:scale-95 dark:bg-teal-300 dark:text-slate-950 dark:hover:bg-coral-300 sm:px-7">
                  <span className="material-symbols-outlined mr-2 text-[18px]">deployed_code</span>
                  <span>{t('btn-view-projects')}</span>
                  <span className="material-symbols-outlined ml-2 text-[18px] transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </div>
              </MagneticButton>

              <MagneticButton onClick={() => setContactModalOpen(true)}>
                <div className="flex h-12 items-center justify-center rounded-lg border border-slate-900/15 bg-white/75 px-5 text-sm font-bold text-slate-950 transition-all hover:border-coral-500/50 hover:bg-white active:scale-95 dark:border-white/10 dark:bg-white/[0.045] dark:text-white dark:hover:bg-white/[0.08] sm:px-7">
                  <span className="material-symbols-outlined mr-2 text-[18px] text-coral-500">forum</span>
                  {t('btn-contact')}
                </div>
              </MagneticButton>

              <MagneticButton onClick={() => setCvModalOpen(true)}>
                <div className="flex h-12 items-center justify-center rounded-lg border border-slate-900/15 bg-transparent px-5 text-sm font-semibold text-slate-700 transition-all hover:border-teal-500/50 hover:bg-teal-500/5 active:scale-95 dark:border-white/10 dark:text-slate-300 dark:hover:bg-teal-300/10 sm:px-7">
                  <span className="material-symbols-outlined mr-2 text-[18px]">download</span>
                  {t('btn-cv')}
                </div>
              </MagneticButton>
            </motion.div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <SignalMetric
                icon="timeline"
                value={<AnimatedCounter target={yearsExp} delay={1.05} />}
                label={language === 'tr' ? 'yıl üretim' : 'years building'}
                delay={1.05}
              />
              <SignalMetric
                icon="deployed_code"
                value={<AnimatedCounter target={publishedProjects.length} delay={1.15} />}
                label={language === 'tr' ? 'canlı iz' : 'shipped signals'}
                delay={1.15}
              />
              <SignalMetric
                icon="hub"
                value={<AnimatedCounter target={visibleSkills.length || 8} delay={1.25} />}
                label={language === 'tr' ? 'aktif araç' : 'active tools'}
                delay={1.25}
              />
            </div>
          </div>

          <div className="grid min-w-0 content-center gap-4">
            <motion.div
              className="relative h-[430px] overflow-hidden rounded-lg border border-slate-900/10 bg-white/75 p-4 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0d1111]/88 lg:h-[470px]"
              initial={{ opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ delay: 0.45, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(20,184,166,0.14),transparent_38%),linear-gradient(315deg,rgba(239,90,61,0.1),transparent_36%)]" />
              <div className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal-500 via-coral-400 to-amber-300" />
              <div className="relative h-full">
                <TamerChat />
              </div>
            </motion.div>

            <motion.div
              className="rounded-lg border border-slate-900/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/[0.035]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85, duration: 0.55 }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-xs font-black uppercase tracking-[0.18em] text-slate-600 dark:text-slate-400">
                  {language === 'tr' ? 'son üretim izleri' : 'recent build signals'}
                </h2>
                <Link
                  href="/projects"
                  className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-teal-500/10 hover:text-teal-600 dark:hover:text-teal-300"
                  aria-label={language === 'tr' ? 'Projeleri aç' : 'Open projects'}
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                </Link>
              </div>
              <div className="space-y-2">
                {projectSignals.map((item, index) => (
                  <ProjectSignal
                    key={`${item.title}-${index}`}
                    item={item}
                    index={index}
                    language={language}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
