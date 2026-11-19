import { z } from 'zod';
import { chat, DeepSeekError } from './deepseek';

/**
 * Grammar assist.
 *
 * The contract with the model is narrow on purpose: fix mechanical
 * mistakes, leave the writing alone. It does not rewrite sentences for
 * style, does not shorten, does not add ideas, and does not touch code,
 * frontmatter, links or headings. Everything it returns is a *suggestion*
 * the author applies one at a time.
 */

export const MAX_INPUT_CHARS = 12_000;

export const suggestionTypes = [
  'spelling',
  'grammar',
  'punctuation',
  'agreement',
  'tense',
  'word-choice',
] as const;

export type SuggestionType = (typeof suggestionTypes)[number];

export interface Suggestion {
  id: string;
  /** The exact span as the author wrote it. */
  original: string;
  /** The corrected span. */
  suggestion: string;
  type: SuggestionType;
  /** One short line explaining the fix. */
  note: string;
  /** Character offset in the submitted text, or -1 if it couldn't be located. */
  start: number;
  /** True when the same span occurs more than once — applying is ambiguous. */
  ambiguous: boolean;
}

const modelSuggestionSchema = z.object({
  original: z.string().min(1),
  suggestion: z.string(),
  type: z.enum(suggestionTypes).catch('grammar'),
  note: z.string().default(''),
});

const modelResponseSchema = z.object({
  suggestions: z.array(modelSuggestionSchema).default([]),
});

const SYSTEM_PROMPT = `You are a careful copy editor for a personal engineering notebook.

Your ONLY job is to catch mechanical English mistakes:
- spelling and typos
- subject-verb agreement
- verb tense consistency within a sentence
- articles (a/an/the) and plurals
- punctuation: missing or misused commas, apostrophes, full stops, capitalisation
- obviously wrong word choice (their/there, its/it's, affect/effect)

You must NOT:
- rewrite sentences for style, tone, concision or flow
- change the author's voice, vocabulary or structure
- reorder or merge sentences
- add, remove or summarise ideas
- "improve" anything that is already correct
- touch code blocks, inline code, URLs, file paths, YAML frontmatter,
  markdown syntax, headings or names

The author writes British/Australian English. Do not convert spellings to
American English. Do not flag informal but correct writing, sentence
fragments used deliberately, or em dashes.

If a passage is already correct, return an empty list. Returning nothing is
a good outcome.

Respond with JSON only, in this exact shape:
{"suggestions":[{"original":"<the exact text span as written, copied character for character>","suggestion":"<the corrected span>","type":"spelling|grammar|punctuation|agreement|tense|word-choice","note":"<max 12 words explaining the fix>"}]}

Rules for spans:
- "original" MUST appear verbatim in the author's text.
- Keep spans short: the smallest phrase that contains the error, never a
  whole paragraph.
- Never return a span where "original" and "suggestion" are identical.`;

export interface ProofreadResult {
  suggestions: Suggestion[];
  /** True when the text was truncated before being sent. */
  truncated: boolean;
}

export async function proofread(
  text: string,
  signal?: AbortSignal
): Promise<ProofreadResult> {
  const truncated = text.length > MAX_INPUT_CHARS;
  const input = truncated ? text.slice(0, MAX_INPUT_CHARS) : text;

  const raw = await chat({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Proofread the text between the markers. Return JSON only.\n\n<<<TEXT\n${input}\nTEXT>>>`,
      },
    ],
    json: true,
    temperature: 0,
    signal,
  });

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new DeepSeekError('The model returned malformed JSON.', 502);
  }

  const result = modelResponseSchema.safeParse(parsed);
  if (!result.success) {
    throw new DeepSeekError('The model returned an unexpected shape.', 502);
  }

  const suggestions = result.data.suggestions
    // A suggestion that changes nothing is noise.
    .filter((s) => s.original !== s.suggestion)
    .map((s, index): Suggestion => {
      const start = input.indexOf(s.original);
      const ambiguous =
        start !== -1 && input.indexOf(s.original, start + 1) !== -1;

      return {
        id: `${index}-${start}`,
        original: s.original,
        suggestion: s.suggestion,
        type: s.type,
        note: s.note,
        start,
        ambiguous,
      };
    })
    // Drop hallucinated spans that aren't actually in the text.
    .filter((s) => s.start !== -1)
    .sort((a, b) => a.start - b.start);

  return { suggestions, truncated };
}
