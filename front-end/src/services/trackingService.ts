/**
 * trackingService.ts
 * Handles Check-In and Journal data.
 *
 * Behaviour is controlled by VITE_USE_MOCK_API:
 *   true  → read/write from localStorage (existing historyService data intact)
 *   false → call backend tracking endpoints via apiClient
 *
 * Adapters (normalizeCheckIn / normalizeJournal) insulate the UI from
 * backend response shape changes.
 */

import { apiClient, isMockMode } from './apiClient'
import {
  getHistoryList,
  saveHistoryItem,
  getJournalList,
  saveJournalEntry,
  getJournalsByDate,
  getLocalDateString,
  analyzeJournalText,
} from './historyService'
import type { CheckIn, CreateCheckInPayload, Journal, CreateJournalPayload } from '../types/tracking'

// ─── Adapters ─────────────────────────────────────────────────────────────────

function normalizeCheckInResponse(raw: unknown): CheckIn | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  return {
    id: typeof r.id === 'string' ? r.id : undefined,
    date: typeof r.date === 'string' ? r.date : getLocalDateString(),
    sleep_hours: typeof r.sleep_hours === 'number' ? r.sleep_hours : 0,
    work_hours: typeof r.work_hours === 'number' ? r.work_hours : undefined,
    energy_level: typeof r.energy_level === 'number' ? r.energy_level : undefined,
    stress_level: typeof r.stress_level === 'number' ? r.stress_level : undefined,
    burnoutScore: typeof r.burnout_score === 'number' ? r.burnout_score : undefined,
    riskLevel: typeof r.risk_level === 'string' ? r.risk_level : undefined,
    createdAt: typeof r.created_at === 'string' ? r.created_at : undefined,
  }
}

function normalizeJournalResponse(raw: unknown): Journal | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Record<string, unknown>
  return {
    id: typeof r.id === 'string' ? r.id : undefined,
    date: typeof r.date === 'string' ? r.date : getLocalDateString(),
    content: typeof r.content === 'string' ? r.content : '',
    detectedEmotion: typeof r.detected_emotion === 'string' ? r.detected_emotion
      : typeof r.detectedEmotion === 'string' ? r.detectedEmotion : undefined,
    insight: typeof r.insight === 'string' ? r.insight : undefined,
    recommendation: typeof r.recommendation === 'string' ? r.recommendation : undefined,
    createdAt: typeof r.created_at === 'string' ? r.created_at
      : typeof r.createdAt === 'string' ? r.createdAt : undefined,
  }
}

function unwrapArray<T>(payload: unknown, normalizer: (raw: unknown) => T | null): T[] {
  const arr = Array.isArray(payload) ? payload
    : Array.isArray((payload as Record<string, unknown>)?.data)
      ? (payload as Record<string, unknown>).data as unknown[]
      : []
  return arr.map(normalizer).filter((x): x is T => x !== null)
}

// ─── Check-In ─────────────────────────────────────────────────────────────────

export async function createCheckIn(payload: CreateCheckInPayload): Promise<CheckIn> {
  if (isMockMode) {
    // Persist via existing historyService
    saveHistoryItem({
      date: payload.date,
      journal: '',
      emotion: 'Lelah',
      burnoutScore: 0,      // caller should compute score before calling
      riskLevel: 'Rendah',
    })
    // Also persist the raw check-in key used by Dashboard
    const stored = {
      sleepHours: payload.sleep_hours,
      workHours: payload.work_hours ?? 0,
      score: 0,
      risk: 'Rendah',
    }
    localStorage.setItem('today_checkin', JSON.stringify(stored))
    return {
      date: payload.date,
      sleep_hours: payload.sleep_hours,
      work_hours: payload.work_hours,
    }
  }

  const res = await apiClient.post<unknown>('/tracking/checkin', payload)
  return normalizeCheckInResponse(res) ?? { date: payload.date, sleep_hours: payload.sleep_hours }
}

export async function getCheckIns(): Promise<CheckIn[]> {
  if (isMockMode) {
    const history = getHistoryList()
    return history.map((h) => ({
      date: h.date,
      sleep_hours: 0,
      burnoutScore: h.burnoutScore,
      riskLevel: h.riskLevel,
    }))
  }

  try {
    const res = await apiClient.get<unknown>('/tracking/checkins')
    return unwrapArray(res, normalizeCheckInResponse)
  } catch {
    return []
  }
}

// ─── Journal ──────────────────────────────────────────────────────────────────

export async function createJournal(payload: CreateJournalPayload): Promise<Journal> {
  if (isMockMode) {
    const analysis = analyzeJournalText(payload.content)
    const entry = saveJournalEntry(
      payload.content,
      payload.detectedEmotion ?? analysis.emotion,
      payload.insight ?? analysis.insight,
      payload.recommendation ?? analysis.recommendation,
    )
    return {
      id: entry.id,
      date: entry.date,
      content: entry.content,
      detectedEmotion: entry.detectedEmotion,
      insight: entry.insight,
      recommendation: entry.recommendation,
      createdAt: entry.createdAt,
    }
  }

  const res = await apiClient.post<unknown>('/tracking/journal', payload)
  return normalizeJournalResponse(res) ?? { date: payload.date, content: payload.content }
}

export async function getJournals(dateStr?: string): Promise<Journal[]> {
  if (isMockMode) {
    const list = dateStr ? getJournalsByDate(dateStr) : getJournalList()
    return list.map((j) => ({
      id: j.id,
      date: j.date,
      content: j.content,
      detectedEmotion: j.detectedEmotion,
      insight: j.insight,
      recommendation: j.recommendation,
      createdAt: j.createdAt,
    }))
  }

  try {
    const path = dateStr ? `/tracking/journals?date=${dateStr}` : '/tracking/journals'
    const res = await apiClient.get<unknown>(path)
    return unwrapArray(res, normalizeJournalResponse)
  } catch {
    return []
  }
}

// ─── Re-export useful helpers so pages need only this service ─────────────────
export { analyzeJournalText, getLocalDateString }
