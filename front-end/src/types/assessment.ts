// ─── Assessment ───────────────────────────────────────────────────────────────

export interface Assessment {
  id?: string
  total_score: number
  category: string             // e.g. "Rendah" | "Sedang" | "Tinggi"
  answers: Record<string, unknown>
  createdAt?: string
}

export interface CreateAssessmentPayload {
  answers: Record<string, unknown>
  total_score?: number
}

// ─── Prediction ───────────────────────────────────────────────────────────────

export interface Prediction {
  id?: string
  prediction_score: number     // 0–100
  risk_level: string           // "Rendah" | "Sedang" | "Tinggi"
  recommendation: string
  createdAt?: string
}

export interface CreatePredictionPayload {
  sleep_hours?: number
  work_hours?: number
  assessment_score?: number
  questionnaire_answers?: number[]
}

// ─── Service Return Shape ─────────────────────────────────────────────────────

export interface PredictionResult {
  prediction: Prediction | null
  isFallback: boolean
}
