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
      style={{ x: springX, y: springY }}
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
    <div className="fixed inset-0 pointer-events-none z-0" style={{ opacity }}>
      <div className="absolute inset-0 hero-grid" />
      <div className="absolute inset-0 aurora-bg" />
      <motion.div
        className="absolute top-20 -right-20 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-[130px]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
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
      className="text-center mb-12 sm:mb-16"
      initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, delay }}
    >
      <motion.h2
        className="text-4xl md:text-5xl font-bold mb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: delay + 0.1 }}
      >
        {title}
      </motion.h2>
      <motion.div
        className="flex items-center justify-center gap-3 mb-4"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.3 }}
      >
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/60" />
        <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/60" />
      </motion.div>
      {subtitle && (
        <motion.p
          className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
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
      className={`bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/80 dark:border-slate-800/80 ${hoverEffect ? 'hover:shadow-xl hover:border-primary/20 dark:hover:border-primary/20 transition-all duration-300' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
