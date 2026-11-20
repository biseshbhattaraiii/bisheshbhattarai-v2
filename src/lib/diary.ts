import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';

/**
 * The diary is one markdown file, `content/diary.md`, edited by hand.
 *
 * It is parsed into a small set of blocks rather than rendered as HTML,
 * so the page can keep the markdown marks (#, >, *) visible: the site is
 * meant to read like the file itself.
 */

export type DiaryBlock =
  | { kind: 'title'; text: string }
  | { kind: 'h2'; text: string; id: string }
  | { kind: 'h3'; text: string; id: string }
  | { kind: 'quote'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'rule' }
  | { kind: 'para'; lines: string[] }
  /** A `{{name}}` line on its own: a live section the page fills in. */
  | { kind: 'slot'; name: string };

export interface Diary {
  title: string;
  started?: string;
  updated?: string;
  /** The `>` lines straight under the title. */
  intro: string[];
  blocks: DiaryBlock[];
}

const FILE = path.join(process.cwd(), 'content', 'diary.md');

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/** YAML turns a bare 2026-11-20 into a Date; keep it a plain string. */
function dateString(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return typeof value === 'string' ? value : undefined;
}

export function parseDiary(source: string): Diary {
  const { data, content } = matter(source);
  const lines = content.replace(/\r\n/g, '\n').split('\n');

  const blocks: DiaryBlock[] = [];
  let para: string[] = [];
  let list: string[] = [];

  const flush = () => {
    const slot = para.length === 1 ? /^\{\{\s*([a-z-]+)\s*\}\}$/.exec(para[0]!) : null;
    if (slot) blocks.push({ kind: 'slot', name: slot[1]! });
    else if (para.length) blocks.push({ kind: 'para', lines: para });
    if (list.length) blocks.push({ kind: 'list', items: list });
    para = [];
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flush();
      continue;
    }
    if (/^(\*\s*){3,}$|^-{3,}$/.test(trimmed)) {
      flush();
      blocks.push({ kind: 'rule' });
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flush();
      const level = heading[1]!.length;
      const text = heading[2]!;
      if (level === 1) blocks.push({ kind: 'title', text });
      else blocks.push({ kind: level === 2 ? 'h2' : 'h3', text, id: slug(text) });
      continue;
    }
    if (trimmed.startsWith('>')) {
      flush();
      blocks.push({ kind: 'quote', text: trimmed.replace(/^>\s?/, '') });
      continue;
    }
    const item = /^[-*]\s+(.*)$/.exec(trimmed);
    if (item) {
      if (para.length) flush();
      list.push(item[1]!);
      continue;
    }
    if (list.length) flush();
    para.push(trimmed);
  }
  flush();

  // The title and the quotes right under it become the opening page.
  let title = typeof data.title === 'string' ? data.title : 'diary.md';
  const intro: string[] = [];
  let i = 0;
  if (blocks[0]?.kind === 'title') {
    title = blocks[0].text;
    i = 1;
  }
  while (blocks[i]?.kind === 'quote') {
    intro.push((blocks[i] as { text: string }).text);
    i += 1;
  }

  return {
    title,
    started: dateString(data.started),
    updated: dateString(data.updated),
    intro,
    blocks: blocks.slice(i),
  };
}

export async function getDiary(): Promise<Diary> {
  return parseDiary(await fs.readFile(FILE, 'utf8'));
}
