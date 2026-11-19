/**
 * A fixed-window limiter held in process memory.
 *
 * Good enough for a single-author portal: it blunts a brute-force attempt
 * and stops a runaway editor from burning API credit. It does not survive
 * a restart and is not shared between instances — if this ever runs on
 * more than one node, move it to a shared store.
 */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

export interface RateLimitResult {
  allowed: boolean;
  /** Seconds until the window resets. */
  retryAfter: number;
  remaining: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, retryAfter: 0, remaining: limit - 1 };
  }

  existing.count += 1;
  const retryAfter = Math.ceil((existing.resetAt - now) / 1000);

  // Opportunistic cleanup so the map can't grow without bound.
  if (windows.size > 500) {
    for (const [k, w] of windows) {
      if (w.resetAt <= now) windows.delete(k);
    }
  }

  return {
    allowed: existing.count <= limit,
    retryAfter,
    remaining: Math.max(0, limit - existing.count),
  };
}

/** Best-effort client identity for limiting. */
export function clientKey(request: Request, prefix: string): string {
  const forwarded = request.headers.get('x-forwarded-for') ?? '';
  const ip = forwarded.split(',')[0]?.trim() || 'local';
  return `${prefix}:${ip}`;
}
