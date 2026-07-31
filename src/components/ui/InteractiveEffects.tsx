'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CursorGlow() {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    if (!mq.matches) return;

    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };
    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    window.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseenter', handleEnter);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseenter', handleEnter);
    };
  }, [visible]);

  return (
    <div
      className="cursor-glow"
      style={{ left: pos.x, top: pos.y, opacity: visible ? 1 : 0 }}
    />
  );
}

export function MagneticButton({
  children,
  className = '',
  onClick,
  href,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 20 });
  const springY = useSpring(y, { stiffness: 200, damping: 20 });

  const handleMouse = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * 0.3);
    y.set((e.clientY - cy) * 0.3);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  const content = (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY, willChange: 'transform' }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      className={`inline-block ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export function PageBackground({ intensity = 'normal' }: { intensity?: 'subtle' | 'normal' }) {
  const opacity = intensity === 'subtle' ? 0.5 : 1;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" style={{ opacity }}>
      <div className="absolute inset-0 hero-grid" />
      <div className="absolute inset-0 aurora-bg" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(20,184,166,0.14),transparent)] dark:bg-[linear-gradient(180deg,rgba(20,184,166,0.08),transparent)]" />
      <motion.div
        className="absolute left-[12%] top-0 h-full w-px bg-gradient-to-b from-transparent via-teal-400/30 to-transparent"
        animate={{ opacity: [0.12, 0.36, 0.12] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-[18%] top-0 h-full w-px bg-gradient-to-b from-transparent via-coral-400/25 to-transparent"
        animate={{ opacity: [0.1, 0.28, 0.1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className="mx-auto mb-12 max-w-4xl text-center sm:mb-16"
      initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay }}
    >
      <motion.div
        className="mx-auto mb-4 h-1 w-16 bg-gradient-to-r from-teal-500 via-coral-400 to-amber-300"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.05 }}
      />
      <motion.h2
        className="text-4xl font-black tracking-normal text-slate-950 dark:text-white md:text-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: delay + 0.1 }}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-400 sm:text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: delay + 0.4 }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}

export function GlassCard({
  children,
  className = '',
  delay = 0,
  hoverEffect = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hoverEffect?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-lg border border-slate-900/10 bg-white/75 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.045] ${hoverEffect ? 'transition-all duration-300 hover:border-teal-500/30 hover:shadow-xl dark:hover:border-teal-300/25' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
