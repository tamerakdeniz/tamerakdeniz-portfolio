import Image from 'next/image';
import type { AssetKind, Backplate } from '@/lib/content/assets';
import s from './AssetPlate.module.css';

/**
 * One way to present any visual evidence. Variants:
 * - logo: contained on a backplate matched to the file, never recoloured or cropped;
 * - photo: deliberate crop (object-position), cover;
 * - screenshot: contained, hairline frame, no device chrome;
 * - diagram: children (SVG) on paper.
 * Without a source, falls back to a typographic plate rather than an invented image.
 */
export function AssetPlate({
  kind,
  src,
  alt,
  plate = 'white',
  inset = 0.12,
  aspect = '4 / 3',
  sizes = '(min-width: 1024px) 30vw, 70vw',
  focus = '50% 50%',
  priority = false,
  eager = false,
  fallback,
  className,
  children,
}: {
  kind: AssetKind;
  src?: string | null;
  alt: string;
  plate?: Backplate;
  inset?: number;
  aspect?: string;
  sizes?: string;
  focus?: string;
  priority?: boolean;
  eager?: boolean;
  fallback?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const style = {
    '--aspect': aspect,
    '--inset': `${(inset * 100).toFixed(1)}%`,
    '--focus': focus,
  } as React.CSSProperties;

  return (
    <span className={`${s.plate} ${s[kind]} ${className ?? ''}`} data-plate={plate} style={style}>
      {kind === 'diagram' ? (
        <span className={s.diagram}>{children}</span>
      ) : src ? (
        <span className={s.media}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            priority={priority}
            loading={priority ? undefined : eager ? 'eager' : 'lazy'}
            className={s.img}
          />
        </span>
      ) : (
        <span className={s.fallback} role="img" aria-label={alt}>
          {fallback ?? '—'}
        </span>
      )}
    </span>
  );
}
