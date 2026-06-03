import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { type DailyHistory } from '../services/historyService'
import { getCheckIns, getJournals } from '../services/trackingService'
import type { Journal } from '../types/tracking'

type MoodKey = 'anger' | 'happy' | 'sadness' | 'love' | 'fear'
type RiskLevel = 'Rendah' | 'Sedang' | 'Tinggi'

const MOOD_ORDER: MoodKey[] = ['anger', 'happy', 'sadness', 'love', 'fear']

const MOOD_CONFIG: Record<MoodKey, { bg: string; text: string; label: string; icon: string }> = {
  anger: {
    bg: 'mood-anger',
    text: '',
    label: 'anger',
    icon: 'sentiment_angry',
  },
  happy: {
    bg: 'mood-happy',
    text: '',
    label: 'happy',
    icon: 'sentiment_very_satisfied',
  },
  sadness: {
    bg: 'mood-sadness',
    text: '',
    label: 'sadness',
    icon: 'sentiment_very_dissatisfied',
  },
  love: {
    bg: 'mood-love',
    text: '',
    label: 'love',
    icon: 'favorite',
  },
  fear: {
    bg: 'mood-fear',
    text: '',
    label: 'fear',
    icon: 'sentiment_dissatisfied',
  },
}

const DEFAULT_MOOD_CONFIG = {
  bg: 'bg-surface-container',
  text: 'text-on-surface-variant',
  label: 'Belum ada emosi',
  icon: 'sentiment_neutral',
}

const RISK_BADGES: Record<RiskLevel, { badge: string; text: string }> = {
  Rendah: {
    badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
    text: 'Rendah',
  },
  Sedang: {
    badge: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
    text: 'Sedang',
  },
  Tinggi: {
    badge: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
    text: 'Tinggi',
  },
}

function isMoodKey(value: string): value is MoodKey {
  return MOOD_ORDER.includes(value as MoodKey)
}

function normalizeMoodEmotion(raw?: string | null): MoodKey | '' {
  const key = (raw || '').toLowerCase().trim()

  const aliases: Record<string, MoodKey> = {
    anger: 'anger',
    marah: 'anger',
    angry: 'anger',
    stress: 'anger',
    stres: 'anger',

    happy: 'happy',
    senang: 'happy',
    bahagia: 'happy',
    joy: 'happy',

    sadness: 'sadness',
    sad: 'sadness',
    sedih: 'sadness',
    lelah: 'sadness',
    tired: 'sadness',

    love: 'love',
    cinta: 'love',
    sayang: 'love',

    fear: 'fear',
    takut: 'fear',
    cemas: 'fear',
    anxiety: 'fear',
    anxious: 'fear',
  }

  if (aliases[key]) return aliases[key]
  if (isMoodKey(key)) return key

  return ''
}

function getMoodConfig(raw?: string | null) {
  const moodKey = normalizeMoodEmotion(raw)

  if (!moodKey) {
    return DEFAULT_MOOD_CONFIG
  }

  return MOOD_CONFIG[moodKey]
}

function normalizeRiskLevel(raw?: string | null): RiskLevel {
  const key = (raw || '').toLowerCase().trim()

  if (key === 'tinggi' || key === 'high') return 'Tinggi'
  if (key === 'sedang' || key === 'medium' || key === 'moderate') return 'Sedang'

  return 'Rendah'
}

function isHighRisk(raw?: string | null): boolean {
  return normalizeRiskLevel(raw) === 'Tinggi'
}

function formatIndonesianDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-')
    const year = parts[0]
    const monthIndex = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)

    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ]

    return `${day} ${months[monthIndex]} ${year}`
  } catch (e) {
    return dateStr
  }
}

