/**
 * The round seal pressed onto the landing page's first screen: the name
 * around the rim, the running stamp count in the middle.
 */
export function HeroSeal({ name, stamps, className = '' }: { name: string; stamps: number; className?: string }) {
  const rim = `${name.toUpperCase()} ★ INTERNET PRODUCTS ★ `;
  const middle = stamps > 0 ? String(stamps) : 'NEW';
  const under = stamps === 1 ? 'STAMP' : 'STAMPS';

  return (
    <svg viewBox="0 0 220 220" className={`ink-red ${className}`} role="img" aria-label={`Passport seal: ${stamps} stamps`}>
      <defs>
        <path id="home-seal-rim" d="M110 110 m-84 0 a84 84 0 1 1 168 0 a84 84 0 1 1 -168 0" />
      </defs>
      <g filter="url(#pp-ink1)">
        <circle cx={110} cy={110} r={104} fill="none" stroke="currentColor" strokeWidth={6} />
        <circle cx={110} cy={110} r={96} fill="none" stroke="currentColor" strokeWidth={1.6} />
        <circle cx={110} cy={110} r={66} fill="none" stroke="currentColor" strokeWidth={1.6} strokeDasharray="2 4" />
        <text
          fontSize={14.5}
          fontWeight={800}
          letterSpacing={2.2}
          fill="currentColor"
          style={{ fontFamily: 'var(--font-stamp), Impact, sans-serif' }}
        >
          <textPath href="#home-seal-rim" textLength={520} lengthAdjust="spacing">
            {rim}
          </textPath>
        </text>
        <text
          x={110}
          y={middle.length > 2 ? 120 : 126}
          textAnchor="middle"
          fontWeight={900}
          fontSize={middle.length > 2 ? 38 : 56}
          fill="currentColor"
          style={{ fontFamily: 'var(--font-stamp), Impact, sans-serif' }}
        >
          {middle}
        </text>
        <text
          x={110}
          y={148}
          textAnchor="middle"
          fontSize={11}
          letterSpacing={3}
          fill="currentColor"
          style={{ fontFamily: 'var(--font-mono), monospace' }}
        >
          {stamps > 0 ? under : 'PASSPORT'}
        </text>
      </g>
    </svg>
  );
}
