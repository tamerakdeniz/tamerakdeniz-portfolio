import s from './Submerge.module.css';

/**
 * Text that sits across the waterline: the accessible copy is drawn below the cut in paper,
 * an aria-hidden ink copy above it. `--cut` (px from the element's top) is set by the
 * ScrollDirector; `cut` is the server-rendered default for no-JS and reduced motion.
 */
export function Submerge({
  children,
  className,
  cut = '120%',
  shift = 0,
}: {
  children: React.ReactNode;
  className?: string;
  cut?: string;
  /** Fraction of the viewport this element rises per unit of hero progress (parallax). */
  shift?: number;
}) {
  return (
    <span
      className={`${s.sub} ${className ?? ''}`}
      data-cut
      data-cut-shift={shift || undefined}
      style={{ '--cut0': cut, '--shift': shift } as React.CSSProperties}
    >
      <span className={s.under}>{children}</span>
      <span className={s.over} aria-hidden="true">
        {children}
      </span>
    </span>
  );
}
