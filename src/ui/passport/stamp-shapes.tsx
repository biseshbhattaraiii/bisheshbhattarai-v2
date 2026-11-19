import type { ReactElement } from 'react';
import type { StampShape } from '@/domain/types/passport';

/** What a stamp prints, already measured and uppercased. */
export interface StampFace {
  id: string;
  name: string;
  nameSize: number;
  region: string;
  headline: string;
  date: string;
  dashed: boolean;
}

const display = { fontFamily: 'var(--font-stamp), Oswald, Impact, sans-serif' };
const mono = { fontFamily: 'var(--font-mono), ui-monospace, monospace' };

function Big({ y, size, children }: { y: number; size: number; children: string }) {
  return (
    <text x={100} y={y} textAnchor="middle" fontWeight={800} fontSize={size} fill="currentColor" letterSpacing={1.5} style={display}>
      {children}
    </text>
  );
}

function Small({ y, size = 10, children }: { y: number; size?: number; children: string }) {
  return (
    <text x={100} y={y} textAnchor="middle" fontWeight={500} fontSize={size} fill="currentColor" letterSpacing={1} style={mono}>
      {children}
    </text>
  );
}

function Mountain({ y, scale }: { y: number; scale: number }) {
  const s = scale;
  const d = `M${100 - 22 * s} ${y} L${100 - 8 * s} ${y - 18 * s} L${100 - 2 * s} ${y - 10 * s} L${100 + 6 * s} ${y - 22 * s} L${100 + 22 * s} ${y} Z`;
  return <path d={d} fill="currentColor" />;
}

/** Shrinks a line so it fits roughly `width` units at the given size. */
export function fitSize(text: string, base: number, width: number): number {
  return Math.min(base, width / Math.max(4, text.length * 0.6));
}

function Circle(f: StampFace, dash?: string) {
  return (
    <>
      <circle cx={100} cy={100} r={93} fill="none" stroke="currentColor" strokeWidth={5} strokeDasharray={dash} />
      <circle cx={100} cy={100} r={81} fill="none" stroke="currentColor" strokeWidth={1.6} strokeDasharray={dash} />
      <path id={`${f.id}-a`} d="M 36 100 A 64 64 0 0 1 164 100" fill="none" />
      <path id={`${f.id}-b`} d="M 24 100 A 76 76 0 0 0 176 100" fill="none" />
      <text fontWeight={800} fontSize={f.nameSize} fill="currentColor" letterSpacing={2} style={display}>
        <textPath href={`#${f.id}-a`} startOffset="50%" textAnchor="middle">{f.name}</textPath>
      </text>
      <text fontSize={9.5} fill="currentColor" letterSpacing={1.5} style={mono}>
        <textPath href={`#${f.id}-b`} startOffset="50%" textAnchor="middle">{f.region.slice(0, 26)}</textPath>
      </text>
      <Mountain y={98} scale={0.9} />
      <Big y={126} size={fitSize(f.headline, 24, 120)}>{f.headline}</Big>
      <line x1={62} y1={134} x2={138} y2={134} stroke="currentColor" strokeWidth={1.4} />
      <Small y={147} size={10.5}>{f.date}</Small>
    </>
  );
}

function Rect(f: StampFace, dash?: string) {
  return (
    <>
      <rect x={10} y={34} width={180} height={132} rx={6} fill="none" stroke="currentColor" strokeWidth={5} strokeDasharray={dash} />
      <rect x={19} y={43} width={162} height={114} rx={3} fill="none" stroke="currentColor" strokeWidth={1.5} strokeDasharray={dash} />
      <Small y={60}>{f.region.slice(0, 24) || 'ENTRY'}</Small>
      <Big y={86} size={fitSize(f.name, 22, 150)}>{f.name}</Big>
      <line x1={30} y1={96} x2={170} y2={96} stroke="currentColor" strokeWidth={1.2} />
      <Big y={124} size={fitSize(f.headline, 28, 150)}>{f.headline}</Big>
      <Small y={147} size={10.5}>{f.date}</Small>
    </>
  );
}

function hexPoints(r: number): string {
  return [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return `${(100 + r * Math.cos(a)).toFixed(1)},${(100 + r * Math.sin(a)).toFixed(1)}`;
    })
    .join(' ');
}

function Hex(f: StampFace, dash?: string) {
  return (
    <>
      <polygon points={hexPoints(94)} fill="none" stroke="currentColor" strokeWidth={5} strokeLinejoin="round" strokeDasharray={dash} />
      <polygon points={hexPoints(82)} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeDasharray={dash} />
      <Small y={52} size={9.5}>{f.region.slice(0, 18)}</Small>
      <Mountain y={80} scale={0.8} />
      <Big y={106} size={fitSize(f.name, 18, 130)}>{f.name}</Big>
      <Big y={134} size={fitSize(f.headline, 25, 120)}>{f.headline}</Big>
      <Small y={154}>{f.date}</Small>
    </>
  );
}

function Peak(f: StampFace, dash?: string) {
  return (
    <>
      <path d="M100 10 L192 168 L8 168 Z" fill="none" stroke="currentColor" strokeWidth={5} strokeLinejoin="round" strokeDasharray={dash} />
      <path d="M100 28 L177 160 L23 160 Z" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeDasharray={dash} />
      <path d="M86 56 L100 38 L114 56 L107 53 L100 60 L93 53 Z" fill="currentColor" />
      <Big y={104} size={fitSize(f.headline, 26, 90)}>{f.headline}</Big>
      <Big y={128} size={fitSize(f.name, 16, 120)}>{f.name}</Big>
      <Small y={150}>{f.date}</Small>
      <Small y={186} size={9}>{f.region.slice(0, 26)}</Small>
    </>
  );
}

function Oval(f: StampFace, dash?: string) {
  return (
    <>
      <ellipse cx={100} cy={100} rx={94} ry={70} fill="none" stroke="currentColor" strokeWidth={5} strokeDasharray={dash} />
      <ellipse cx={100} cy={100} rx={84} ry={60} fill="none" stroke="currentColor" strokeWidth={1.5} strokeDasharray={dash} />
      <Small y={66} size={9.5}>{f.region.slice(0, 22)}</Small>
      <Big y={92} size={fitSize(f.name, 20, 140)}>{f.name}</Big>
      <Big y={122} size={fitSize(f.headline, 27, 130)}>{f.headline}</Big>
      <Small y={142}>{f.date}</Small>
    </>
  );
}

const renderers: Record<StampShape, (f: StampFace, dash?: string) => ReactElement> = {
  circle: Circle,
  rect: Rect,
  hex: Hex,
  peak: Peak,
  oval: Oval,
};

export function StampBody({ shape, face }: { shape: StampShape; face: StampFace }) {
  return renderers[shape](face, face.dashed ? '7 6' : undefined);
}
