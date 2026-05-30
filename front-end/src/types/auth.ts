// ─── Auth Payloads (sent to backend) ──────────────────────────────────────────

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface VerifyOtpPayload {
  email: string
  otp_code: string
}

export interface LoginPayload {
  email: string
  password: string
}

// ─── Auth Responses (received from backend) ───────────────────────────────────

export interface RegisterResponse {
  message: string
  email?: string
}

export interface VerifyOtpResponse {
  message: string
  verified?: boolean
}

export interface LoginResponse {
  token: string
  user: {
    id?: string
    name: string
    email: string
  }
}

export interface ProfileResponse {
  id?: string
  name: string
  email: string
}

// ─── Auth Result (returned to UI components) ──────────────────────────────────

export interface AuthResult {
  success: boolean
  error?: string
}
