import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { type DailyHistory } from '../services/historyService'
import { getCheckIns, getJournals } from '../services/trackingService'
import type { Journal } from '../types/tracking'

const MOOD_CONFIG: Record<string, { bg: string; text: string; label: string; icon: string }> = {
  Tenang: { bg: 'mood-tenang', text: '', label: 'Tenang', icon: 'spa' },
  Bahagia: { bg: 'mood-bahagia', text: '', label: 'Bahagia', icon: 'sentiment_very_satisfied' },
  Senang: { bg: 'mood-bahagia', text: '', label: 'Bahagia', icon: 'sentiment_very_satisfied' }, // Synonym
  Cemas: { bg: 'mood-cemas', text: '', label: 'Cemas', icon: 'sentiment_dissatisfied' },
  Lelah: { bg: 'mood-lelah', text: '', label: 'Lelah', icon: 'battery_alert' },
  Stres: { bg: 'mood-stres', text: '', label: 'Stres', icon: 'warning' },
  Sedih: { bg: 'mood-sedih', text: '', label: 'Sedih', icon: 'sentiment_very_dissatisfied' },
}

const RISK_BADGES: Record<'Rendah' | 'Sedang' | 'Tinggi', { badge: string; text: string }> = {
  Rendah: { badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20', text: 'Rendah' },
  Sedang: { badge: 'bg-amber-500/10 text-amber-700 border-amber-500/20', text: 'Sedang' },
  Tinggi: { badge: 'bg-rose-500/10 text-rose-700 border-rose-500/20', text: 'Tinggi' },
}

function formatIndonesianDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-')
    const year = parts[0]
    const monthIndex = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
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
    const month = parseInt(monthStr, 10) - 1 // 0-indexed

    // Calculate days in month
    const totalDays = new Date(year, month + 1, 0).getDate()

    // Calculate start day offset (Monday = 0, Sunday = 6)
    const rawStartDay = new Date(year, month, 1).getDay()
    const startDayOffset = rawStartDay === 0 ? 6 : rawStartDay - 1

    const listCells = []

    // Empty offset cells
    for (let i = 0; i < startDayOffset; i++) {
      listCells.push({ day: '', dateStr: '', hasData: false, className: 'bg-transparent cursor-default' })
    }

    // Populate actual days
    for (let d = 1; d <= totalDays; d++) {
      const dStr = d < 10 ? `0${d}` : `${d}`
      const dateStr = `${selectedMonth}-${dStr}`
      const historyItem = historyList.find((h) => h.date === dateStr)

      let cellClass = 'text-on-surface-variant'
      let moodEmotion = ''

      if (historyItem) {
        moodEmotion = historyItem.emotion
        const config = MOOD_CONFIG[moodEmotion]
        if (config) {
          cellClass = config.bg
        }
      }

      listCells.push({
        day: d.toString(),
        dateStr,
        hasData: !!historyItem,
        moodEmotion,
        className: cellClass,
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
          <div key={day} className="font-label-sm text-label-sm font-bold text-on-surface-variant text-center pb-2">
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
            >
              <span className={cell.hasData ? '-translate-y-0.5' : ''}>{cell.day}</span>
              {cell.hasData && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-0.5" />
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
    { label: 'Tenang', dotClass: 'mood-tenang border-transparent' },
    { label: 'Bahagia', dotClass: 'mood-bahagia border-transparent' },
    { label: 'Cemas', dotClass: 'mood-cemas border-transparent' },
    { label: 'Lelah', dotClass: 'mood-lelah border-transparent' },
    { label: 'Stres', dotClass: 'mood-stres border-transparent' },
    { label: 'Sedih', dotClass: 'mood-sedih border-transparent' },
  ]

  return (
    <div className="mt-auto pt-6 border-t border-outline-variant/20">
      <h4 className="font-label-sm text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-4">Legenda Mood</h4>
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
    if (monthlyData.length === 0) return { dominant: '-', stressDays: 0 }

    const emotionCounts: Record<string, number> = {}
    let stressDays = 0

    monthlyData.forEach((item) => {
      if (item.emotion) {
        emotionCounts[item.emotion] = (emotionCounts[item.emotion] || 0) + 1
      }
      if (item.emotion === 'Stres' || item.riskLevel === 'Tinggi') {
        stressDays++
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

    return { dominant, stressDays }
  }, [monthlyData])

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-2xl p-5 flex flex-col items-center justify-center text-center bg-surface-container-lowest shadow-ambient-1 bg-white/70 backdrop-blur-[12px] border border-outline-variant/20">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            spa
          </span>
        </div>
        <p className="font-label-sm text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Dominan</p>
        <p className="text-[20px] font-bold text-on-surface">{stats.dominant}</p>
      </div>

      <div className="rounded-2xl p-5 flex flex-col items-center justify-center text-center bg-surface-container-lowest shadow-ambient-1 bg-white/70 backdrop-blur-[12px] border border-outline-variant/20">
        <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center mb-3">
          <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            warning
          </span>
        </div>
        <p className="font-label-sm text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">Hari Stres</p>
        <p className="text-[20px] font-bold text-on-surface">
          {stats.stressDays} <span className="text-[13px] font-medium text-on-surface-variant">hari</span>
        </p>
      </div>
    </div>
  )
}

function MoodStats({ monthlyData }: { monthlyData: DailyHistory[] }) {
  const rows = useMemo(() => {
    const baseMoods = ['Tenang', 'Bahagia', 'Lelah', 'Stres', 'Cemas', 'Sedih']
    if (monthlyData.length === 0) {
      return baseMoods.map((name) => ({ name, percentage: 0, barClass: MOOD_CONFIG[name]?.bg.split(' ')[0] || 'bg-surface-container' }))
    }

    const counts: Record<string, number> = {}
    monthlyData.forEach((item) => {
      if (item.emotion) counts[item.emotion] = (counts[item.emotion] || 0) + 1
    })

    return baseMoods.map((name) => {
      const count = counts[name] || 0
      const percentage = Math.round((count / monthlyData.length) * 100)
      const config = MOOD_CONFIG[name]
      return {
        name,
        percentage,
        barClass: config ? config.bg.split(' ')[0] : 'bg-surface-container',
      }
    })
  }, [monthlyData])

  return (
    <section className="rounded-2xl p-6 bg-surface-container-lowest shadow-ambient-1 bg-white/70 backdrop-blur-[12px] border border-outline-variant/20">
      <h3 className="font-label-md text-[14px] font-bold text-on-surface mb-5">Statistik Bulan Ini</h3>
      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center gap-3">
            <span className="w-16 font-label-sm text-[13px] text-on-surface-variant">{row.name}</span>
            <div className="flex-1 h-2 bg-surface-container rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${row.barClass}`} style={{ width: `${row.percentage}%` }} />
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

    const stressCount = monthlyData.filter(m => m.emotion === 'Stres' || m.riskLevel === 'Tinggi').length
    const calmCount = monthlyData.filter(m => m.emotion === 'Tenang' || m.emotion === 'Bahagia').length

    if (stressCount > calmCount) {
      return 'Anda menunjukkan peningkatan tingkat stres dan lelah yang cukup tinggi bulan ini. Disarankan untuk memprioritaskan istirahat yang cukup dan mengambil jeda rileksasi berkala di sela pekerjaan.'
    } else if (calmCount > 0) {
      return 'Kondisi emosi Anda bulan ini relatif stabil dengan dominasi rasa tenang dan bahagia. Pertahankan pola hidup dan manajemen waktu yang seimbang ini.'
    } else {
      return 'Pola mood Anda tercatat bervariasi. Terus catat jurnal harian Anda untuk membantu AI memberikan analisis burnout yang lebih akurat.'
    }
  }, [monthlyData])

  return (
    <section className="rounded-2xl p-6 bg-surface-container-lowest border border-outline-variant/20 shadow-ambient-1 relative overflow-hidden bg-white/70 backdrop-blur-[12px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />
      <div className="flex items-center gap-3 mb-4 relative z-10">
        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            lightbulb
          </span>
        </div>
        <h3 className="font-label-md text-[14px] font-bold text-on-surface">Insight AI BurnoutLens</h3>
      </div>
      <p className="font-body-md text-[14px] text-on-surface-variant leading-relaxed relative z-10 mb-5">
        {insightText}
      </p>
      <a className="inline-flex items-center gap-1.5 text-primary font-label-md text-[13px] hover:underline relative z-10 font-bold" href="/daily-checkin">
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

  return (
    <div className="rounded-2xl p-6 bg-surface-container-lowest border border-outline-variant/20 shadow-ambient-1 flex flex-col h-full bg-white/70 backdrop-blur-[12px]">
      <div className="border-b border-outline-variant/20 pb-4 mb-5 flex justify-between items-center">
        <div>
          <span className="font-label-sm text-[11px] font-bold text-primary uppercase tracking-wider block mb-1">Tanggal Riwayat</span>
          <h4 className="font-headline-md text-[18px] font-bold text-on-surface">{formattedDate}</h4>
        </div>
        {hasData && (
          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
          </span>
        )}
      </div>

      {!hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4">
          <span className="material-symbols-outlined text-outline-variant text-[48px] mb-4">edit_calendar</span>
          <p className="font-headline-md text-[16px] font-bold text-on-surface mb-2">Belum ada riwayat untuk tanggal ini</p>
          <p className="font-body-sm text-[13px] text-on-surface-variant max-w-xs leading-relaxed">
            Isi check-in harian atau jurnal untuk membuat riwayat baru pada tanggal ini.
          </p>
          <div className="flex gap-2 mt-6">
            <a href="/daily-checkin" className="inline-flex items-center gap-1 bg-primary text-on-primary font-label-sm text-[12px] px-4 py-2 rounded-full hover:shadow-md hover:shadow-primary/20 transition-all font-bold">
              Check-In
            </a>
            <a href="/journal" className="inline-flex items-center gap-1 bg-surface text-primary border border-primary/20 font-label-sm text-[12px] px-4 py-2 rounded-full hover:bg-primary/5 transition-all font-bold">
              Tulis Jurnal
            </a>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6">
          {/* 1. Riwayat Jurnaling */}
          <div>
            <h5 className="font-label-sm text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">edit_note</span> Riwayat Jurnaling
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
                  const EMOTION_BADGE_STYLE: Record<string, string> = {
                    Lelah: 'bg-surface-container-high text-on-primary-container border-outline-variant/30',
                    Cemas: 'bg-error-container text-on-error-container border-error-container/30',
                    Marah: 'bg-rose-100 text-rose-800 border-rose-200/50',
                    Senang: 'bg-tertiary-fixed text-tertiary border-tertiary-fixed/30',
                    Netral: 'bg-secondary-container text-on-secondary-fixed-variant border-secondary-container/30',
                  }
                  const badgeClass = (journal.detectedEmotion ? EMOTION_BADGE_STYLE[journal.detectedEmotion] : null) || 'bg-surface-container text-outline border-outline-variant/30'
                  return (
                    <div key={journal.id} className="bg-surface-container-low/40 rounded-xl p-4 border border-outline-variant/10 flex flex-col gap-2">
                      <p className="font-body-md text-[14px] text-on-surface leading-relaxed italic">
                        “{journal.content}”
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-1 pt-2 border-t border-outline-variant/5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeClass}`}>
                          {journal.detectedEmotion}
                        </span>
                        <span className="text-[10px] text-on-surface-variant font-medium">
                          {new Date(journal.createdAt || journal.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                        </span>
                      </div>
                      {journal.insight && (
                        <p className="text-[11.5px] text-on-surface-variant bg-surface-container-lowest/70 p-2.5 rounded-lg leading-relaxed mt-1 border border-outline-variant/5">
                          <span className="font-bold text-[10px] text-primary uppercase block mb-1">Analisis Jurnal:</span>
                          {journal.insight}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 2. Riwayat Emosi Hari Itu */}
          <div>
            <h5 className="font-label-sm text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">mood</span> Riwayat Emosi Hari Itu
            </h5>
            <div className="flex items-center gap-3">
              {(() => {
                const activeEmotion = historyItem?.emotion || (journals.length > 0 ? journals[0].detectedEmotion : null) || 'Netral'
                const config = MOOD_CONFIG[activeEmotion] || { bg: 'bg-surface-container', text: 'text-on-surface-variant', label: activeEmotion, icon: 'sentiment_neutral' }
                return (
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant/20 ${config.bg} font-bold text-[14px]`}>
                    <span className="material-symbols-outlined text-[18px]">{config.icon}</span>
                    <span>{config.label}</span>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* 3. Riwayat Hasil Burnout Skor Hari Ini */}
          <div>
            <h5 className="font-label-sm text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">analytics</span> Riwayat Hasil Burnout Skor Hari Ini
            </h5>
            {historyItem && historyItem.burnoutScore > 0 ? (
              <div className="bg-surface-container-low/40 rounded-xl p-4 border border-outline-variant/10 flex items-center justify-between">
                <div>
                  <span className="text-[13px] text-on-surface-variant block mb-0.5">Skor Burnout</span>
                  <span className="text-[20px] font-bold text-on-surface">{historyItem.burnoutScore}</span>
                </div>
                <div className="text-right">
                  <span className="text-[13px] text-on-surface-variant block mb-1">Level Risiko</span>
                  {(() => {
                    const badge = RISK_BADGES[historyItem.riskLevel as 'Rendah' | 'Sedang' | 'Tinggi'] || { badge: 'bg-surface-container text-on-surface-variant border-outline-variant/30', text: historyItem.riskLevel || 'Rendah' }
                    return (
                      <span className={`inline-block px-3 py-1 rounded-full text-[12px] font-bold border ${badge.badge}`}>
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
                <a href="/daily-checkin" className="inline-flex items-center gap-1 text-primary hover:underline text-[12px] font-bold">
                  Mulai Check-In Hari Ini <span className="material-symbols-outlined text-sm">arrow_forward</span>
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
        <h4 className="font-headline-md text-[18px] font-bold text-on-surface">Daftar Riwayat Harian</h4>
        <span className="text-[12px] text-on-surface-variant font-medium bg-surface-container/50 px-2.5 py-1 rounded-full">
          Total: {monthlyData.length} entri
        </span>
      </div>

      {monthlyData.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
          <span className="material-symbols-outlined text-outline-variant text-[40px] mb-3">folder_open</span>
          <p className="font-label-md text-on-surface-variant">Tidak ada data riwayat untuk bulan ini</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-3">
          {paginatedData.map((item) => {
            const isSelected = selectedDate === item.date
            const mood = MOOD_CONFIG[item.emotion] || { bg: 'bg-surface-container', text: 'text-on-surface', label: item.emotion, icon: 'sentiment_neutral' }
            const risk = RISK_BADGES[item.riskLevel as 'Rendah' | 'Sedang' | 'Tinggi'] || { badge: 'bg-surface-container', text: item.riskLevel }

            return (
              <button
                key={item.date}
                onClick={() => onSelectDate(item.date)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer ${isSelected
                  ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary'
                  : 'border-outline-variant/20 bg-surface-container-low/30 hover:border-outline-variant/60 hover:bg-surface-container-low/60'
                  }`}
                type="button"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mood.bg} ${mood.text}`}>
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
                      Skor: <span className="font-bold text-on-surface">{item.burnoutScore}</span>
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${risk.badge}`}>
                    {risk.text}
                  </span>
                </div>
              </button>
            )
          })}

          {/* Pagination */}
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
                const p = i + 1
                const isActive = p === currentPage
                return (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`w-8 h-8 rounded-full text-[13px] font-bold transition-all ${isActive
                      ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                      : 'border border-outline-variant/30 hover:bg-surface-container-low text-on-surface-variant'
                      }`}
                    type="button"
                  >
                    {p}
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

  // Load history and journal list from backend on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        const [checkins, journals] = await Promise.all([
          getCheckIns(),
          getJournals()
        ])

        setJournalsList(journals)

        // Merge checkins and journals by date into DailyHistory items
        const dates = Array.from(new Set([
          ...checkins.map((c) => c.date),
          ...journals.map((j) => j.date)
        ])).sort((a, b) => b.localeCompare(a))

        const merged: DailyHistory[] = dates.map((date) => {
          const c = checkins.find((x) => x.date === date)
          const js = journals.filter((x) => x.date === date)

          const journalText = js.map((j) => j.content).join('\n')
          const emotion = js.length > 0
            ? (js[0].detectedEmotion || 'Netral')
            : (c ? (c.riskLevel === 'Tinggi' ? 'Stres' : c.riskLevel === 'Sedang' ? 'Lelah' : 'Tenang') : 'Tenang')

          return {
            date,
            journal: journalText,
            emotion,
            burnoutScore: c ? (c.score_assessment ?? c.burnoutScore ?? 0) : 0,
            riskLevel: c ? (c.riskLevel as 'Rendah' | 'Sedang' | 'Tinggi') : 'Rendah',
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

  // Filter history items by selected month
  const monthlyData = useMemo(() => {
    return historyList.filter((item) => item.date.startsWith(selectedMonth))
  }, [historyList, selectedMonth])

  // Get currently selected history item
  const selectedHistoryItem = useMemo(() => {
    return historyList.find((item) => item.date === selectedDate) || null
  }, [historyList, selectedDate])

  // Get journals for the selected date
  const selectedDateJournals = useMemo(() => {
    return journalsList.filter(j => j.date === selectedDate)
  }, [journalsList, selectedDate])

  // Scroll to History section if routed via '/mood-map?section=history'
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

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const month = e.target.value
    setSelectedMonth(month)
    // Default to the first of the month
    setSelectedDate(`${month}-01`)
    setCurrentPage(1)
  }

  const handleSelectDate = (date: string) => {
    setSelectedDate(date)
    // Change page if the selected date is in the list
    const index = monthlyData.findIndex((item) => item.date === date)
    if (index >= 0) {
      const pageIndex = Math.floor(index / 3) + 1
      setCurrentPage(pageIndex)
    }
  }

  const monthOptions = useMemo(() => {
    const options = []
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ]
    const d = new Date()
    d.setDate(1) // Avoid day-overflow duplicate month bug when current date is the 31st
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
      {/* Header */}
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

      {/* Top Section: Calendar and Statistics Side-by-Side */}
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

      {/* Bottom Section: Riwayat Harian (Click-based Detail & List) */}
      <div id="riwayat-harian" className="scroll-mt-6 border-t border-outline-variant/20 pt-8">
        <div className="mb-6">
          <h3 className="font-headline-md text-[20px] font-bold text-on-surface mb-1">
            Section Riwayat Harian
          </h3>
          <p className="text-body-md text-on-surface-variant">
            Pilih tanggal di kalender atas untuk meninjau detail log jurnaling, emosi dominan, dan tingkat burnout.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Detail Riwayat Terpilih (Kiri) */}
          <div className="lg:col-span-5">
            <SelectedDateDetail
              selectedDate={selectedDate}
              historyItem={selectedHistoryItem}
              journals={selectedDateJournals}
            />
          </div>

          {/* Daftar Riwayat Harian Bulan Ini (Kanan) */}
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
