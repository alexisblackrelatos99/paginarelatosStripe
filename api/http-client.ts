const DEFAULT_API_BASE_URL = 'http://localhost:8080';

function readEnvValue(name: 'VITE_API_BASE_URL'): string | undefined {
  return import.meta.env[name];
}

const rawBaseUrl = readEnvValue('VITE_API_BASE_URL')?.trim();

export const API_BASE_URL =
  (rawBaseUrl && rawBaseUrl.length > 0 ? rawBaseUrl : DEFAULT_API_BASE_URL).replace(/\/+$/, '');

export function resolveApiUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function extractErrorCode(payload: unknown, status: number): string {
  if (isRecord(payload) && typeof payload.code === 'string' && payload.code.trim().length > 0) {
    return payload.code;
  }

  return `HTTP_${status}`;
}

function toErrorMessage(code: string): string {
  return `API request failed (${code})`;
}

function toHeaders(inputHeaders: HeadersInit | undefined, hasBody: boolean): Headers {
  const headers = new Headers(inputHeaders);

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
}

async function parsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('Content-Type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly payload: unknown;

  constructor(options: { status: number; code: string; payload: unknown }) {
    super(toErrorMessage(options.code));
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.payload = options.payload;
  }
}

interface RequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: HeadersInit;
}

export async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const hasBody = options.body !== undefined && options.body !== null;
  const response = await fetch(resolveApiUrl(path), {
    ...options,
    headers: toHeaders(options.headers, hasBody),
    credentials: 'include',
  });

  const payload = await parsePayload(response);

  if (!response.ok) {
    throw new ApiError({
      status: response.status,
      code: extractErrorCode(payload, response.status),
      payload,
    });
  }

  return payload as T;
}

export async function requestVoid(path: string, options: RequestOptions = {}): Promise<void> {
  await requestJson<unknown>(path, options);
}
