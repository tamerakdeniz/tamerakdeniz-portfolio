'use client';

import { useMemo, useState } from 'react';
import { EDGES, NODES, ZONES, type ArchNode } from '@/lib/content/architecture';
import { COPY } from '@/lib/content/copy';
import { pick } from '@/lib/content/portfolio';
import { useLang } from '@/lib/lang';
import { T } from './T';
import s from './ArchitectureMap.module.css';

const W = 1000;
const H = 560;
const BOX_W = 190;
const BOX_H = 60;

function neighbours(id: string) {
  return EDGES.filter((e) => e.from === id || e.to === id).map((e) => {
    const other = NODES.find((n) => n.id === (e.from === id ? e.to : e.from))!;
    return { edge: e, other, outgoing: e.from === id };
  });
}

function Detail({ node, compact = false }: { node: ArchNode; compact?: boolean }) {
  const links = neighbours(node.id);
  return (
    <>
      {!compact && (
        <>
          <p className={`${s.zone} meta`}>
            <T v={ZONES.find((z) => z.id === node.zone)!.name} />
          </p>
          <h3 className={s.detailName}>
            <T v={node.name} />
          </h3>
        </>
      )}
      <p className={s.detailBody}>
        <T v={node.body} />
      </p>
      <div className={s.detailBlock}>
        <p className="meta">
          <T v={COPY.engineering.connects} />
        </p>
        <ul className={s.links}>
          {links.map(({ edge, other, outgoing }) => (
            <li key={edge.id}>
              <span aria-hidden="true">{outgoing ? '→' : '←'}</span> <T v={other.name} />{' '}
              <span className={s.linkLabel}>
                · <T v={edge.label} />
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className={s.detailBlock}>
        <p className="meta">
          <T v={COPY.engineering.inCode} />
        </p>
        <ul className={`${s.files} meta-plain`}>
          {node.files.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

/** Fig. 4.1: the site's own architecture. Nodes are buttons; selecting one lights its data paths. */
export function ArchitectureMap() {
  const lang = useLang();
  const [selected, setSelected] = useState('pages');
  const node = NODES.find((n) => n.id === selected)!;
  const active = useMemo(() => new Set(neighbours(selected).map((l) => l.edge.id)), [selected]);
  const near = useMemo(() => new Set(neighbours(selected).map((l) => l.other.id)), [selected]);

  return (
    <div className={s.root}>
      {/* Wide screens: the drawing plus a detail panel. */}
      <div className={s.wide}>
        <div className={s.board}>
          <div className={s.map}>
            <svg className={s.svg} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
              {ZONES.map((z, i) => (
                <g key={z.id}>
                  {i > 0 && <line className={s.divider} x1={(ZONES[i - 1].x + z.x) / 2} x2={(ZONES[i - 1].x + z.x) / 2} y1={0} y2={H} />}
                </g>
              ))}
              {EDGES.map((e) => {
                const d = 'M' + e.points.map(([x, y]) => `${x} ${y}`).join('L');
                const on = active.has(e.id);
                return (
                  <g key={e.id} className={on ? s.edgeOn : s.edge}>
                    <path className={s.edgeLine} d={d} />
                    {on && <path className={s.edgeFlow} d={d} />}
                    {on && (
                      <path
                        className={s.edgeHead}
                        d={`M${e.points[e.points.length - 1][0]} ${e.points[e.points.length - 1][1]}l-9 -5v10z`}
                      />
                    )}
                    {on && (
                      <text className={s.edgeLabel} x={e.at[0]} y={e.at[1]}>
                        <tspan data-l="en">{e.label.en}</tspan>
                        <tspan data-l="tr">{e.label.tr}</tspan>
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {ZONES.map((z) => (
              <p key={z.id} className={`${s.zoneLabel} meta`} style={{ left: `${(z.x / W) * 100}%` }} aria-hidden="true">
                <T v={z.name} />
              </p>
            ))}

            <ul className={s.nodes} aria-label={pick(COPY.engineering.mapTitle, lang)}>
              {NODES.map((n) => (
                <li
                  key={n.id}
                  className={s.nodeItem}
                  style={{
                    left: `${((n.x - BOX_W / 2) / W) * 100}%`,
                    top: `${((n.y - BOX_H / 2) / H) * 100}%`,
                    width: `${(BOX_W / W) * 100}%`,
                    height: `${(BOX_H / H) * 100}%`,
                  }}
                >
                  <button
                    type="button"
                    className={s.node}
                    data-zone={n.zone}
                    data-state={n.id === selected ? 'on' : near.has(n.id) ? 'near' : undefined}
                    aria-pressed={n.id === selected}
                    aria-controls="arch-detail"
                    onClick={() => setSelected(n.id)}
                    onFocus={() => setSelected(n.id)}
                    onMouseEnter={() => setSelected(n.id)}
                  >
                    <T v={n.name} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <p className={`${s.caption} meta-plain`}>
            <T v={COPY.engineering.mapTitle} />
          </p>
        </div>

        <div id="arch-detail" className={s.detail} aria-live="polite">
          <div key={node.id} className={s.detailInner}>
            <Detail node={node} />
          </div>
        </div>
      </div>

      {/* Narrow screens: the same parts as a readable list, grouped by where they run. */}
      <div className={s.narrow}>
        <p className={`${s.caption} meta-plain`}>
          <T v={COPY.engineering.mapTitle} />
        </p>
        {ZONES.map((z) => (
          <section key={z.id} className={s.group} aria-label={pick(z.name, lang)}>
            <p className={`${s.groupName} meta`}>
              <T v={z.name} />
            </p>
            <ul className={s.cards}>
              {NODES.filter((n) => n.zone === z.id).map((n) => (
                <li key={n.id} className={s.card}>
                  <details>
                    <summary className={s.summary}>
                      <span className={s.summaryName}>
                        <T v={n.name} />
                      </span>
                      <span className={s.summaryMark} aria-hidden="true" />
                    </summary>
                    <div className={s.cardBody}>
                      <Detail node={n} compact />
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