function MoodCalendar({
  selectedMonth,
  selectedDate,
  historyList,
  onSelectDate,
}: {
  selectedMonth: string
  selectedDate: string
  historyList: DailyHistory[]
  onSelectDate: (date: string) => void
}) {
  const days = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

  const cells = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split('-')
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10) - 1

    const totalDays = new Date(year, month + 1, 0).getDate()

    const rawStartDay = new Date(year, month, 1).getDay()
    const startDayOffset = rawStartDay === 0 ? 6 : rawStartDay - 1

    const listCells: Array<{
      day: string
      dateStr: string
      hasData: boolean
      moodEmotion: string
      className: string
    }> = []

    for (let i = 0; i < startDayOffset; i++) {
      listCells.push({
        day: '',
        dateStr: '',
        hasData: false,
        moodEmotion: '',
        className: 'bg-transparent cursor-default',
      })
    }

    for (let d = 1; d <= totalDays; d++) {
      const dStr = d < 10 ? `0${d}` : `${d}`
      const dateStr = `${selectedMonth}-${dStr}`
      const historyItem = historyList.find((h) => h.date === dateStr)

      const moodEmotion = normalizeMoodEmotion(historyItem?.emotion)
      const config = moodEmotion ? MOOD_CONFIG[moodEmotion] : null

      listCells.push({
        day: d.toString(),
        dateStr,
        hasData: !!historyItem,
        moodEmotion,
        className: config ? config.bg : 'bg-surface-container-low text-on-surface-variant',
      })
    }

    return listCells
  }, [selectedMonth, historyList])

  return (
    <section className="lg:col-span-8 rounded-2xl p-6 lg:p-8 flex flex-col h-full bg-surface-container-lowest shadow-ambient-1 bg-white/70 backdrop-blur-[12px] border border-outline-variant/30">
      <div className="flex justify-between items-center mb-8">
        <h3 className="font-headline-md text-[20px] font-bold text-on-surface">Kalender Emosi</h3>

        <div className="flex gap-2">
          <div className="flex items-center gap-1 text-[13px] font-medium text-on-surface-variant bg-surface-container/30 px-3 py-1.5 rounded-full border border-outline-variant/20">
            <span className="w-2.5 h-2.5 rounded-full bg-primary/20 border border-primary/50 animate-pulse" />
            Klik tanggal untuk detail
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-8">
        {days.map((day) => (
          <div
            key={day}
            className="font-label-sm text-label-sm font-bold text-on-surface-variant text-center pb-2"
          >
            {day}
          </div>
        ))}

        {cells.map((cell, index) => {
          if (!cell.day) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const isSelected = selectedDate === cell.dateStr
          const selectedRing = isSelected
            ? 'border-2 border-primary scale-105 z-10 shadow-md'
            : 'border border-outline-variant/10'

          return (
            <button
              key={cell.dateStr}
              onClick={() => onSelectDate(cell.dateStr)}
              className={`aspect-square rounded-full flex flex-col items-center justify-center text-sm font-semibold transition-all duration-200 shadow-sm cursor-pointer ${
                cell.hasData
                  ? cell.className
                  : 'bg-white text-on-surface hover:bg-primary/5 hover:text-primary hover:border-primary/30'
              } ${selectedRing}`}
              type="button"
              title={cell.moodEmotion || undefined}
            >
              <span className={cell.hasData ? '-translate-y-0.5' : ''}>{cell.day}</span>

              {cell.hasData && (
                <span className="w-1.5 h-1.5 rounded-full bg-current mt-0.5 opacity-70" />
              )}
            </button>
          )
        })}
      </div>

      <MoodLegend />
    </section>
  )
}

