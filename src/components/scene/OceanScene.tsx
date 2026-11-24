'use client';

import { useEffect, useRef } from 'react';
import { onSceneFrame, scene } from '@/lib/scene-state';
import { FRAGMENT, VERTEX } from './shaders';

const UNIFORMS = [
  'uRes',
  'uTime',
  'uDepth',
  'uWater',
  'uScroll',
  'uVel',
  'uPointer',
  'uEnergy',
  'uLayers',
  'uDpr',
] as const;

type Uniform = (typeof UNIFORMS)[number];

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

/**
 * The water column behind the home page: one canvas, one program, one draw per frame.
 * Rendered below CSS resolution (DPR capped at 1.5, scaled down further on slow frames),
 * throttled when idle and stopped when the tab is hidden. On any failure the CSS poster stays.
 */
export default function OceanScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = document.documentElement;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: true,
    });
    if (!gl) return;

    /* Compile and link without querying status, so drivers with parallel compile never block. */
    const parallel = gl.getExtension('KHR_parallel_shader_compile');
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    let buffer: WebGLBuffer | null = null;
    let u = {} as Record<Uniform, WebGLUniformLocation | null>;
    let ready = false;
    let failed = false;
    let off = () => {};

    const setup = () => {
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(gl.getShaderInfoLog(vs) || gl.getShaderInfoLog(fs) || gl.getProgramInfoLog(program));
        }
        failed = true;
        off();
        return;
      }
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(program, 'aPos');
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      u = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as Record<
        Uniform,
        WebGLUniformLocation | null
      >;
      ready = true;
    };

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    let quality = coarse ? 0.6 : 0.8;
    let layers = coarse ? 3 : 5;
    const dprCap = 1.5;
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, dprCap) * quality;
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (w === width && h === height) return;
      width = w;
      height = h;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let depth = scene.depth;
    let water = scene.water;
    let recover = 0;
    let lastRender = 0;
    let frames = 0;
    let slow = 0;
    let started = false;
    let t0 = 0;

    const render = () => {
      if (failed) return;
      if (!ready) {
        if (parallel && !gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) return;
        setup();
        if (!ready) return;
      }
      const now = performance.now();
      const idle = now - scene.lastInput > 2500;
      if (idle && now - lastRender < 32) return;
      const dt = lastRender ? now - lastRender : 16;
      lastRender = now;

      /* Adaptive quality: sustained slow frames lower the resolution and particle layers. */
      frames++;
      if (!idle && dt > 26 && dt < 200) slow++;
      if (frames % 90 === 0) {
        if (slow > 45 && quality > 0.45) {
          quality = Math.max(0.45, quality - 0.15);
          layers = Math.max(2, layers - 1);
          width = 0;
          resize();
        }
        slow = 0;
      }

      const previewing = scene.preview >= 0;
      const target = previewing ? scene.preview : scene.depth;
      depth += (target - depth) * (previewing ? 0.07 : 0.2);
      /* Outside a preview the waterline must match the hero text clip exactly, so it is not eased. */
      const waterTarget = previewing ? (scene.preview < 0.02 ? 0.46 : -0.2) : scene.water;
      if (previewing) recover = 24;
      if (recover > 0) {
        recover--;
        water += (waterTarget - water) * (previewing ? 0.14 : 0.25);
        if (!previewing && Math.abs(water - waterTarget) < 0.01) recover = 0;
      } else water = waterTarget;

      gl.uniform2f(u.uRes, width, height);
      if (!t0) t0 = now;
      gl.uniform1f(u.uTime, (now - t0) / 1000);
      gl.uniform1f(u.uDepth, depth);
      gl.uniform1f(u.uWater, water);
      gl.uniform1f(u.uScroll, scene.scroll);
      gl.uniform1f(u.uVel, scene.velocity);
      gl.uniform2f(u.uPointer, scene.pointer.x, scene.pointer.y);
      gl.uniform1f(u.uEnergy, scene.energy);
      gl.uniform1f(u.uLayers, layers);
      gl.uniform1f(u.uDpr, width / Math.max(1, canvas.clientWidth));
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      if (!started) {
        started = true;
        root.dataset.scene = 'on';
      }
    };

    off = onSceneFrame(render);

    const onLost = (e: Event) => {
      e.preventDefault();
      delete root.dataset.scene;
      off();
    };
    canvas.addEventListener('webglcontextlost', onLost);

    return () => {
      off();
      ro.disconnect();
      canvas.removeEventListener('webglcontextlost', onLost);
      delete root.dataset.scene;
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return <canvas ref={canvasRef} className="ocean-canvas" aria-hidden="true" />;
}
