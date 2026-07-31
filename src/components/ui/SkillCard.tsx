'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Skill } from '@/types';

export function SkillCard({
  skill,
  index,
}: {
  skill: Skill;
  index: number;
}) {
  const [svgHtml, setSvgHtml] = useState<string | null>(null);

  useEffect(() => {
    if (skill.iconKey && skill.iconKey !== 'material') {
      fetch(
        `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${skill.iconKey}.svg`
      )
        .then((r) => {
          if (!r.ok) throw new Error('Failed');
          return r.text();
        })
        .then((text) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(text, 'image/svg+xml');
          const svg = doc.querySelector('svg');
          if (svg) {
            svg.setAttribute('width', '40');
            svg.setAttribute('height', '40');
            svg.setAttribute('class', 'w-10 h-10');
            svg.style.fill = 'currentColor';
            svg.style.color = '#0f766e';
            setSvgHtml(svg.outerHTML);
          }
        })
        .catch(() => {});
    }
  }, [skill.iconKey]);

  const materialIconName =
    skill.name === 'Product Ownership'
      ? 'inventory_2'
      : skill.name === 'Data Analysis'
        ? 'analytics'
        : 'code';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.4, delay: index * 0.04 }}
      whileHover={{ scale: 1.04, y: -2 }}
      className="group flex min-h-[112px] cursor-default flex-col items-center justify-center rounded-lg border border-slate-900/10 bg-white/75 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.07)] backdrop-blur-sm transition-all hover:border-teal-500/30 hover:bg-white dark:border-white/10 dark:bg-white/[0.045] dark:hover:border-teal-300/25"
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md border border-teal-500/20 bg-teal-500/10 text-teal-700 transition-transform group-hover:scale-105 dark:text-teal-300">
        {skill.iconKey === 'material' ? (
          <span className="material-symbols-outlined text-3xl">
            {materialIconName}
          </span>
        ) : svgHtml ? (
          <div dangerouslySetInnerHTML={{ __html: svgHtml }} />
        ) : (
          <span className="material-symbols-outlined text-3xl">code</span>
        )}
      </div>
      <span className="text-center text-xs font-bold text-slate-800 dark:text-slate-200">{skill.name}</span>
    </motion.div>
  );
}
