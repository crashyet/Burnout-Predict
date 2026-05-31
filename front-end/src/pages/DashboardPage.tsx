import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { getCurrentUser } from '../services/authService'
import { getCheckIns, getJournals, getLocalDateString } from '../services/trackingService'
import type { CheckIn, Journal } from '../types/tracking'
import { type TodayCheckIn, type TomorrowPrediction } from '../data/mockDashboardData'

interface RiskConfig {
  label: string
  bgGradient: string
  borderColor: string
  badgeClass: string
  iconName: string
  microcopy: string
  ctaText: string
  circleStroke: string
}

const RISK_CONFIGS: Record<'Rendah' | 'Sedang' | 'Tinggi', RiskConfig> = {
  Rendah: {
    label: 'Rendah',
    bgGradient: 'from-emerald-50/60 via-teal-50/40 to-surface-container-lowest',
    borderColor: 'border-emerald-200/40',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200/50',
    iconName: 'spa',
    microcopy: 'Kondisi burnout kamu tergolong rendah. Tetap jaga keseimbangan aktivitas dan lakukan aktivitas yang menenangkan.',
    ctaText: 'Mulai Check-In Hari Ini',
    circleStroke: '#10b981', // emerald-500
  },
  Sedang: {
    label: 'Sedang',
    bgGradient: 'from-amber-50/60 via-orange-50/40 to-surface-container-lowest',
    borderColor: 'border-amber-200/40',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200/50',
    iconName: 'sentiment_neutral',
    microcopy: 'Ada indikasi kelelahan sedang. Sempatkan untuk beristirahat sejenak dan kelola beban kerjamu hari ini.',
    ctaText: 'Perbarui Lewat Check-In',
    circleStroke: '#f59e0b', // amber-500
  },
  Tinggi: {
    label: 'Tinggi',
    bgGradient: 'from-rose-50/60 via-red-50/40 to-surface-container-lowest',
    borderColor: 'border-rose-200/40',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200/50',
    iconName: 'sentiment_dissatisfied',
    microcopy: 'Tingkat burnout terdeteksi tinggi. Tubuhmu butuh istirahat segera. Luangkan waktu untuk pulih dan kurangi beban stres.',
    ctaText: 'Isi Check-In Hari Ini',
    circleStroke: '#f43f5e', // rose-500
  },
}

