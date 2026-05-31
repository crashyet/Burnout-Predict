// ─── User & Session Types ──────────────────────────────────────────────────────

export interface User {
  id?: string | number
  name: string
  email: string
}

export interface AuthSession {
  token?: string
  user: User
  isAuthenticated: boolean
}

// Internal-only: registered user with hashed/plain password for mock flow
export interface RegisteredUser extends User {
  password: string
  verified: boolean
}
