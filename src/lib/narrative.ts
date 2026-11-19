/**
 * The story on the home page.
 *
 * Prose, not MDX — it changes rarely and deserves to be edited by hand.
 * Deliberately free of client names and product names: this site is the
 * running log of the work, not a portfolio.
 *
 * Anything in [[double brackets]] is a placeholder to confirm or replace.
 */

export interface Principle {
  title: string;
  body: string;
}

export const hero = {
  headline: 'I build internet products',
  location: '[[Melbourne, Australia]]',
};

/** One short paragraph. Read it aloud; if it sounds like a CV, cut it. */
export const story: string[] = [
  'I build products and write down what actually happens: the pricing I got wrong, the launch that landed flat, the week nothing shipped, and the small changes that quietly moved the numbers.',
];

/** How I work. */
export const principles: Principle[] = [
  {
    title: 'Ship weekly, in public.',
    body: 'A week without something shipped is a week I have to explain here. That pressure is the whole point: it keeps the work moving and keeps me honest about what actually got done.',
  },
  {
    title: 'Start with the person, not the feature.',
    body: 'Before anything gets built I want to know who opens this, what they are afraid of getting wrong, and what “finished” looks like on their desk. Most bad software is a good answer to the wrong question.',
  },
  {
    title: 'Boring beats clever.',
    body: 'The best compliment a product gets is that nobody talks about it. I would rather ship something obvious that works every day than something impressive that needs explaining.',
  },
  {
    title: 'Show the numbers, not just the wins.',
    body: 'Revenue, churn, the cost of running it, the months that went sideways. Selective honesty is just marketing with extra steps.',
  },
];

/** Short, hard-won lines. */
export const learnings: string[] = [
  'The hardest part of building is deciding what not to build.',
  'A tool that saves someone ten minutes a day outlasts a launch that wins a room.',
  'Speed comes from clear decisions, not from cutting corners.',
];

export const now = {
  updated: 'August 2026',
  lines: [
    'Taking on a small number of client builds.',
    'Building and selling my own SaaS products, documented week by week.',
  ],
};
