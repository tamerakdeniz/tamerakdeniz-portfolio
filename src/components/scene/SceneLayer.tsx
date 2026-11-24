'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { motionAllowed } from '@/lib/scene-state';
import { ScrollDirector } from './ScrollDirector';

const OceanScene = dynamic(() => import('./OceanScene'), { ssr: false });

function supportsWebGL2() {
  try {
    /* Software rasterisers (no GPU) would burn the main thread; they keep the poster. */
    return !!document.createElement('canvas').getContext('webgl2', { failIfMajorPerformanceCaveat: true });
  } catch {
    return false;
  }
}

/**
 * Home-page backdrop. The static poster is server-rendered and always present; the WebGL
 * water column is loaded only after hydration, when motion is allowed and WebGL2 exists.
 */
export function SceneLayer() {
  const [live, setLive] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setLive(motionAllowed() && supportsWebGL2());
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1));
    const handle = idle(sync);
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ['data-motion'] });
    mq.addEventListener('change', sync);
    return () => {
      if (window.cancelIdleCallback && typeof handle === 'number') window.cancelIdleCallback(handle);
      mo.disconnect();
      mq.removeEventListener('change', sync);
    };
  }, []);

  return (
    <>
      <ScrollDirector />
      <div className="ocean-layer" aria-hidden="true">
        <div className="ocean-poster" />
        {live && <OceanScene />}
      </div>
    </>
  );
}
