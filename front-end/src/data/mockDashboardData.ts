export interface WeeklyTrendItem {
  day: string
  value: number // 0-100 percentage score
}

export interface DailyMetricItem {
  title: string
  value: string
  icon: string
  iconBgClass: string
  iconColorClass: string
}

export interface JournalMockItem {
  timeLabel: string
  content: string
}

export const WEEKLY_TREND_MOCK: WeeklyTrendItem[] = [
  { day: 'Sen', value: 80 },
  { day: 'Sel', value: 0 },
  { day: 'Rab', value: 0 },
  { day: 'Kam', value: 0 },
  { day: 'Jum', value: 0 },
  { day: 'Sab', value: 0 },
  { day: 'Min', value: 0 },
]

export const DAILY_METRICS_MOCK: DailyMetricItem[] = [
  {
    title: 'Jam Tidur',
    value: '6 Jam 45 Menit',
    icon: 'bedtime',
    iconBgClass: 'bg-inverse-primary/30',
    iconColorClass: 'text-primary',
  },
  {
    title: 'Jam Kerja',
    value: '8 Jam 10 Menit',
    icon: 'work',
    iconBgClass: 'bg-surface-container-high',
    iconColorClass: 'text-on-surface-variant',
  },
]

export const LAST_JOURNAL_MOCK: JournalMockItem = {
  timeLabel: 'Kemarin, 20:30 WIB',
  content: 'Hari ini cukup melelahkan karena banyak meeting, tapi bersyukur bisa menyelesaikan task utama sebelum jam 5 sore. Sedikit cemas dengan presentasi besok...',
}

export interface TodayCheckIn {
  sleepHours: number
  workHours: number
  burnoutScore: number
  riskLevel: 'Rendah' | 'Sedang' | 'Tinggi'
  completed: boolean
}

export interface TomorrowPrediction {
  predictionScore: number
  riskLevel: 'Rendah' | 'Sedang' | 'Tinggi'
  recommendation: string
}

export interface DashboardState {
  todayCheckIn: TodayCheckIn | null
  tomorrowPrediction: TomorrowPrediction
  burnoutScore: number
  riskLevel: 'Rendah' | 'Sedang' | 'Tinggi'
  warningTrend: string[]
}

export function getRiskLevel(score: number): 'Rendah' | 'Sedang' | 'Tinggi' {
  if (score > 70) return 'Tinggi'
  if (score >= 40) return 'Sedang'
  return 'Rendah'
}

export function generateWarningTrend(trend: WeeklyTrendItem[], tomorrowScore: number): string[] {
  const warnings: string[] = []
  
  if (trend.length >= 3) {
    const len = trend.length
    const val1 = trend[len - 1].value
    const val2 = trend[len - 2].value
    const val3 = trend[len - 3].value
    if (val1 > val2 && val2 > val3) {
      warnings.push("Burnout meningkat dalam 3 hari terakhir")
    }
  }

  if (tomorrowScore > 70) {
    warnings.push("Skor melewati batas aman (> 70)")
    warnings.push("Risiko burnout esok hari tergolong tinggi")
  } else if (tomorrowScore >= 40) {
    warnings.push("Risiko burnout esok hari tergolong sedang")
  }

  if (tomorrowScore > 70) {
    warnings.push("Perlu istirahat segera atau evaluasi rutinitas harian Anda")
  } else if (tomorrowScore >= 40) {
    warnings.push("Disarankan untuk mengambil jeda istirahat ringan di sela aktivitas")
  } else {
    warnings.push("Kondisi Anda cukup stabil, pertahankan pola istirahat yang baik")
  }

  return warnings
}

