import fs from 'fs/promises';
import path from 'path';

/**
 * Newsletter signup.
 *
 * Provider-agnostic on purpose: set one of the supported key pairs and
 * the right adapter is used. With nothing configured, signups are stored
 * in a local file during development so the form is testable, and refused
 * in production rather than silently dropped.
 *
 *   BUTTONDOWN_API_KEY
 *   CONVERTKIT_API_KEY + CONVERTKIT_FORM_ID
 *   RESEND_API_KEY + RESEND_AUDIENCE_ID
 */

export type SubscribeStatus = 'subscribed' | 'pending' | 'already';

export class NewsletterError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'NewsletterError';
  }
}

export type Provider = 'buttondown' | 'convertkit' | 'resend' | 'file' | 'none';

export function activeProvider(): Provider {
  if (process.env.BUTTONDOWN_API_KEY) return 'buttondown';
  if (process.env.CONVERTKIT_API_KEY && process.env.CONVERTKIT_FORM_ID) {
    return 'convertkit';
  }
  if (process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID) {
    return 'resend';
  }
  return process.env.NODE_ENV === 'production' ? 'none' : 'file';
}

export function isNewsletterConfigured(): boolean {
  return activeProvider() !== 'none';
}

/** RFC-lite check: enough to reject obvious rubbish, not to be clever. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 254;
}

export async function subscribe(email: string): Promise<SubscribeStatus> {
  switch (activeProvider()) {
    case 'buttondown':
      return subscribeButtondown(email);
    case 'convertkit':
      return subscribeConvertKit(email);
    case 'resend':
      return subscribeResend(email);
    case 'file':
      return subscribeToFile(email);
    default:
      throw new NewsletterError(
        'The newsletter is not configured on this deployment.',
        503
      );
  }
}

async function subscribeButtondown(email: string): Promise<SubscribeStatus> {
  const response = await fetch(
    'https://api.buttondown.email/v1/subscribers',
    {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email_address: email }),
    }
  );

  if (response.status === 201 || response.status === 200) return 'pending';
  if (response.status === 400) {
    const detail = await response.text();
    if (detail.includes('already')) return 'already';
  }

  throw new NewsletterError('Could not add that address.', 502);
}

async function subscribeConvertKit(email: string): Promise<SubscribeStatus> {
  const formId = process.env.CONVERTKIT_FORM_ID;
  const response = await fetch(
    `https://api.convertkit.com/v3/forms/${formId}/subscribe`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: process.env.CONVERTKIT_API_KEY,
        email,
      }),
    }
  );

  if (response.ok) return 'pending';
  throw new NewsletterError('Could not add that address.', 502);
}

async function subscribeResend(email: string): Promise<SubscribeStatus> {
  const response = await fetch(
    `https://api.resend.com/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    }
  );

  if (response.ok) return 'subscribed';
  throw new NewsletterError('Could not add that address.', 502);
}

/** Development fallback so the form can be exercised without a provider. */
async function subscribeToFile(email: string): Promise<SubscribeStatus> {
  const file = path.join(process.cwd(), '.data', 'subscribers.json');

  let existing: string[] = [];
  try {
    existing = JSON.parse(await fs.readFile(file, 'utf-8')) as string[];
  } catch {
    existing = [];
  }

  if (existing.includes(email)) return 'already';

  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify([...existing, email], null, 2));
  return 'subscribed';
}

/** Local subscriber list, for the back office. Empty for hosted providers. */
export async function localSubscribers(): Promise<string[]> {
  try {
    const file = path.join(process.cwd(), '.data', 'subscribers.json');
    return JSON.parse(await fs.readFile(file, 'utf-8')) as string[];
  } catch {
    return [];
  }
}
