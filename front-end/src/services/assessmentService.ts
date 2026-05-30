/**
 * assessmentService.ts
 * Handles Burnout Assessment and Prediction data.
 *
 * Behaviour is controlled by VITE_USE_MOCK_API:
 *   true  → localStorage / mock (predictionService fallback data)
 *   false → backend assessment endpoints via apiClient
 *
 * normalizeAssessment / normalizePrediction protect the UI from
 * backend response shape changes.
 */

import { apiClient, isMockMode } from './apiClient'
import type { Assessment, CreateAssessmentPayload, Prediction, CreatePredictionPayload, PredictionResult } from '../types/assessment'

// ─── Fallback Mock Data ────────────────────────────────────────────────────────

const FALLBACK_PREDICTION: Prediction = {
  prediction_score: 68,
  risk_level: 'Sedang',
  recommendation:
    'Kurangi beban aktivitas malam ini, ambil jeda 10–15 menit setiap beberapa jam, dan prioritaskan tidur cukup untuk memulihkan energi.',
}

// ─── Adapters / Normalizers ────────────────────────────────────────────────────

export function normalizePredictionResponse(raw: unknown): Prediction | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>

  // Accept both snake_case (backend) and camelCase (legacy)
  const score =
    typeof r.prediction_score === 'number' ? r.prediction_score
    : typeof r.predictionScore === 'number' ? r.predictionScore
    : null

  if (score === null) return null

  const normalizedScore = score > 0 && score <= 1 ? score * 100 : score

  return {
    id: typeof r.id === 'string' ? r.id : undefined,
    prediction_score: Math.max(0, Math.min(100, Math.round(normalizedScore))),
    risk_level:
      typeof r.risk_level === 'string' ? r.risk_level
      : typeof r.riskLevel === 'string' ? r.riskLevel
      : 'Sedang',
    recommendation: typeof r.recommendation === 'string' ? r.recommendation : '',
    createdAt:
      typeof r.created_at === 'string' ? r.created_at
      : typeof r.createdAt === 'string' ? r.createdAt
      : undefined,
  }
}

export function normalizeAssessmentResponse(raw: unknown): Assessment | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  const score =
    typeof r.total_score === 'number' ? r.total_score
    : typeof r.totalScore === 'number' ? r.totalScore
    : null
  if (score === null) return null
  return {
    id: typeof r.id === 'string' ? r.id : undefined,
    total_score: score,
    category: typeof r.category === 'string' ? r.category : 'Tidak Diketahui',
    answers: (r.answers && typeof r.answers === 'object' ? r.answers : {}) as Record<string, unknown>,
    createdAt:
      typeof r.created_at === 'string' ? r.created_at
      : typeof r.createdAt === 'string' ? r.createdAt
      : undefined,
  }
}

function pickFirst<T>(payload: unknown, normalizer: (raw: unknown) => T | null): T | null {
  if (Array.isArray(payload)) return normalizer(payload[0])
  const obj = payload as Record<string, unknown>
  if (Array.isArray(obj?.data)) return normalizer(obj.data[0])
  return normalizer(payload)
}

function unwrapArray<T>(payload: unknown, normalizer: (raw: unknown) => T | null): T[] {
  const arr = Array.isArray(payload) ? payload
    : Array.isArray((payload as Record<string, unknown>)?.data)
      ? (payload as Record<string, unknown>).data as unknown[]
      : []
  return arr.map(normalizer).filter((x): x is T => x !== null)
}

// ─── Mock Helpers ─────────────────────────────────────────────────────────────

function getMockPrediction(): Prediction | null {
  try {
    // Dashboard already persists today_checkin; derive a live mock prediction from it
    const raw = localStorage.getItem('today_checkin')
    if (!raw) return null
    const checkin = JSON.parse(raw) as { score?: number; risk?: string }
    if (typeof checkin.score !== 'number') return null
    return {
      prediction_score: checkin.score,
      risk_level: checkin.risk ?? 'Sedang',
      recommendation: FALLBACK_PREDICTION.recommendation,
    }
  } catch {
    return null
  }
}

// ─── Assessment ───────────────────────────────────────────────────────────────

export async function createAssessment(payload: CreateAssessmentPayload): Promise<Assessment | null> {
  if (isMockMode) {
    const score = payload.total_score ?? 50
    return { total_score: score, category: score > 70 ? 'Tinggi' : score >= 40 ? 'Sedang' : 'Rendah', answers: payload.answers }
  }
  try {
    const res = await apiClient.post<unknown>('/assessment/assessment', payload)
    return normalizeAssessmentResponse(res)
  } catch {
    return null
  }
}

export async function getAssessments(): Promise<Assessment[]> {
  if (isMockMode) return []
  try {
    const res = await apiClient.get<unknown>('/assessment/assessments')
    return unwrapArray(res, normalizeAssessmentResponse)
  } catch {
    return []
  }
}

// ─── Prediction ───────────────────────────────────────────────────────────────

export async function createPrediction(payload: CreatePredictionPayload): Promise<Prediction | null> {
  if (isMockMode) return getMockPrediction()
  try {
    const res = await apiClient.post<unknown>('/assessment/prediction', payload)
    return normalizePredictionResponse(res)
  } catch {
    return null
  }
}

export async function getPredictions(): Promise<Prediction[]> {
  if (isMockMode) {
    const p = getMockPrediction()
    return p ? [p] : []
  }
  try {
    const res = await apiClient.get<unknown>('/assessment/predictions')
    return unwrapArray(res, normalizePredictionResponse)
  } catch {
    return []
  }
}

/**
 * getLatestPrediction
 * Drop-in replacement for the old predictionService.getLatestBurnoutPrediction().
 * DashboardPage calls this to display tomorrow's burnout prediction.
 */
export async function getLatestPrediction(): Promise<PredictionResult> {
  if (isMockMode) {
    const p = getMockPrediction()
    if (p) return { prediction: p, isFallback: false }
    return { prediction: FALLBACK_PREDICTION, isFallback: true }
  }

  try {
    const res = await apiClient.get<unknown>('/assessment/predictions')
    const prediction = pickFirst(res, normalizePredictionResponse)
    if (!prediction) return { prediction: FALLBACK_PREDICTION, isFallback: true }
    return { prediction, isFallback: false }
  } catch {
    return { prediction: FALLBACK_PREDICTION, isFallback: true }
  }
}