function PredictionSpotlight({
  prediction,
}: {
  prediction: TomorrowPrediction
}) {
  const risk = prediction.riskLevel
  const config = RISK_CONFIGS[risk]
  
  const score = Math.max(0, Math.min(100, prediction.predictionScore))
  const circleLength = 251.2
  const circleOffset = circleLength - (score / 100) * circleLength

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter md:gap-6 mb-section-gap">
      {/* Left Card: Spotlight */}
      <div className={`col-span-1 md:col-span-8 bg-gradient-to-br ${config.bgGradient} rounded-xl p-6 shadow-ambient-1 border ${config.borderColor} transition-colors duration-300`}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">psychology</span> Prediksi Burnout di Esok Hari
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 sm:items-center">
          <div className="flex-1">
            <p className="font-body-md text-body-md text-on-surface-variant mb-2">Status risiko esok hari</p>
            <p className="font-headline-lg md:font-headline-xl text-headline-lg-mobile md:text-headline-xl text-on-surface mb-2">
              Risiko Burnout {risk}
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4 leading-relaxed">
              {config.microcopy}
            </p>
            <div className={`inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-bold ${config.badgeClass}`}>
              <span className="material-symbols-outlined text-[16px] mr-1.5">{config.iconName}</span>
              Level Risiko: {risk}
            </div>

            {/* High Burnout Score Warning Callout */}
            {risk === 'Tinggi' && (
              <div className="mt-4 bg-error-container text-on-error-container rounded-xl p-4 border border-error/20 flex items-start gap-3 shadow-sm animate-pulse">
                <span className="material-symbols-outlined text-error font-bold shrink-0">warning</span>
                <div>
                  <h4 className="font-label-md text-label-md font-bold text-error">Warning: Batas Aman Terlewati!</h4>
                  <p className="font-body-sm text-xs mt-0.5 text-on-surface-variant leading-relaxed">
                    Skor burnout esok hari diprediksi sangat tinggi ({score}%). Anda sangat disarankan untuk menghentikan pekerjaan lembur hari ini, beristirahat secara penuh, dan melakukan relaksasi.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#eff4ff" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke={config.circleStroke}
                  strokeWidth="8"
                  strokeDasharray={circleLength}
                  strokeDashoffset={circleOffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <p className="font-headline-md text-headline-md font-bold leading-none animate-bounce" style={{ color: config.circleStroke }}>
                    {score}%
                  </p>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">Skor Prediksi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Card: Recommendation */}
      <div className="col-span-1 md:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-ambient-1 border border-outline-variant/20 flex flex-col justify-between">
        <div>
          <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[18px]">tips_and_updates</span> Rekomendasi Utama
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-6">{prediction.recommendation}</p>
        </div>
        <div>
          <Link
            to="/daily-checkin"
            className="font-label-md text-label-md text-primary hover:text-primary-container px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 -ml-4"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            {config.ctaText}
          </Link>
        </div>
      </div>
    </div>
  )
}

function TodayCheckInSummary({
  todayCheckIn,
}: {
  todayCheckIn: TodayCheckIn | null
}) {
  return (
    <div className="mb-section-gap">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">today</span>
          Kondisi & Ringkasan Check-In Hari Ini
        </h3>
      </div>

      {!todayCheckIn && (
        <div className="bg-amber-50/60 border border-amber-200/50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 shadow-ambient-1">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600">warning</span>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Anda belum melakukan check-in hari ini. Data di bawah ini menggunakan estimasi/mock default.
            </p>
          </div>
          <Link
            to="/daily-checkin"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-white font-label-md text-label-md shadow-md shadow-primary/20 hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            Mulai Check-In Sekarang
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter md:gap-6">
        {/* Card 1: Skor Burnout Hari Ini + Level Risiko */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient-1 border border-outline-variant/15 flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Skor Burnout Hari Ini</p>
            <div className="flex items-baseline gap-2">
              <span className="font-headline-md text-headline-md text-on-surface">
                {todayCheckIn ? todayCheckIn.burnoutScore : '0'}
              </span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                (todayCheckIn ? todayCheckIn.riskLevel : 'Rendah') === 'Tinggi'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200/50'
                  : (todayCheckIn ? todayCheckIn.riskLevel : 'Rendah') === 'Sedang'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200/50'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200/50'
              }`}>
                {(todayCheckIn ? todayCheckIn.riskLevel : 'Rendah')}
              </span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            (todayCheckIn ? todayCheckIn.riskLevel : 'Rendah') === 'Tinggi'
              ? 'bg-rose-100/50 text-rose-600'
              : (todayCheckIn ? todayCheckIn.riskLevel : 'Rendah') === 'Sedang'
                ? 'bg-amber-100/50 text-amber-600'
                : 'bg-emerald-100/50 text-emerald-600'
          }`}>
            <span className="material-symbols-outlined">monitor_heart</span>
          </div>
        </div>

        {/* Card 2: Sleep Hours */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient-1 border border-outline-variant/15 flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Jam Tidur Hari Ini</p>
            <p className="font-headline-md text-headline-md text-on-surface">
              {todayCheckIn ? `${todayCheckIn.sleepHours} Jam` : '0 Jam'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-inverse-primary/30 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">bedtime</span>
          </div>
        </div>

        {/* Card 3: Work Hours */}
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient-1 border border-outline-variant/15 flex items-center justify-between">
          <div>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase mb-1">Jam Kerja Hari Ini</p>
            <p className="font-headline-md text-headline-md text-on-surface">
              {todayCheckIn ? `${todayCheckIn.workHours} Jam` : '0 Jam'}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined">work</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function WeeklyTrendChart({ checkins }: { checkins: CheckIn[] }) {
  const getDayLabel = (dateStr: string): string => {
    try {
      const date = new Date(dateStr)
      const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
      return days[date.getDay()]
    } catch {
      return 'H'
    }
  }

  const chartData = []
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    
    const c = checkins.find((checkin) => {
      const cDate = checkin.createdAt ? checkin.createdAt.split('T')[0] : checkin.date
      return cDate === dateStr
    })
    
    chartData.push({
      day: getDayLabel(d.toISOString()),
      // value: c ? (c.score_assessment ?? c.burnoutScore ?? 0) : 0,
      value: c ? (c.burnoutScore ?? c.score_assessment ?? 0) : 0,
      isEmpty: !c
    })
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient-1 flex flex-col border border-outline-variant/15 h-[300px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">query_stats</span>
          Tren Prediksi Burnout
        </h3>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        {/* Chart Bars */}
        <div className="flex-1 relative w-full h-32 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-outline-variant/20">
          {chartData.map((bar, index) => {
            let barColor = 'bg-primary/30 hover:bg-primary/50'
            if (bar.value >= 70) {
              barColor = 'bg-rose-500/30 hover:bg-rose-500/50'
            } else if (bar.value >= 40) {
              barColor = 'bg-amber-500/30 hover:bg-amber-500/50'
            } else if (bar.isEmpty) {
              barColor = 'bg-surface-container-high/20'
            }

            return (
              <div key={index} className="flex-1 h-full flex flex-col justify-end group relative">
                {!bar.isEmpty && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                    {bar.value}%
                  </div>
                )}
                <div
                  style={{ height: bar.isEmpty ? '4%' : `${bar.value}%` }}
                  className={`w-full rounded-t-md transition-all duration-300 ${barColor}`}
                />
              </div>
            )
          })}
        </div>
        
        {/* Permanent Day Labels */}
        <div className="flex justify-between items-center pt-2 px-2">
          {chartData.map((bar, index) => (
            <div key={index} className="flex-1 text-center font-label-sm text-label-sm text-on-surface-variant font-medium">
              {bar.day}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TrenWarning({ warnings }: { warnings: string[] }) {
  const hasHighRisk = warnings.some(w => w.includes('tinggi') || w.includes('batas aman') || w.includes('meningkat') || w.includes('serius') || w.includes('cukup tinggi'));

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient-1 border border-outline-variant/15 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
          <span className={`material-symbols-outlined text-[18px] ${hasHighRisk ? 'text-error animate-pulse' : 'text-primary'}`}>
            warning
          </span>
          Tren Warning
        </h3>
      </div>
      
      <div className="flex-1 flex flex-col gap-3">
        {warnings.length > 0 ? (
          warnings.map((warning, index) => {
            const isHigh = warning.includes('tinggi') || warning.includes('batas aman') || warning.includes('meningkat') || warning.includes('serius') || warning.includes('cukup tinggi');
            return (
              <div
                key={index}
                className={`flex items-start gap-2.5 p-3 rounded-lg border transition-all ${
                  isHigh 
                    ? 'bg-error-container/30 border-error/20 text-on-error-container shadow-sm' 
                    : 'bg-surface-container-low/50 border-outline-variant/10 text-on-surface-variant'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${isHigh ? 'text-error' : 'text-primary'}`}>
                  {isHigh ? 'error' : 'info'}
                </span>
                <span className="font-body-md text-xs leading-normal font-semibold">
                  {warning}
                </span>
              </div>
            )
          })
        ) : (
          <div className="text-center py-6 text-on-surface-variant font-body-md text-sm">
            <span className="material-symbols-outlined text-emerald-500 text-3xl mb-2">check_circle</span>
            <p>Semua tren terpantau aman dan stabil.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function JournalAndInsight({ lastJournal }: { lastJournal: Journal | null }) {
  const formattedTime = lastJournal 
    ? new Date(lastJournal.createdAt || lastJournal.date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    : ''

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter md:gap-6 mb-section-gap">
      {/* Left Column: Last Journal */}
      <div className="lg:col-span-3 bg-surface-container-lowest rounded-xl p-6 shadow-ambient-1 relative overflow-hidden border border-outline-variant/15 flex flex-col justify-between min-h-[220px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/30 rounded-bl-full -mr-10 -mt-10 pointer-events-none" />
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 relative z-10">
            <h3 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                book
              </span>{' '}
              Jurnal Terakhir
            </h3>
            <Link
              to="/mood-map"
              className="font-label-md text-label-md text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-full transition-colors z-10"
            >
              Lihat Riwayat & Tulis Jurnal
            </Link>
          </div>
          {lastJournal ? (
            <div className="border-l-2 border-surface-container-high pl-4 py-1 relative z-10">
              <p className="font-label-sm text-label-sm text-on-surface-variant mb-2">{formattedTime}</p>
              <p className="font-body-md text-body-md text-on-surface-variant italic">
                "{lastJournal.content}"
              </p>
              {lastJournal.detectedEmotion && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary-container text-on-secondary-container px-3 py-1 text-xs font-semibold">
                  <span className="material-symbols-outlined text-[14px]">sentiment_satisfied</span>
                  Emosi: {lastJournal.detectedEmotion}
                </div>
              )}
            </div>
          ) : (
            <div className="py-4 text-center text-on-surface-variant relative z-10">
              <span className="material-symbols-outlined text-4xl text-outline-variant/60 mb-2">edit_note</span>
              <p className="text-sm font-medium">Belum ada catatan jurnal. Mulai tulis jurnal hari ini untuk mencatat perasaan Anda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const [checkins, setCheckins] = useState<CheckIn[]>([])
  const [journals, setJournals] = useState<Journal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const currentUser = getCurrentUser()

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        setIsLoading(true)
        setIsError(false)
        
        const [fetchedCheckins, fetchedJournals] = await Promise.all([
          getCheckIns(),
          getJournals()
        ])

        if (!mounted) return

        setCheckins(fetchedCheckins)
        setJournals(fetchedJournals)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        if (mounted) {
          setIsError(true)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    void loadData()
    return () => {
      mounted = false
    }
  }, [])

  const todayStr = getLocalDateString()
  
  // 1. Find if today's check-in exists
  const todayCheckIn = useMemo(() => {
    return checkins.find((c) => {
      const cDate = c.createdAt ? c.createdAt.split('T')[0] : c.date
      return cDate === todayStr
    }) || null
  }, [checkins, todayStr])

  // 2. Tomorrow's prediction
  const tomorrowPrediction = useMemo(() => {
    const latest = checkins[0] // most recent check-in
    const score = latest?.burnoutScore ?? 0
    const rawRisk = latest?.riskLevel ?? 'Rendah'
    
    const riskMap: Record<string, 'Rendah' | 'Sedang' | 'Tinggi'> = {
      'tinggi': 'Tinggi',
      'high': 'Tinggi',
      'sedang': 'Sedang',
      'moderate': 'Sedang',
      'medium': 'Sedang',
      'rendah': 'Rendah',
      'low': 'Rendah'
    }
    const risk = riskMap[rawRisk.toLowerCase()] || 'Rendah'
    
    let recommendation = 'Mulai lakukan check-in harian pertama Anda untuk memprediksi tingkat burnout.'
    if (latest) {
      recommendation = latest.dashboardRecommendation || latest.note || latest.warning || 'Kondisi Anda cukup stabil, pertahankan pola istirahat yang baik.'
    }

    return {
      predictionScore: score,
      riskLevel: risk,
      recommendation
    }
  }, [checkins])

  // 3. Today's Checkin Summary
  const todayCheckInSummaryData = useMemo(() => {
    if (!todayCheckIn) return null
    
    const score = todayCheckIn.score_assessment ?? todayCheckIn.burnoutScore ?? 0
    const risk: 'Rendah' | 'Sedang' | 'Tinggi' = score > 70 ? 'Tinggi' : score >= 40 ? 'Sedang' : 'Rendah'

    return {
      sleepHours: todayCheckIn.sleep_hours,
      workHours: todayCheckIn.work_hours ?? 8,
      burnoutScore: score,
      riskLevel: risk,
      completed: true
    }
  }, [todayCheckIn])

  // 4. Trend Warnings
  const warningTrend = useMemo(() => {
    const warnings: string[] = []
    const recent = checkins.slice(0, 3)
    for (const c of recent) {
      if (c.warning && !warnings.includes(c.warning)) {
        warnings.push(c.warning)
      }
    }
    return warnings
  }, [checkins])

  // 5. Last Journal
  const lastJournal = useMemo(() => {
    return journals[0] || null
  }, [journals])

  if (isLoading) {
    return (
      <DashboardLayout currentPath="/dashboard">
        <div className="bg-surface-container-lowest rounded-xl p-7 shadow-ambient-1 mb-section-gap border border-outline-variant/10 mt-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-4 w-44 bg-surface-container-high rounded" />
            <div className="h-8 w-72 bg-surface-container-high rounded" />
            <div className="h-24 w-full bg-surface-container-high rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (isError) {
    return (
      <DashboardLayout currentPath="/dashboard">
        <div className="bg-surface-container-lowest rounded-xl p-7 shadow-ambient-1 mb-section-gap border border-error/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
          <div>
            <h3 className="font-headline-md text-headline-md text-error mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined">error</span> Gagal Memuat Dashboard
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Terjadi kesalahan saat memuat data dashboard. Silakan coba kembali beberapa saat lagi.
            </p>
          </div>
          <Link
            to="/daily-checkin"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-on-primary font-label-md text-label-md shadow-lg shadow-primary/20 hover:opacity-95 whitespace-nowrap transition-opacity"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Mulai Check-In Hari Ini
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentPath="/dashboard">
      {/* 1. Header sapaan / ringkasan */}
      <div className="mb-8 pt-4">
        <h2 className="font-headline-lg md:font-headline-xl text-headline-lg-mobile md:text-headline-xl text-on-surface mb-2">
          Halo, {currentUser?.name || 'selamat datang kembali'}{' '}
          <span className="material-symbols-outlined text-tertiary-fixed-dim align-middle" style={{ fontVariationSettings: "'FILL' 1" }}>
            waving_hand
          </span>
        </h2>
        <p className="font-body-md md:font-body-lg text-body-md md:text-body-lg text-on-surface-variant">
          Yuk pantau prediksi burnout esok hari dan kelola energimu sejak hari ini.
        </p>
      </div>

      {/* 2. Spotlight: Prediksi Burnout di Esok Hari */}
      <PredictionSpotlight prediction={tomorrowPrediction} />

      {/* 3. Ringkasan check-in hari ini & Skor Burnout Hari Ini + level risikonya */}
      <TodayCheckInSummary todayCheckIn={todayCheckInSummaryData} />

      {/* 4. Tren Burnout mingguan & 5. Tren Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter md:gap-6 mb-section-gap">
        <div className="lg:col-span-2">
          <WeeklyTrendChart checkins={checkins} />
        </div>
        <div className="lg:col-span-1">
          <TrenWarning warnings={warningTrend} />
        </div>
      </div>

      {/* 6. Journal terakhir / insight singkat jika sudah ada */}
      <JournalAndInsight lastJournal={lastJournal} />

      {/* Floating Sticky CTA */}
      <div className="fixed bottom-24 right-6 md:bottom-12 md:right-12 z-40">
        <Link
          to="/daily-checkin"
          className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md px-6 py-4 rounded-full shadow-lg shadow-primary/30 flex items-center gap-3 transition-transform hover:-translate-y-1 inline-flex"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            add_circle
          </span>
          Mulai Check-In Hari Ini
        </Link>
      </div>
    </DashboardLayout>
  )
}
