import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { format, parseISO } from 'date-fns';
import { ThemeToggle } from '@/ui/common';
import type { Diary, DiaryBlock } from '@/lib/diary';
import { diaryFontVars } from '@/lib/diary-fonts';
import './diary.css';

/* ── Inline marks: [links](…), **bold**, _italic_, `code` ─────────── */

const INLINE = /\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|_([^_]+)_|`([^`]+)`/g;

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = m.index;
    if (m[1] !== undefined) {
      const href = m[2] ?? '#';
      const external = /^https?:/.test(href);
      out.push(
        external ? (
          <a key={key} href={href} rel="noreferrer" target="_blank">
            {m[1]}
          </a>
        ) : (
          <Link key={key} href={href}>
            {m[1]}
          </Link>
        ),
      );
    } else if (m[3] !== undefined) out.push(<strong key={key}>{m[3]}</strong>);
    else if (m[4] !== undefined) out.push(<em key={key}>{m[4]}</em>);
    else if (m[5] !== undefined) out.push(<code key={key}>{m[5]}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function Mark({ children }: { children: string }) {
  return (
    <span className="d-mark" aria-hidden="true">
      {children}
    </span>
  );
}

function prettyDate(value?: string, pattern = 'MMM d, yyyy'): string | undefined {
  if (!value) return undefined;
  try {
    return format(parseISO(value), pattern);
  } catch {
    return value;
  }
}

/* ── One block of the file ──────────────────────────────────────── */

function Block({ block, last }: { block: DiaryBlock; last: boolean }) {
  switch (block.kind) {
    case 'title':
      return <h2 className="d-h2 d-r">{inline(block.text)}</h2>;
    case 'h2':
      return (
        <h2 id={block.id} className="d-h2 d-r">
          <Mark>##</Mark>
          {inline(block.text)}
        </h2>
      );
    case 'h3': {
      const date = /^\d{4}-\d{2}-\d{2}$/.test(block.text);
      return (
        <h3 id={block.id} className={`d-h3 d-r${date ? ' d-h3--date' : ''}`}>
          <Mark>###</Mark>
          {date ? <time dateTime={block.text}>{prettyDate(block.text, 'EEEE, MMM d, yyyy')}</time> : inline(block.text)}
        </h3>
      );
    }
    case 'quote':
      return (
        <blockquote className="d-quote d-r">
          <Mark>&gt;</Mark>
          {inline(block.text)}
        </blockquote>
      );
    case 'list':
      return (
        <ul className="d-list">
          {block.items.map((item, i) => (
            <li key={i} className="d-r">
              <Mark>-</Mark>
              {inline(item)}
            </li>
          ))}
        </ul>
      );
    case 'rule':
      return (
        <p className="d-rule d-r" role="separator">
          * * *
        </p>
      );
    case 'para':
      return (
        <p className={`${last ? 'd-sign' : 'd-p'} d-r`}>
          {block.lines.map((line, i) => (
            <Fragment key={i}>
              {i > 0 && <br />}
              {inline(line)}
            </Fragment>
          ))}
        </p>
      );
  }
}

/* ── The page ───────────────────────────────────────────────────── */

export function DiaryPage({ diary, author }: { diary: Diary; author: string }) {
  const [word, ...rest] = diary.title.split('.');
  const ext = rest.length ? `.${rest.join('.')}` : '';
  const started = prettyDate(diary.started);

  return (
    <div className={`diary ${diaryFontVars}`}>
      <a href="#read" className="d-skip">
        Skip to the text
      </a>

      <header className="d-bar">
        <Link href="/" className="d-bar-name">
          {diary.title}
          <span className="d-dot" aria-hidden="true" />
        </Link>
        <nav className="d-bar-nav" aria-label="Site">
          <Link href="/passport">passport</Link>
          <ThemeToggle />
        </nav>
      </header>

      {/* ── Opening page ─────────────────────────────────────────── */}
      <section className="d-hero" aria-labelledby="d-title">
        <h1 id="d-title" className="d-word">
          {word}
          {ext && <span className="d-ext">{ext}</span>}
        </h1>

        <div className="d-hero-lines">
          {diary.intro.map((line, i) => (
            <p key={i} style={{ animationDelay: `${0.35 + i * 0.35}s` }}>
              <Mark>&gt;</Mark>
              {inline(line)}
            </p>
          ))}
        </div>

        <p className="d-byline">
          {author.toUpperCase()}
          {started && <> · STARTED {started.toUpperCase()}</>}
        </p>

        <a href="#read" className="d-scroll">
          scroll
        </a>
      </section>

      {/* ── The file ─────────────────────────────────────────────── */}
      <article id="read" className="d-file">
        <p className="d-filename">
          <span>{diary.title}</span>
          {diary.updated && <span>edited {prettyDate(diary.updated)}</span>}
        </p>

        <h2 className="d-title d-r">
          {diary.title}
          <span className="d-underline" aria-hidden="true">
            {'='.repeat(Math.max(diary.title.length, 3))}
          </span>
        </h2>

        {diary.blocks.map((block, i) => (
          <Block key={i} block={block} last={i === diary.blocks.length - 1} />
        ))}
      </article>

      <footer className="d-foot">
        <span>{diary.title}</span>
        <Link href="/passport">passport</Link>
        <a href="#d-title">back to top</a>
      </footer>
    </div>
  );
}
