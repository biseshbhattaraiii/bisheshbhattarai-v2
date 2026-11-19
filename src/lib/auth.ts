/**
 * Admin session handling.
 *
 * One password, one signed cookie. The token is an HMAC-SHA256 over a
 * tiny JSON payload, built with Web Crypto so the same code runs in the
 * edge middleware and in Node route handlers.
 *
 * Required environment:
 *   ADMIN_PASSWORD         the portal password
 *   ADMIN_SESSION_SECRET   optional; defaults to a key derived from the
 *                          password, so rotating the password also
 *                          invalidates every outstanding session
 */

export const SESSION_COOKIE = 'nb_admin';
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const encoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded.padEnd(Math.ceil(padded.length / 4) * 4, '='));
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function signingKey(): Promise<CryptoKey> {
  const secret =
    process.env.ADMIN_SESSION_SECRET ||
    `derived:${process.env.ADMIN_PASSWORD ?? ''}`;

  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/** Constant-time string comparison — never `===` on a secret. */
export function safeEqual(a: string, b: string): boolean {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  // Compare a fixed number of bytes so length alone doesn't leak via timing.
  const length = Math.max(left.length, right.length);
  let mismatch = left.length ^ right.length;
  for (let i = 0; i < length; i += 1) {
    mismatch |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return mismatch === 0;
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export async function verifyPassword(candidate: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(candidate, expected);
}

export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  });

  const body = base64UrlEncode(encoder.encode(payload));
  const signature = await crypto.subtle.sign(
    'HMAC',
    await signingKey(),
    encoder.encode(body)
  );

  return `${body}.${base64UrlEncode(new Uint8Array(signature))}`;
}

export async function verifySessionToken(
  token: string | undefined
): Promise<boolean> {
  if (!token) return false;

  const [body, signature] = token.split('.');
  if (!body || !signature) return false;

  const valid = await crypto.subtle.verify(
    'HMAC',
    await signingKey(),
    base64UrlDecode(signature),
    encoder.encode(body)
  );
  if (!valid) return false;

  try {
    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(body))
    ) as { exp?: number };
    return typeof payload.exp === 'number' && payload.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}