function MoodLegend() {
  const legends = [
    { label: 'anger', dotClass: 'mood-anger border-transparent' },
    { label: 'happy', dotClass: 'mood-happy border-transparent' },
    { label: 'sadness', dotClass: 'mood-sadness border-transparent' },
    { label: 'love', dotClass: 'mood-love border-transparent' },
    { label: 'fear', dotClass: 'mood-fear border-transparent' },
  ]

  return (
    <div className="mt-auto pt-6 border-t border-outline-variant/20">
      <h4 className="font-label-sm text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-4">
        Legenda Mood
      </h4>

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {legends.map((legend) => (
          <div key={legend.label} className="flex items-center gap-2">
            <span className={`w-3.5 h-3.5 rounded-full ${legend.dotClass} border`} />
            <span className="font-label-sm text-[13px] text-on-surface">{legend.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MoodSummary({ monthlyData }: { monthlyData: DailyHistory[] }) {
  const stats = useMemo(() => {
    if (monthlyData.length === 0) {
      return { dominant: '-', highRiskDays: 0 }
    }

    const emotionCounts: Record<MoodKey, number> = {
      anger: 0,
      happy: 0,
      sadness: 0,
      love: 0,
      fear: 0,
    }

    let highRiskDays = 0

    monthlyData.forEach((item) => {
      const emotionKey = normalizeMoodEmotion(item.emotion)

      if (emotionKey) {
        emotionCounts[emotionKey] += 1
      }

      if (isHighRisk(item.riskLevel)) {
        highRiskDays += 1
      }
    })

    let dominant = '-'
    let maxCount = 0

    Object.entries(emotionCounts).forEach(([emotion, count]) => {
      if (count > maxCount) {
        maxCount = count
        dominant = emotion
      }
    })

    return { dominant, highRiskDays }
  }, [monthlyData])

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-2xl p-5 flex flex-col items-center justify-center text-center bg-surface-container-lowest shadow-ambient-1 bg-white/70 backdrop-blur-[12px] border border-outline-variant/20">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            spa
          </span>
        </div>

        <p className="font-label-sm text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
          Dominan
        </p>
        <p className="text-[20px] font-bold text-on-surface">{stats.dominant}</p>
      </div>

      <div className="rounded-2xl p-5 flex flex-col items-center justify-center text-center bg-surface-container-lowest shadow-ambient-1 bg-white/70 backdrop-blur-[12px] border border-outline-variant/20">
        <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center mb-3">
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            warning
          </span>
        </div>

        <p className="font-label-sm text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
          Risiko Tinggi
        </p>
        <p className="text-[20px] font-bold text-on-surface">
          {stats.highRiskDays}{' '}
          <span className="text-[13px] font-medium text-on-surface-variant">hari</span>
        </p>
      </div>
    </div>
  )
}

function MoodStats({ monthlyData }: { monthlyData: DailyHistory[] }) {
  const rows = useMemo(() => {
    const counts: Record<MoodKey, number> = {
      anger: 0,
      happy: 0,
      sadness: 0,
      love: 0,
      fear: 0,
    }

    monthlyData.forEach((item) => {
      const emotionKey = normalizeMoodEmotion(item.emotion)

      if (emotionKey) {
        counts[emotionKey] += 1
      }
    })

    const totalEmotionData = Object.values(counts).reduce((total, value) => total + value, 0)

    return MOOD_ORDER.map((name) => {
      const count = counts[name]
      const percentage = totalEmotionData > 0 ? Math.round((count / totalEmotionData) * 100) : 0
      const config = MOOD_CONFIG[name]

      return {
        name,
        percentage,
        barClass: config.bg,
      }
    })
  }, [monthlyData])

  return (
    <section className="rounded-2xl p-6 bg-surface-container-lowest shadow-ambient-1 bg-white/70 backdrop-blur-[12px] border border-outline-variant/20">
      <h3 className="font-label-md text-[14px] font-bold text-on-surface mb-5">
        Statistik Bulan Ini
      </h3>

      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center gap-3">
            <span className="w-16 font-label-sm text-[13px] text-on-surface-variant">
              {row.name}
            </span>

            <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${row.barClass}`}
                style={{ width: `${row.percentage}%` }}
              />
            </div>

            <span className="w-10 text-right font-label-sm text-[13px] font-bold text-on-surface">
              {row.percentage}%
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}

function MoodInsightCard({ monthlyData }: { monthlyData: DailyHistory[] }) {
  const insightText = useMemo(() => {
    if (monthlyData.length === 0) {
      return 'Belum ada data mood untuk memberikan insight. Silakan isi check-in harian atau tulis jurnal Anda hari ini.'
    }

    const negativeEmotionCount = monthlyData.filter((item) => {
      const mood = normalizeMoodEmotion(item.emotion)
      return mood === 'anger' || mood === 'fear' || mood === 'sadness'
    }).length

    const positiveEmotionCount = monthlyData.filter((item) => {
      const mood = normalizeMoodEmotion(item.emotion)
      return mood === 'happy' || mood === 'love'
    }).length

    const highRiskCount = monthlyData.filter((item) => isHighRisk(item.riskLevel)).length

    if (negativeEmotionCount + highRiskCount > positiveEmotionCount) {
      return 'Data bulan ini menunjukkan beberapa emosi negatif atau risiko burnout yang perlu diperhatikan. Coba prioritaskan istirahat, evaluasi beban kerja, dan tulis jurnal secara rutin agar pola emosinya lebih mudah dipantau.'
    }

    if (positiveEmotionCount > 0) {
      return 'Mood bulan ini cukup positif dengan adanya emosi happy atau love. Pertahankan pola aktivitas yang sehat dan tetap lakukan check-in harian agar tren burnout tetap terpantau.'
    }

    return 'Pola mood Anda masih bervariasi. Terus catat jurnal harian agar AI dapat membantu membaca pola emosi dan risiko burnout dengan lebih akurat.'
  }, [monthlyData])

  return (
    <section className="rounded-2xl p-6 bg-surface-container-lowest border border-outline-variant/20 shadow-ambient-1 relative overflow-hidden bg-white/70 backdrop-blur-[12px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />

      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center">
          <span
            className="material-symbols-outlined text-[18px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lightbulb
          </span>
        </div>

        <h3 className="font-label-md text-[14px] font-bold text-on-surface">
          Insight AI BurnoutLens
        </h3>
      </div>

      <p className="font-body-md text-[14px] text-on-surface-variant leading-relaxed relative z-10 mb-5">
        {insightText}
      </p>

      <a
        className="inline-flex items-center gap-1.5 text-primary font-label-md text-[13px] hover:underline relative z-10 font-bold"
        href="/daily-checkin"
      >
        Perbarui Check-In Anda
        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
      </a>
    </section>
  )
}

function SelectedDateDetail({
  selectedDate,
  historyItem,
  journals,
}: {
  selectedDate: string
  historyItem: DailyHistory | null
  journals: Journal[]
}) {
  const formattedDate = formatIndonesianDate(selectedDate)

  const hasData = historyItem !== null || journals.length > 0

  const activeEmotion =
    normalizeMoodEmotion(historyItem?.emotion) ||
    normalizeMoodEmotion(journals.find((journal) => journal.detectedEmotion)?.detectedEmotion)

  const activeMoodConfig = activeEmotion ? MOOD_CONFIG[activeEmotion] : DEFAULT_MOOD_CONFIG

  return (
    <div className="rounded-2xl p-6 bg-surface-container-lowest border border-outline-variant/20 shadow-ambient-1 flex flex-col h-full bg-white/70 backdrop-blur-[12px]">
      <div className="border-b border-outline-variant/20 pb-4 mb-5 flex justify-between items-center">
        <div>
          <span className="font-label-sm text-[11px] font-bold text-primary uppercase tracking-wider block mb-1">
            Tanggal Riwayat
          </span>

          <h4 className="font-headline-md text-[18px] font-bold text-on-surface">
            {formattedDate}
          </h4>
        </div>

        {hasData && (
          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          </span>
        )}
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4">
          <span className="material-symbols-outlined text-outline-variant text-[48px] mb-4">
            edit_calendar
          </span>

          <p className="font-headline-md text-[16px] font-bold text-on-surface mb-2">
            Belum ada riwayat untuk tanggal ini
          </p>

          <p className="font-body-sm text-[13px] text-on-surface-variant max-w-xs leading-relaxed">
            Isi check-in harian atau jurnal untuk membuat riwayat baru pada tanggal ini.
          </p>

          <div className="flex gap-2 mt-6">
            <a
              href="/daily-checkin"
              className="inline-flex items-center gap-1 bg-primary text-on-primary font-label-sm text-[12px] px-4 py-2 rounded-full hover:shadow-md hover:shadow-primary/20 transition-all font-bold"
            >
              Check-In
            </a>

            <a
              href="/journal"
              className="inline-flex items-center gap-1 bg-surface text-primary border border-primary/20 font-label-sm text-[12px] px-4 py-2 rounded-full hover:bg-primary/5 transition-all font-bold"
            >
              Tulis Jurnal
            </a>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <h5 className="font-label-sm text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">edit_note</span>
              Riwayat Jurnaling
            </h5>

            {journals.length === 0 ? (
              <div className="bg-surface-container-low/40 rounded-xl p-4 border border-outline-variant/10 text-center">
                <p className="font-body-sm text-[13px] text-on-surface-variant italic">
                  Belum ada jurnal untuk tanggal ini.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
                {journals.map((journal) => {
                  const normalizedEmotion = normalizeMoodEmotion(journal.detectedEmotion)
                  const moodConfig = normalizedEmotion
                    ? MOOD_CONFIG[normalizedEmotion]
                    : DEFAULT_MOOD_CONFIG

                  return (
                    <div
                      key={journal.id}
                      className="bg-surface-container-low/40 rounded-xl p-4 border border-outline-variant/10 flex flex-col gap-2"
                    >
                      <p className="font-body-md text-[14px] text-on-surface leading-relaxed italic">
                        “{journal.content}”
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 mt-1 pt-2 border-t border-outline-variant/5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-outline-variant/20 ${moodConfig.bg} ${moodConfig.text}`}
                        >
                          {normalizedEmotion || journal.detectedEmotion || 'Belum ada emosi'}
                        </span>

                        <span className="text-[10px] text-on-surface-variant font-medium">
                          {new Date(journal.createdAt || journal.date).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          WIB
                        </span>
                      </div>

                      {journal.insight && (
                        <p className="text-[11.5px] text-on-surface-variant bg-surface-container-lowest/70 p-2.5 rounded-lg leading-relaxed mt-1 border border-outline-variant/5">
                          <span className="font-bold text-[10px] text-primary uppercase block mb-1">
                            Analisis Jurnal:
                          </span>
                          {journal.insight}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <h5 className="font-label-sm text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">mood</span>
              Riwayat Emosi Hari Itu
            </h5>

            <div className="flex items-center gap-3">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant/20 ${activeMoodConfig.bg} ${activeMoodConfig.text} font-bold text-[14px]`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {activeMoodConfig.icon}
                </span>
                <span>{activeMoodConfig.label}</span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-label-sm text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">analytics</span>
              Riwayat Hasil Burnout Skor Hari Ini
            </h5>

            {historyItem && historyItem.burnoutScore > 0 ? (
              <div className="bg-surface-container-low/40 rounded-xl p-4 border border-outline-variant/10 flex items-center justify-between">
                <div>
                  <span className="text-[13px] text-on-surface-variant block mb-0.5">
                    Skor Burnout
                  </span>
                  <span className="text-[20px] font-bold text-on-surface">
                    {historyItem.burnoutScore}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[13px] text-on-surface-variant block mb-1">
                    Level Risiko
                  </span>

                  {(() => {
                    const riskLevel = normalizeRiskLevel(historyItem.riskLevel)
                    const badge = RISK_BADGES[riskLevel]

                    return (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[12px] font-bold border ${badge.badge}`}
                      >
                        {badge.text}
                      </span>
                    )
                  })()}
                </div>
              </div>
            ) : (
              <div className="bg-surface-container-low/40 rounded-xl p-4 border border-outline-variant/10 text-center">
                <p className="font-body-sm text-[13px] text-on-surface-variant italic mb-2">
                  Belum melakukan check-in harian pada tanggal ini.
                </p>

                <a
                  href="/daily-checkin"
                  className="inline-flex items-center gap-1 text-primary hover:underline text-[12px] font-bold"
                >
                  Mulai Check-In Hari Ini
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function HistoryList({
  monthlyData,
  currentPage,
  onPageChange,
  selectedDate,
  onSelectDate,
}: {
  monthlyData: DailyHistory[]
  currentPage: number
  onPageChange: (page: number) => void
  selectedDate: string
  onSelectDate: (date: string) => void
}) {
  const itemsPerPage = 3

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return monthlyData.slice(startIndex, startIndex + itemsPerPage)
  }, [monthlyData, currentPage])

  const totalPages = Math.ceil(monthlyData.length / itemsPerPage)

  return (
    <div className="rounded-2xl p-6 bg-surface-container-lowest border border-outline-variant/20 shadow-ambient-1 flex flex-col h-full bg-white/70 backdrop-blur-[12px]">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-headline-md text-[18px] font-bold text-on-surface">
          Daftar Riwayat Harian
        </h4>

        <span className="text-[12px] text-on-surface-variant font-medium bg-surface-container/50 px-2.5 py-1 rounded-full">
          Total: {monthlyData.length} entri
        </span>
      </div>

      {monthlyData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <span className="material-symbols-outlined text-outline-variant text-[40px] mb-3">
            folder_open
          </span>
          <p className="font-label-md text-on-surface-variant">
            Tidak ada data riwayat untuk bulan ini
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-3">
          {paginatedData.map((item) => {
            const isSelected = selectedDate === item.date
            const mood = getMoodConfig(item.emotion)
            const riskLevel = normalizeRiskLevel(item.riskLevel)
            const risk = RISK_BADGES[riskLevel]

            return (
              <button
                key={item.date}
                onClick={() => onSelectDate(item.date)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                    : 'border-outline-variant/20 bg-surface-container-low/30 hover:border-outline-variant/60 hover:bg-surface-container-low/60'
                }`}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${mood.bg} ${mood.text}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{mood.icon}</span>
                  </div>

                  <div>
                    <span className="font-bold text-[14px] text-on-surface block">
                      {formatIndonesianDate(item.date)}
                    </span>

                    <span className="text-[12px] text-on-surface-variant line-clamp-1 mt-0.5 max-w-[200px] sm:max-w-[320px] italic">
                      {item.journal ? `"${item.journal}"` : 'Tidak ada catatan jurnal'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-[12px] text-on-surface-variant font-medium block">
                      Skor:{' '}
                      <span className="font-bold text-on-surface">
                        {item.burnoutScore}
                      </span>
                    </span>

                    <span className="text-[11px] text-on-surface-variant font-medium block">
                      Mood:{' '}
                      <span className="font-bold text-on-surface">
                        {normalizeMoodEmotion(item.emotion) || '-'}
                      </span>
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${risk.badge}`}>
                    {risk.text}
                  </span>
                </div>
              </button>
            )
          })}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1.5 mt-auto pt-6 border-t border-outline-variant/10">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed text-on-surface transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1
                const isActive = page === currentPage

                return (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`w-8 h-8 rounded-full text-[13px] font-bold transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                        : 'border border-outline-variant/30 hover:bg-surface-container-low text-on-surface-variant'
                    }`}
                    type="button"
                  >
                    {page}
                  </button>
                )
              })}

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed text-on-surface transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function MoodMapPage() {
  const location = useLocation()
  const isHistorySection = location.search.includes('section=history')

  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const todayStr = `${yyyy}-${mm}-${dd}`
  const currentMonthStr = `${yyyy}-${mm}`

  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr)
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [historyList, setHistoryList] = useState<DailyHistory[]>([])
  const [journalsList, setJournalsList] = useState<Journal[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)

        const [checkins, journals] = await Promise.all([getCheckIns(), getJournals()])

        setJournalsList(journals)

        const dates = Array.from(
          new Set([...checkins.map((c) => c.date), ...journals.map((j) => j.date)])
        ).sort((a, b) => b.localeCompare(a))

        const merged: DailyHistory[] = dates.map((date) => {
          const c = checkins.find((x) => x.date === date)
          const js = journals.filter((x) => x.date === date)

          const journalText = js.map((j) => j.content).join('\n')

          const journalEmotion =
            normalizeMoodEmotion(js.find((j) => j.detectedEmotion)?.detectedEmotion) || ''

          return {
            date,
            journal: journalText,
            emotion: journalEmotion,
            burnoutScore: c ? (c.score_assessment ?? c.burnoutScore ?? 0) : 0,
            riskLevel: c ? normalizeRiskLevel(c.riskLevel) : 'Rendah',
          }
        })

        setHistoryList(merged)
      } catch (err) {
        console.error('Failed to load mood map history:', err)
      } finally {
        setIsLoading(false)
      }
    }

    void loadData()
  }, [])

  const monthlyData = useMemo(() => {
    return historyList.filter((item) => item.date.startsWith(selectedMonth))
  }, [historyList, selectedMonth])

  const selectedHistoryItem = useMemo(() => {
    return historyList.find((item) => item.date === selectedDate) || null
  }, [historyList, selectedDate])

  const selectedDateJournals = useMemo(() => {
    return journalsList.filter((journal) => journal.date === selectedDate)
  }, [journalsList, selectedDate])

  useEffect(() => {
    if (isHistorySection) {
      setTimeout(() => {
        const element = document.getElementById('riwayat-harian')

        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)
    }
  }, [isHistorySection])

  const handleMonthChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const month = e.target.value

    setSelectedMonth(month)
    setSelectedDate(`${month}-01`)
    setCurrentPage(1)
  }

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)

    const index = monthlyData.findIndex((item) => item.date === date)

    if (index >= 0) {
      const pageIndex = Math.floor(index / 3) + 1
      setCurrentPage(pageIndex)
    }
  }

  const monthOptions = useMemo(() => {
    const options = []

    const months = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ]

    const d = new Date()
    d.setDate(1)

    for (let i = 0; i < 6; i++) {
      const year = d.getFullYear()
      const monthNum = d.getMonth() + 1
      const val = `${year}-${String(monthNum).padStart(2, '0')}`
      const label = `${months[d.getMonth()]} ${year}`

      options.push({ val, label })

      d.setMonth(d.getMonth() - 1)
    }

    return options
  }, [])

  if (isLoading) {
    return (
      <DashboardLayout
        currentPath={isHistorySection ? '/mood-map?section=history' : '/mood-map'}
        topbarTitle="Pemetaan Mood & Riwayat"
      >
        <div className="min-h-[50vh] grid place-items-center">
          <div className="w-12 h-12 rounded-full border-4 border-surface-container-high border-t-primary animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      currentPath={isHistorySection ? '/mood-map?section=history' : '/mood-map'}
      topbarTitle="Pemetaan Mood & Riwayat"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2 font-bold">
            Pemetaan Mood & Riwayat Harian
          </h2>

          <p className="font-body-md text-body-md text-on-surface-variant">
            Lacak mood harian, refleksikan jurnal, dan tinjau riwayat skor burnout Anda.
          </p>
        </div>

        <div className="relative">
          <select
            value={selectedMonth}
            onChange={handleMonthChange}
            className="appearance-none bg-surface-container-lowest border border-outline-variant text-on-surface font-label-md text-label-md py-2.5 pl-4 pr-10 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none shadow-sm cursor-pointer hover:bg-surface-container-low transition-colors"
          >
            {monthOptions.map((opt) => (
              <option key={opt.val} value={opt.val}>
                {opt.label}
              </option>
            ))}
          </select>

          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[20px]">
            expand_more
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <MoodCalendar
          selectedMonth={selectedMonth}
          selectedDate={selectedDate}
          historyList={historyList}
          onSelectDate={handleSelectDate}
        />

        <div className="lg:col-span-4 flex flex-col gap-6">
          <MoodSummary monthlyData={monthlyData} />
          <MoodStats monthlyData={monthlyData} />
          <MoodInsightCard monthlyData={monthlyData} />
        </div>
      </div>

      <div id="riwayat-harian" className="scroll-mt-6 border-t border-outline-variant/20 pt-8">
        <div className="mb-6">
          <h3 className="font-headline-md text-[20px] font-bold text-on-surface mb-1">
            Section Riwayat Harian
          </h3>

          <p className="text-body-md text-on-surface-variant">
            Pilih tanggal di kalender atas untuk meninjau detail log jurnaling, emosi dominan,
            dan tingkat burnout.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-5">
            <SelectedDateDetail
              selectedDate={selectedDate}
              historyItem={selectedHistoryItem}
              journals={selectedDateJournals}
            />
          </div>

          <div className="lg:col-span-7">
            <HistoryList
              monthlyData={monthlyData}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              selectedDate={selectedDate}
              onSelectDate={handleSelectDate}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
