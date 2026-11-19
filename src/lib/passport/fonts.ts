import { Big_Shoulders, Caveat } from 'next/font/google';

// Rubber-stamp lettering: condensed, heavy, uppercase.
export const fontStamp = Big_Shoulders({
  subsets: ['latin'],
  weight: ['600', '800', '900'],
  display: 'swap',
  variable: '--font-stamp',
});

// Handwriting for reflections, captions and the motto.
export const fontHand = Caveat({
  subsets: ['latin'],
  weight: ['500', '700'],
  display: 'swap',
  variable: '--font-hand',
});

export const passportFontVars = `${fontStamp.variable} ${fontHand.variable}`;
