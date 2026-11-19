'use client';

import { useEffect, useRef } from 'react';

function draw(canvas: HTMLCanvasElement) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  ctx.strokeStyle = getComputedStyle(canvas).getPropertyValue('--pp-guil').trim() || '#3f8574';
  ctx.lineWidth = 0.7;

  ctx.globalAlpha = 0.13;
  for (let k = 0; k < 46; k += 1) {
    ctx.beginPath();
    for (let x = -10; x <= w + 10; x += 5) {
      const y =
        h * 0.5 +
        Math.sin(x * 0.006 + k * 0.14) * h * 0.32 +
        Math.sin(x * 0.021 + k * 0.5) * 22 +
        Math.cos(x * 0.0023 - k * 0.09) * 60;
      if (x === -10) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 0.08;
  const cx = w * 0.82;
  const cy = h * 0.3;
  for (let k = 0; k < 28; k += 1) {
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.02) {
      const r = 90 + k * 7 + Math.sin(a * 12 + k * 0.3) * 10;
      ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
    ctx.stroke();
  }
}

/**
 * Security-paper linework behind every passport page, redrawn on resize
 * and when the theme class changes.
 */
export function Guilloche() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let timer: ReturnType<typeof setTimeout>;
    const redraw = () => {
      clearTimeout(timer);
      timer = setTimeout(() => draw(canvas), 120);
    };
    draw(canvas);
    window.addEventListener('resize', redraw);
    const observer = new MutationObserver(redraw);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', redraw);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="pp-guilloche" aria-hidden="true" />;
}
