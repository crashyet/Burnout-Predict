/**
 * authService.ts
 * Handles user registration, OTP verification, login, and session management.
 *
 * Behaviour is controlled by the VITE_USE_MOCK_API env variable:
 *   true  → localStorage / mock flow (no backend required)
 *   false → calls real backend endpoints via apiClient
 *
 * All pages should import from this file only – never fetch auth endpoints directly.
 */

import { apiClient, isMockMode, isApiError } from './apiClient'
import type {
  RegisterPayload,
  VerifyOtpPayload,
  LoginPayload,
  LoginResponse,
  ProfileResponse,
  AuthResult,
  VerifyOtpResponse,
} from '../types/auth'
import type { User, RegisteredUser, AuthSession } from '../types/user'

// ─── localStorage Keys ────────────────────────────────────────────────────────

const KEYS = {
  SESSION: 'current_session',
  PENDING_USER: 'pending_user',
  REGISTERED_USERS: 'registered_users',
} as const

// ─── Internal Helpers ─────────────────────────────────────────────────────────

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value))
}

// ─── Session Management ───────────────────────────────────────────────────────

export function saveSession(user: User, token?: string): void {
  const session: AuthSession = { isAuthenticated: true, user, token }
  writeJson(KEYS.SESSION, session)
}

export function clearSession(): void {
  localStorage.removeItem(KEYS.SESSION)
}

export function getToken(): string | null {
  return readJson<AuthSession>(KEYS.SESSION)?.token ?? null
}

export function getCurrentUser(): User | null {
  const session = readJson<AuthSession>(KEYS.SESSION)
  return session?.isAuthenticated ? session.user : null
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}

// ─── Mock Helpers ─────────────────────────────────────────────────────────────

function getPendingUser(): RegisteredUser | null {
  return readJson<RegisteredUser>(KEYS.PENDING_USER)
}

function getRegisteredUsers(): RegisteredUser[] {
  return readJson<RegisteredUser[]>(KEYS.REGISTERED_USERS) ?? []
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerUser(payload: RegisterPayload): Promise<AuthResult> {
  if (isMockMode) {
    const pending: RegisteredUser = { ...payload, verified: false }
    writeJson(KEYS.PENDING_USER, pending)
    return { success: true }
  }

  try {
    await apiClient.post('/auth/register', payload)
    // Store email so OTP page knows which account to verify
    writeJson(KEYS.PENDING_USER, { email: payload.email, name: payload.name, password: '', verified: false })
    return { success: true }
  } catch (err) {
    if (isApiError(err)) {
      const body = err.body as { message?: string } | undefined
      return { success: false, error: body?.message || err.message }
    }
    const message = err instanceof Error ? err.message : 'Registrasi gagal. Coba lagi.'
    return { success: false, error: message }
  }
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export async function verifyOtp(payload: VerifyOtpPayload): Promise<AuthResult> {
  if (isMockMode) {
    if (payload.otp_code !== '123456') {
      return { success: false, error: 'Kode OTP tidak valid. Gunakan 123456 untuk demo.' }
    }
    const pending = getPendingUser()
    if (!pending) {
      return { success: false, error: 'Tidak ada pendaftaran yang menunggu verifikasi.' }
    }
    const users = getRegisteredUsers()
    const idx = users.findIndex((u) => u.email === pending.email)
    const verified: RegisteredUser = { ...pending, verified: true }
    if (idx >= 0) users[idx] = verified
    else users.push(verified)
    writeJson(KEYS.REGISTERED_USERS, users)
    localStorage.removeItem(KEYS.PENDING_USER)
    return {
      success: true,
      token: 'mock-jwt-token',
      user: {
        id: 'mock-user-id',
        name: pending.name || 'Mock User',
        email: pending.email,
      }
    }
  }

  try {
    const res = await apiClient.post<VerifyOtpResponse>('/auth/verify-otp', payload)
    localStorage.removeItem(KEYS.PENDING_USER)
    return {
      success: true,
      token: res.data?.token,
      user: res.data?.user,
    }
  } catch (err) {
    if (isApiError(err)) {
      const body = err.body as { message?: string } | undefined
      return { success: false, error: body?.message || err.message }
    }
    const message = err instanceof Error ? err.message : 'Verifikasi OTP gagal.'
    return { success: false, error: message }
  }
}

// ─── Resend OTP ───────────────────────────────────────────────────────────────

export async function resendOtp(payload: { email: string }): Promise<AuthResult> {
  if (isMockMode) {
    return { success: true }
  }

  try {
    await apiClient.post('/auth/resend-otp', payload)
    return { success: true }
  } catch (err) {
    if (isApiError(err)) {
      const body = err.body as { message?: string } | undefined
      return { success: false, error: body?.message || err.message }
    }
    const message = err instanceof Error ? err.message : 'Gagal mengirim ulang OTP.'
    return { success: false, error: message }
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginUser(payload: LoginPayload): Promise<AuthResult> {
  if (isMockMode) {
    const users = getRegisteredUsers()
    const found = users.find((u) => u.email === payload.email)

    if (!found) {
      const pending = getPendingUser()
      if (pending?.email === payload.email) {
        return { success: false, error: 'Akun belum diverifikasi OTP.' }
      }
      return { success: false, error: 'Email atau password salah.' }
    }
    if (found.password !== payload.password) {
      return { success: false, error: 'Email atau password salah.' }
    }
    if (!found.verified) {
      return { success: false, error: 'Akun belum diverifikasi OTP.' }
    }
    saveSession({ name: found.name, email: found.email })
    return { success: true }
  }

  try {
    // Ambil properti 'data' dari Axios, lalu ambil 'data' asli dari API kamu
    const { data: apiResponse } = await apiClient.post<LoginResponse>('/auth/login', payload)
    
    const { user, token } = apiResponse
    console.log({ user, token })

    saveSession({ name: user.name, email: user.email, id: user.id }, token)
    return { success: true }
  } catch (err) {
    if (isApiError(err)) {
      const body = err.body as { errors?: { unverified?: boolean; email?: string }; message?: string } | undefined;
      if (body?.errors?.unverified) {
        return {
          success: false,
          unverified: true,
          email: body.errors.email,
          error: body.message || err.message,
        }
      }
      const message = body?.message || err.message
      return { success: false, error: message }
    }
    const message = err instanceof Error ? err.message : 'Login gagal. Periksa email dan kata sandi.'
    return { success: false, error: message }
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export function logoutUser(): void {
  clearSession()
}

// ─── Profile (live fetch) ─────────────────────────────────────────────────────

export async function fetchProfile(): Promise<User | null> {
  if (isMockMode) {
    return getCurrentUser()
  }
  try {
    const res = await apiClient.get<ProfileResponse>('/profile')
    return { id: res.id, name: res.name, email: res.email }
  } catch {
    return getCurrentUser()
  }
}
