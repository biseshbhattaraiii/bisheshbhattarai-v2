/** Stable, URL-safe id for a heading, tag or title. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[`*_~[\]()]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Tag → URL form: "Cold Email" becomes "cold-email".
 *
 * Lives here rather than in the content adapter so client components can
 * build tag links without pulling the filesystem reader into the bundle.
 */
export const tagSlug = slugify;
