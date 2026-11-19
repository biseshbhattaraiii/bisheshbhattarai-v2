'use client';

import { useEffect, useRef, useState } from 'react';
import type { DayLog } from '@/domain/types/passport';
import { formatNumber } from '@/lib/passport/format';

interface Point {
  day: number;
  alt: number;
  place: string;
}

function niceStep(span: number): number {
  if (span > 3000) return 1000;
  if (span > 1200) return 500;
  if (span > 500) return 250;
  return 100;
}

function Chart({ days, width }: { days: DayLog[]; width: number }) {
  const points: Point[] = days.flatMap((d, i) =>
    d.altitudeM != null ? [{ day: i, alt: d.altitudeM, place: d.place }] : []
  );
  const W = Math.max(300, Math.round(width));
  const H = W < 520 ? 200 : 240;
  const pad = { l: 54, r: 18, t: 28, b: 30 };
  const lo = Math.min(...points.map((p) => p.alt));
  const hi = Math.max(...points.map((p) => p.alt));
  const step = niceStep(hi - lo);
  const y0 = Math.max(0, Math.floor((lo - step * 0.3) / step) * step);
  const y1 = Math.ceil((hi + step * 0.25) / step) * step;
  const n = days.length;
  const X = (i: number) => pad.l + (n === 1 ? 0 : i / (n - 1)) * (W - pad.l - pad.r);
  const Y = (a: number) => pad.t + (1 - (a - y0) / (y1 - y0)) * (H - pad.t - pad.b);
  const ticks: number[] = [];
  for (let v = y0; v <= y1; v += step) ticks.push(v);
  const every = Math.ceil(n / Math.max(2, Math.floor((W - pad.l - pad.r) / 34)));
  const line = points.map((p, k) => `${k ? 'L' : 'M'}${X(p.day).toFixed(1)} ${Y(p.alt).toFixed(1)}`).join(' ');
  const first = points[0] as Point;
  const last = points[points.length - 1] as Point;
  const top = points.reduce<Point>((m, p) => (p.alt > m.alt ? p : m), first);
  const topX = X(top.day);
  const anchor = topX > W - 110 ? 'end' : topX < pad.l + 60 ? 'start' : 'middle';

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="pp-chart block h-auto w-full" role="img" aria-label={`Elevation by day, from ${formatNumber(lo)} to ${formatNumber(hi)} metres`}>
      {ticks.map((v) => (
        <g key={v}>
          <line className="grid" x1={pad.l} x2={W - pad.r} y1={Y(v)} y2={Y(v)} />
          <text x={pad.l - 8} y={Y(v) + 4} textAnchor="end">{formatNumber(v)}</text>
        </g>
      ))}
      {days.map((_, i) =>
        i % every === 0 || i === n - 1 ? (
          <text key={i} x={X(i)} y={H - 8} textAnchor="middle">D{i + 1}</text>
        ) : null
      )}
      <path className="area" d={`${line} L${X(last.day).toFixed(1)} ${Y(y0)} L${X(first.day).toFixed(1)} ${Y(y0)} Z`} />
      <path className="line" d={line} />
      {points.map((p) =>
        p === top ? null : (
          <circle key={p.day} className="dot" cx={X(p.day)} cy={Y(p.alt)} r={3.5}>
            <title>{`Day ${p.day + 1}: ${p.place} ${formatNumber(p.alt)} m`}</title>
          </circle>
        )
      )}
      <circle className="peak" cx={topX} cy={Y(top.alt)} r={6}>
        <title>{`Highest: ${formatNumber(top.alt)} m`}</title>
      </circle>
      <text className="peak-label" x={topX} y={Y(top.alt) - 12} textAnchor={anchor}>
        {`${formatNumber(top.alt)} M`}
      </text>
    </svg>
  );
}

/** Altitude by day, drawn at the container's real width so labels stay legible. */
export function ElevationProfile({ days }: { days: DayLog[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const observer = new ResizeObserver((items) => setWidth(items[0]?.contentRect.width ?? 720));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (days.filter((d) => d.altitudeM != null).length < 2) return null;

  return (
    <div ref={box} className="pp-panel px-2.5 pb-1.5 pt-3.5">
      <Chart days={days} width={width} />
    </div>
  );
}
