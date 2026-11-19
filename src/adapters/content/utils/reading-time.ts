const WORDS_PER_MINUTE = 200;

export function countWords(content: string): number {
  // Strip fenced code and inline code so a long snippet doesn't inflate
  // the estimate — readers skim code, they don't read it at 200 wpm.
  const prose = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .trim();

  if (!prose) return 0;
  return prose.split(/\s+/).length;
}

export function calculateReadingTime(content: string): number {
  const words = countWords(content);
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
