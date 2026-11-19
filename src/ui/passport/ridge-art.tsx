import { hashString } from '@/lib/passport/format';

const skies = [
  ['#5a3f6e', '#e2836b', '#f3c98b'],
  ['#3e5f7c', '#8fb7d1', '#cfe3ee'],
  ['#7b4e5d', '#d9a37a', '#f6e3c4'],
  ['#244a4b', '#6f9f9a', '#bcd7d0'],
];

/** Small seeded random generator (mulberry32). */
function random(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ridge(r: () => number, base: number, amp: number, jitter: number): string {
  let y = base - r() * amp;
  let d = `M0 300 L0 ${y.toFixed(0)}`;
  for (let x = 10; x <= 400; x += 10) {
    y = Math.max(base - amp, Math.min(base + 15, y + (r() - 0.5) * jitter));
    d += ` L${x} ${y.toFixed(0)}`;
  }
  return `${d} L400 300 Z`;
}

/** A seeded mountain silhouette, used where an entry has no photo yet. */
export function RidgeArt({ seed, className, label }: { seed: string; className?: string; label?: string }) {
  const h = hashString(seed);
  const r = random(h);
  const sky = skies[h % skies.length] ?? ['#3e5f7c', '#8fb7d1', '#cfe3ee'];
  const id = `sky-${h.toString(36)}`;
  const layers = [0, 1, 2, 3, 4];

  return (
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={className} role={label ? 'img' : undefined} aria-label={label || undefined} aria-hidden={label ? undefined : true}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="0.55" stopColor={sky[1]} />
          <stop offset="1" stopColor={sky[2]} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${id})`} />
      <circle cx={80 + r() * 240} cy={70 + r() * 45} r={13 + r() * 9} fill="rgba(255,246,225,.85)" />
      {layers.map((i) => {
        const k = i / 4;
        const c = `rgba(${Math.round(30 + 40 * (1 - k))},${Math.round(45 + 40 * (1 - k))},${Math.round(60 + 50 * (1 - k))},${(0.35 + 0.65 * k).toFixed(2)})`;
        return <path key={i} d={ridge(r, 130 + i * 35, 75 - i * 11, 30 - i * 4)} fill={c} />;
      })}
    </svg>
  );
}
