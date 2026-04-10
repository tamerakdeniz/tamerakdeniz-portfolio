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
            svg.style.color = '#135bec';
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
      whileHover={{ scale: 1.08, y: -2 }}
      className="group bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-gray-200/80 dark:border-slate-800/80 flex flex-col items-center justify-center hover:shadow-lg transition-all hover:border-primary/30 dark:hover:border-primary/30 cursor-default"
    >
      <div className="mb-2 flex items-center justify-center h-10 w-10 transition-transform group-hover:scale-110">
        {skill.iconKey === 'material' ? (
          <span className="material-symbols-outlined text-3xl text-primary">
            {materialIconName}
          </span>
        ) : svgHtml ? (
          <div dangerouslySetInnerHTML={{ __html: svgHtml }} />
        ) : (
          <span className="material-symbols-outlined text-3xl text-primary">code</span>
        )}
      </div>
      <span className="font-medium text-center text-xs">{skill.name}</span>
    </motion.div>
  );
}
