// ─── Check-In ─────────────────────────────────────────────────────────────────

export interface CheckIn {
  id?: string
  date: string                 // YYYY-MM-DD
  sleep_hours: number
  work_hours?: number
  energy_level?: number        // questionnaire score 1–10
  stress_level?: number        // questionnaire score 1–10
  burnoutScore?: number        // 0–100 (computed)
  riskLevel?: 'Rendah' | 'Sedang' | 'Tinggi' | string
  createdAt?: string
}

export interface CreateCheckInPayload {
  date: string
  sleep_hours: number
  work_hours?: number
  energy_level?: number
  stress_level?: number
  questionnaire_answers?: number[]
}

// ─── Journal ──────────────────────────────────────────────────────────────────

export interface Journal {
  id?: string
  date: string                 // YYYY-MM-DD
  content: string
  detectedEmotion?: string
  insight?: string
  recommendation?: string
  createdAt?: string
}

export interface CreateJournalPayload {
  date: string
  content: string
  detectedEmotion?: string
  insight?: string
  recommendation?: string
}

// ─── History (local UI aggregation) ───────────────────────────────────────────

export interface DailyHistorySummary {
  date: string
  journal: string
  emotion: string
  burnoutScore: number
  riskLevel: 'Rendah' | 'Sedang' | 'Tinggi' | string
}
