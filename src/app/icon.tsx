import { ImageResponse } from 'next/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/** Favicon: a plain monogram on the accent colour. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#c2412b',
          color: '#fcfbf9',
          fontSize: 22,
          fontWeight: 700,
          fontFamily: 'Georgia, serif',
          borderRadius: 6,
        }}
      >
        B
      </div>
    ),
    size
  );
}
