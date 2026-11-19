interface YouTubeProps {
  /** The video id, e.g. dQw4w9WgXcQ. */
  id: string;
  title?: string;
}

/**
 * A YouTube embed that doesn't load YouTube.
 *
 * The iframe is wrapped in a `<details>` so nothing from Google is
 * requested until the reader opens it — no third-party scripts or cookies
 * on page load, and no layout shift. The thumbnail comes from YouTube's
 * image host only once opened.
 */
export function YouTube({ id, title = 'Watch on YouTube' }: YouTubeProps) {
  if (!id || id.includes('[[')) return null;

  return (
    <details className="not-prose my-8 overflow-hidden rounded-lg border border-border bg-muted">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-medium">
        <span>{title}</span>
        <span className="text-secondary">Play ▸</span>
      </summary>
      <div className="relative aspect-video w-full border-t border-border">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={title}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </details>
  );
}
