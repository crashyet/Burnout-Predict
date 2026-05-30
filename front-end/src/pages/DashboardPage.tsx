import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { getLatestPrediction } from '../services/assessmentService'
import { getCurrentUser } from '../services/authService'
import {
  WEEKLY_TREND_MOCK,
  LAST_JOURNAL_MOCK,
  getRiskLevel,
  generateWarningTrend,
  type DashboardState,
  type TodayCheckIn,
  type TomorrowPrediction
} from '../data/mockDashboardData'

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

function getDashboardState(
  latestPrediction: { prediction_score: number; risk_level: string; recommendation: string } | null,
  todayCheckInFromStorage: { sleepHours: number; workHours: number; score: number; risk: 'Rendah' | 'Sedang' | 'Tinggi' } | null
): DashboardState {
  if (!todayCheckInFromStorage) {
    const predScore = latestPrediction?.prediction_score ?? 68
    const predRisk = getRiskLevel(predScore)
    const recommendation = latestPrediction?.recommendation ?? 'Ambil jeda istirahat teratur dan batasi waktu kerja agar tidak berlebihan.'

    return {
      todayCheckIn: null,
      tomorrowPrediction: {
        predictionScore: predScore,
        riskLevel: predRisk,
        recommendation: recommendation
      },
      burnoutScore: 0,
      riskLevel: 'Rendah',
      warningTrend: generateWarningTrend(WEEKLY_TREND_MOCK, predScore)
    }
  }

  const todayScore = todayCheckInFromStorage.score
  const sleep = todayCheckInFromStorage.sleepHours
  const work = todayCheckInFromStorage.workHours
  
  // Calculate tomorrow's score based on today's metrics
  let tomorrowScore = todayScore
  if (sleep < 6) {
    tomorrowScore += 10
  }
  if (work > 8) {
    tomorrowScore += 12
  }
  if (sleep >= 7 && work <= 8) {
    tomorrowScore -= 15
  }
  
  // Clamp score
  tomorrowScore = Math.max(0, Math.min(100, Math.round(tomorrowScore)))
  const tomorrowRisk = getRiskLevel(tomorrowScore)

  let recommendation = ''
  if (tomorrowRisk === 'Tinggi') {
    recommendation = 'Tingkat burnout terdeteksi tinggi untuk esok hari. Segera kurangi aktivitas malam ini, luangkan waktu untuk relaksasi penuh, dan pastikan tidur cukup.'
  } else if (tomorrowRisk === 'Sedang') {
    recommendation = 'Risiko burnout sedang terdeteksi. Batasi jam kerja lembur hari ini, luangkan waktu 15-30 menit untuk bersantai, dan tidur cukup 7-8 jam.'
  } else {
    recommendation = 'Kondisi Anda sangat baik untuk esok hari. Pertahankan pola tidur yang cukup dan teruskan rutinitas seimbang yang sedang Anda jalani.'
  }

  return {
    todayCheckIn: {
      sleepHours: sleep,
      workHours: work,
      burnoutScore: todayScore,
      riskLevel: todayCheckInFromStorage.risk,
      completed: true
    },
    tomorrowPrediction: {
      predictionScore: tomorrowScore,
      riskLevel: tomorrowRisk,
      recommendation: recommendation
    },
    burnoutScore: todayScore,
    riskLevel: todayCheckInFromStorage.risk,
    warningTrend: generateWarningTrend(WEEKLY_TREND_MOCK, tomorrowScore)
  }
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
                {todayCheckIn ? todayCheckIn.burnoutScore : '60'}
              </span>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                (todayCheckIn ? todayCheckIn.riskLevel : 'Sedang') === 'Tinggi'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200/50'
                  : (todayCheckIn ? todayCheckIn.riskLevel : 'Sedang') === 'Sedang'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200/50'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200/50'
              }`}>
                {(todayCheckIn ? todayCheckIn.riskLevel : 'Sedang')}
              </span>
            </div>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            (todayCheckIn ? todayCheckIn.riskLevel : 'Sedang') === 'Tinggi'
              ? 'bg-rose-100/50 text-rose-600'
              : (todayCheckIn ? todayCheckIn.riskLevel : 'Sedang') === 'Sedang'
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
              {todayCheckIn ? `${todayCheckIn.sleepHours} Jam` : '6 Jam 45 Mnt'}
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
              {todayCheckIn ? `${todayCheckIn.workHours} Jam` : '8 Jam 10 Mnt'}
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

function WeeklyTrendChart() {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-ambient-1 flex flex-col border border-outline-variant/15 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">query_stats</span>
          Tren Prediksi Burnout
        </h3>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        {/* Chart Bars */}
        <div className="flex-1 relative w-full h-32 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-outline-variant/20">
          {WEEKLY_TREND_MOCK.map((bar, index) => {
            let barColor = 'bg-primary/30 hover:bg-primary/50'
            if (bar.value >= 80) {
              barColor = 'bg-error/30 hover:bg-error/50'
            } else if (bar.value >= 40) {
              barColor = 'bg-secondary/30 hover:bg-secondary/50'
            }

            return (
              <div key={index} className="flex-1 h-full flex flex-col justify-end group relative">
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] font-bold px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {bar.value}%
                </div>
                <div
                  style={{ height: `${bar.value}%` }}
                  className={`w-full rounded-t-md transition-all duration-300 ${barColor}`}
                />
              </div>
            )
          })}
        </div>
        
        {/* Permanent Day Labels */}
        <div className="flex justify-between items-center pt-2 px-2">
          {WEEKLY_TREND_MOCK.map((bar, index) => (
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
  const hasHighRisk = warnings.some(w => w.includes('tinggi') || w.includes('batas aman') || w.includes('meningkat'));

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
      
      <div className="flex-1 flex flex-col gap-3 justify-center">
        {warnings.length > 0 ? (
          warnings.map((warning, index) => {
            const isHigh = warning.includes('tinggi') || warning.includes('batas aman') || warning.includes('meningkat');
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

function JournalAndInsight() {
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
              to="/mood-map?section=history"
              className="font-label-md text-label-md text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-full transition-colors z-10"
            >
              Lihat Riwayat
            </Link>
          </div>
          <div className="border-l-2 border-surface-container-high pl-4 py-1 relative z-10">
            <p className="font-label-sm text-label-sm text-on-surface-variant mb-2">{LAST_JOURNAL_MOCK.timeLabel}</p>
            <p className="font-body-md text-body-md text-on-surface-variant italic">
              "{LAST_JOURNAL_MOCK.content}"
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const [dashboardState, setDashboardState] = useState<DashboardState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const currentUser = getCurrentUser()

  useEffect(() => {
    let mounted = true

    const loadData = async () => {
      try {
        setIsLoading(true)
        setIsError(false)
        
        const result = await getLatestPrediction()
        
        let localCheckIn: { sleepHours: number; workHours: number; score: number; risk: 'Rendah' | 'Sedang' | 'Tinggi' } | null = null
        try {
          const stored = localStorage.getItem('today_checkin')
          if (stored) {
            const parsed = JSON.parse(stored)
            localCheckIn = {
              sleepHours: parsed.sleepHours,
              workHours: parsed.workHours,
              score: parsed.score,
              risk: parsed.risk
            }
          }
        } catch (e) {
          console.error('Error reading localStorage checkin:', e)
        }

        if (!mounted) return

        const computedState = getDashboardState(result.prediction, localCheckIn)
        setDashboardState(computedState)
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

  if (isError || !dashboardState) {
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
      <PredictionSpotlight prediction={dashboardState.tomorrowPrediction} />

      {/* 3. Ringkasan check-in hari ini & Skor Burnout Hari Ini + level risikonya */}
      <TodayCheckInSummary todayCheckIn={dashboardState.todayCheckIn} />

      {/* 4. Tren Burnout mingguan & 5. Tren Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter md:gap-6 mb-section-gap">
        <div className="lg:col-span-2">
          <WeeklyTrendChart />
        </div>
        <div className="lg:col-span-1">
          <TrenWarning warnings={dashboardState.warningTrend} />
        </div>
      </div>

      {/* 6. Journal terakhir / insight singkat jika sudah ada */}
      <JournalAndInsight />

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

