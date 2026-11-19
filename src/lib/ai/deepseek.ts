/**
 * Minimal DeepSeek chat client.
 *
 * Deliberately not an SDK: one endpoint, one shape, no extra dependency.
 * The key never leaves the server — every call goes through a route
 * handler that sits behind the admin session.
 */

const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_MODEL = 'deepseek-chat';

export class DeepSeekError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = 'DeepSeekError';
  }
}

export function isDeepSeekConfigured(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatOptions {
  messages: ChatMessage[];
  /** Low by default: proofreading should be boring and repeatable. */
  temperature?: number;
  maxTokens?: number;
  /** Ask the API to guarantee syntactically valid JSON. */
  json?: boolean;
  signal?: AbortSignal;
}

export async function chat({
  messages,
  temperature = 0,
  maxTokens = 2048,
  json = false,
  signal,
}: ChatOptions): Promise<string> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new DeepSeekError('DEEPSEEK_API_KEY is not set.', 503);
  }

  const baseUrl = (
    process.env.DEEPSEEK_BASE_URL ?? DEFAULT_BASE_URL
  ).replace(/\/$/, '');

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
    signal,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new DeepSeekError(
      `DeepSeek request failed (${response.status}). ${detail.slice(0, 200)}`,
      response.status === 401 ? 502 : 502
    );
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new DeepSeekError('DeepSeek returned an empty response.', 502);
  }

  return content;
}
