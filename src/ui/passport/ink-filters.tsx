/**
 * Three ink textures. Each punches speckles out of the stamp (fine noise
 * as an alpha mask) and wobbles its edges (coarse displacement), so no
 * two stamps print alike. Render once per page.
 */
const variants = [
  { fine: 0.9, fineSeed: 3, coarse: 0.035, coarseSeed: 7, scale: 3, cut: 3.3 },
  { fine: 0.75, fineSeed: 11, coarse: 0.03, coarseSeed: 2, scale: 3.5, cut: 3.4 },
  { fine: 1.05, fineSeed: 23, coarse: 0.045, coarseSeed: 5, scale: 2.5, cut: 3.25 },
];

export function InkFilters() {
  return (
    <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}>
      <defs>
        {variants.map((v, i) => (
          <filter key={i} id={`pp-ink${i}`} x="-5%" y="-5%" width="110%" height="110%">
            <feTurbulence type="fractalNoise" baseFrequency={v.fine} numOctaves={2} seed={v.fineSeed} result="noise" />
            <feColorMatrix
              in="noise"
              type="matrix"
              values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -5 0 0 0 ${v.cut}`}
              result="mask"
            />
            <feComposite in="SourceGraphic" in2="mask" operator="in" result="speckled" />
            <feTurbulence type="fractalNoise" baseFrequency={v.coarse} numOctaves={2} seed={v.coarseSeed} result="wobble" />
            <feDisplacementMap in="speckled" in2="wobble" scale={v.scale} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        ))}
      </defs>
    </svg>
  );
}
