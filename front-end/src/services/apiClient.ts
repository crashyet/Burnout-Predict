/**
 * apiClient.ts
 * Centralized HTTP client for all backend API requests.
 *
 * Usage:
 *   import { apiClient } from './apiClient'
 *   const data = await apiClient.get<MyType>('/some/endpoint')
 *   const result = await apiClient.post<ResponseType>('/some/endpoint', payload)
 *
 * Auth token is automatically read from localStorage and attached as
 *   Authorization: Bearer <token>
 * if available.
 *
 * Timeout: requests will abort after TIMEOUT_MS milliseconds.
 */

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ??
  'http://localhost:5000/api/v1'

const TIMEOUT_MS = 15_000

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken(): string | null {
  // Reads token from session saved by authService
  try {
    const sessionStr = localStorage.getItem('current_session')
    if (!sessionStr) return null
    const session = JSON.parse(sessionStr) as { token?: string }
    return session.token ?? null
  } catch {
    return null
  }
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  }
  return headers
}

// ─── Error Handling ───────────────────────────────────────────────────────────

export interface ApiError extends Error {
  readonly status: number
  readonly body?: unknown
}

export function createApiError(status: number, message: string, body?: unknown): ApiError {
  const err = new Error(message) as ApiError
  ;(err as { status: number }).status = status
  ;(err as { body: unknown }).body = body
  err.name = 'ApiError'
  return err
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof Error && err.name === 'ApiError'
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') ?? ''
  if (!response.ok) {
    let errorBody: unknown
    try {
      errorBody = contentType.includes('application/json')
        ? await response.json()
        : await response.text()
    } catch {
      errorBody = null
    }
    throw createApiError(response.status, `HTTP ${response.status}: ${response.statusText}`, errorBody)
  }
  if (response.status === 204) return undefined as T
  if (contentType.includes('application/json')) return response.json() as Promise<T>
  return response.text() as unknown as T
}

function withTimeout(promise: Promise<Response>, ms: number): Promise<Response> {
  const controller = new AbortController()
  const id = window.setTimeout(() => controller.abort(), ms)
  return promise.finally(() => window.clearTimeout(id))
}

// ─── Core Request ─────────────────────────────────────────────────────────────

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
  const init: RequestInit = {
    method,
    headers: buildHeaders(extraHeaders),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  }
  const response = await withTimeout(fetch(url, init), TIMEOUT_MS)
  return parseResponse<T>(response)
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const apiClient = {
  get<T>(path: string, extraHeaders?: Record<string, string>): Promise<T> {
    return request<T>('GET', path, undefined, extraHeaders)
  },

  post<T>(path: string, body: unknown, extraHeaders?: Record<string, string>): Promise<T> {
    return request<T>('POST', path, body, extraHeaders)
  },

  put<T>(path: string, body: unknown, extraHeaders?: Record<string, string>): Promise<T> {
    return request<T>('PUT', path, body, extraHeaders)
  },

  patch<T>(path: string, body: unknown, extraHeaders?: Record<string, string>): Promise<T> {
    return request<T>('PATCH', path, body, extraHeaders)
  },

  delete<T>(path: string, extraHeaders?: Record<string, string>): Promise<T> {
    return request<T>('DELETE', path, undefined, extraHeaders)
  },
}

// ─── Mock Mode Flag ───────────────────────────────────────────────────────────

/** True when VITE_USE_MOCK_API env is set to "true" (or not set at all). */
export const isMockMode =
  (import.meta.env.VITE_USE_MOCK_API as string | undefined)?.toLowerCase() !== 'false'
