'use client';

import { useState, useEffect } from 'react';
import { isMediaCached, prefetchMediaUrl } from '@/lib/prefetch-media';

type CachedImageProps = {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
};

export function CachedImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  fetchPriority,
}: CachedImageProps) {
  const [ready, setReady] = useState(() => isMediaCached(src));

  useEffect(() => {
    if (!src) return;
    if (isMediaCached(src)) {
      setReady(true);
      return;
    }
    prefetchMediaUrl(src);
    setReady(false);
  }, [src]);

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      onLoad={() => setReady(true)}
      className={`${className} transition-opacity duration-200 ${ready ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}
