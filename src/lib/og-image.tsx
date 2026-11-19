import { ImageResponse } from 'next/og';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

const BACKGROUND = '#fcfbf9';
const FOREGROUND = '#18181b';
const SECONDARY = '#5c5c62';
const ACCENT = '#c2412b';

interface OgImageInput {
  /** Small label above the title — a folder name, a section. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Bottom-left byline. */
  footer: string;
  /** Bottom-right note — a date, a reading time. */
  note?: string;
}

/**
 * Social card.
 *
 * Satori is strict: every container holding more than one child declares
 * `display: flex`, and there are no shorthand gradients or web fonts.
 */
export function renderOgImage({
  eyebrow,
  title,
  subtitle,
  footer,
  note,
}: OgImageInput) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          backgroundColor: BACKGROUND,
          color: FOREGROUND,
          fontFamily: 'Georgia, serif',
        }}
      >
        {/* Accent rule along the top edge */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 10,
            backgroundColor: ACCENT,
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {eyebrow && (
            <div
              style={{
                fontSize: 22,
                letterSpacing: 6,
                textTransform: 'uppercase',
                color: ACCENT,
                marginBottom: 28,
              }}
            >
              {eyebrow}
            </div>
          )}
          <div
            style={{
              fontSize: title.length > 70 ? 56 : 70,
              lineHeight: 1.14,
              letterSpacing: -1.5,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                marginTop: 26,
                fontSize: 27,
                lineHeight: 1.4,
                color: SECONDARY,
                maxWidth: 900,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 22,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: SECONDARY,
          }}
        >
          <div style={{ display: 'flex' }}>{footer}</div>
          {note && <div style={{ display: 'flex' }}>{note}</div>}
        </div>
      </div>
    ),
    ogSize
  );
}
