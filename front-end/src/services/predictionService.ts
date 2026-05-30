export type BurnoutPrediction = {
  prediction_score: number
  risk_level: string
  recommendation: string
  created_at?: string
}

const FALLBACK_PREDICTION: BurnoutPrediction = {
  prediction_score: 68,
  risk_level: 'Sedang',
  recommendation:
    'Kurangi beban aktivitas malam ini, ambil jeda 10-15 menit setiap beberapa jam, dan prioritaskan tidur cukup untuk memulihkan energi.',
}

function getAuthToken() {
  const tokenKeys = ['token', 'access_token', 'accessToken', 'authToken']
  for (const key of tokenKeys) {
    const token = localStorage.getItem(key)
    if (token) return token
  }
  return null
}

function normalizePrediction(raw: unknown): BurnoutPrediction | null {
  if (!raw || typeof raw !== 'object') return null

  const candidate = raw as Partial<BurnoutPrediction>
  if (typeof candidate.prediction_score !== 'number') return null
  if (typeof candidate.risk_level !== 'string') return null
  if (typeof candidate.recommendation !== 'string') return null

  let score = candidate.prediction_score
  if (score > 0 && score <= 1) {
    score = score * 100
  }

  return {
    prediction_score: Math.max(0, Math.min(100, Math.round(score))),
    risk_level: candidate.risk_level,
    recommendation: candidate.recommendation,
    created_at: typeof candidate.created_at === 'string' ? candidate.created_at : undefined,
  }
}

function pickPredictionFromPayload(payload: unknown): BurnoutPrediction | null {
  if (Array.isArray(payload)) {
    const latest = payload[0]
    return normalizePrediction(latest)
  }

  if (payload && typeof payload === 'object') {
    const objectPayload = payload as Record<string, unknown>
    if (Array.isArray(objectPayload.data)) {
      const latest = objectPayload.data[0]
      return normalizePrediction(latest)
    }
    return normalizePrediction(payload)
  }

  return null
}

export async function getLatestBurnoutPrediction(): Promise<{
  prediction: BurnoutPrediction | null
  isFallback: boolean
}> {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? ''
  const token = getAuthToken()

  try {
    const response = await fetch(`${baseUrl}/assessment/predictions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      throw new Error(`Failed with status ${response.status}`)
    }

    const payload = (await response.json()) as unknown
    return {
      prediction: pickPredictionFromPayload(payload),
      isFallback: false,
    }
  } catch {
    return {
      prediction: FALLBACK_PREDICTION,
      isFallback: true,
    }
  }
}
