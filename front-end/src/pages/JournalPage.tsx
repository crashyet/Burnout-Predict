import { useMemo, useState } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { saveJournalEntry, analyzeJournalText } from '../services/historyService'

function JournalPromptCard({ currentDate }: { currentDate: string }) {
  return (
    <header className="mb-section-gap max-w-2xl">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container mb-4">
        <span className="material-symbols-outlined text-primary text-sm">today</span>
        <span className="font-label-sm text-label-sm text-on-surface-variant">{currentDate}</span>
      </div>
      <h2 className="font-headline-xl text-headline-xl text-on-surface mb-3 tracking-tight">Jurnal Harian</h2>
      <p className="font-body-lg text-body-lg text-on-surface-variant opacity-90 leading-relaxed">
        Tulis apa yang kamu rasakan hari ini. Tidak perlu sempurna, cukup jujur. Ruang ini aman dan hanya untukmu.
      </p>
    </header>
  )
}

type JournalEditorProps = {
  text: string
  onTextChange: (value: string) => void
  isAnalyzing: boolean
  onAnalyze: () => void
  isDone: boolean
}

function JournalEditor({ text, onTextChange, isAnalyzing, onAnalyze, isDone }: JournalEditorProps) {
  return (
    <div className="lg:col-span-8 bg-surface-container-lowest rounded-3xl p-6 lg:p-8 shadow-ambient-1 border border-surface-container-high relative overflow-hidden h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-surface-container-low/50 to-transparent pointer-events-none opacity-50" />

      <div className="relative z-10 flex flex-col h-full min-h-[400px]">
        <label className="sr-only" htmlFor="journal-entry">
          Entri Jurnal
        </label>
        <textarea
          id="journal-entry"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          className="w-full flex-1 bg-transparent border-none resize-none focus:ring-0 text-on-surface font-body-lg text-body-lg placeholder:text-outline-variant/70 leading-relaxed p-0 mb-6"
          placeholder="Ceritakan keluh kesah, perasaan, atau kejadian yang kamu alami hari ini..."
        />

        <div className="flex items-center justify-between mt-auto pt-6 border-t border-surface-container">
          <div className="flex gap-2">
            <button className="p-2 text-outline hover:text-primary hover:bg-primary/5 rounded-full transition-colors" title="Tambahkan Tag" type="button">
              <span className="material-symbols-outlined">sell</span>
            </button>
            <button className="p-2 text-outline hover:text-primary hover:bg-primary/5 rounded-full transition-colors" title="Format Teks" type="button">
              <span className="material-symbols-outlined">format_italic</span>
            </button>
          </div>

          <button
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-container text-on-primary font-label-md text-label-md px-6 py-3 rounded-full hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={onAnalyze}
            disabled={isAnalyzing || text.trim().length < 10}
            type="button"
          >
            <span className={`material-symbols-outlined text-sm ${isAnalyzing ? 'animate-spin' : ''}`}>
              {isAnalyzing ? 'sync' : isDone ? 'check' : 'auto_awesome'}
            </span>
            {isAnalyzing ? 'Menganalisis...' : isDone ? 'Selesai' : 'Analisis Jurnal'}
          </button>
        </div>
      </div>
    </div>
  )
}

interface AnalysisResult {
  emotion: string
  insight: string
  recommendation: string
}

function JournalInsightCard({
  analyzed,
  analysis,
}: {
  analyzed: boolean
  analysis: AnalysisResult | null
}) {
  const feedback = analyzed && analysis
    ? `"${analysis.insight}"`
    : '"Menunggu jurnalmu untuk memberikan sedikit perspektif..."'

  const EMOTION_BADGE_STYLE: Record<string, string> = {
    Lelah: 'bg-surface-container-high text-on-primary-container border-outline-variant/30',
    Cemas: 'bg-error-container text-on-error-container border-error-container/30',
    Marah: 'bg-rose-100 text-rose-800 border-rose-200/50',
    Senang: 'bg-tertiary-fixed text-tertiary border-tertiary-fixed/30',
    Netral: 'bg-secondary-container text-on-secondary-fixed-variant border-secondary-container/30',
  }

  const emotionLabel = analyzed && analysis ? analysis.emotion : '-'
  const badgeClass = EMOTION_BADGE_STYLE[emotionLabel] || 'bg-surface-container text-outline border-outline-variant/30'

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-ambient-1 border border-surface-container-high relative overflow-hidden h-full flex flex-col justify-between min-h-[300px]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10" />
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              psychology
            </span>
          </div>
          <h3 className="font-headline-md text-headline-md text-on-surface text-xl">Refleksi AI</h3>
        </div>

        <div className="bg-surface-container-low rounded-2xl p-4 mb-6">
          <p className="font-body-md text-body-md text-on-surface-variant italic text-sm leading-relaxed">{feedback}</p>
        </div>
      </div>

      <div className="space-y-4 mt-auto">
        <div>
          <h4 className="font-label-md text-label-md text-on-surface mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-outline">mood</span>
            Emosi Dominan
          </h4>
          <span className={`inline-block px-4 py-1.5 rounded-full font-label-sm text-label-sm border font-bold ${badgeClass}`}>
            {emotionLabel}
          </span>
        </div>

        {analyzed && analysis && (
          <div>
            <h4 className="font-label-md text-label-md text-on-surface mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-outline">tips_and_updates</span>
              Rekomendasi AI
            </h4>
            <p className="font-body-sm text-[13px] text-on-surface-variant leading-relaxed">
              {analysis.recommendation}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Component JournalHistory has been removed

export function JournalPage() {
  const [journalText, setJournalText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isAnalyzed, setIsAnalyzed] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)

  const currentDate = useMemo(
    () =>
      new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
    [],
  )

  const handleAnalyze = () => {
    if (journalText.trim().length < 10 || isAnalyzing) {
      return
    }

    setIsAnalyzing(true)
    window.setTimeout(() => {
      const result = analyzeJournalText(journalText)
      setAnalysisResult(result)
      setIsAnalyzing(false)
      setIsAnalyzed(true)

      // Automatically save to local history / localStorage
      saveJournalEntry(
        journalText,
        result.emotion,
        result.insight,
        result.recommendation
      )
      setIsSaved(true)
    }, 1200)
  }

  return (
    <DashboardLayout currentPath="/journal" topbarTitle="Jurnal Harian">
      <JournalPromptCard currentDate={currentDate} />

      {isSaved && (
        <div className="bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 mb-6 animate-fade-in">
          <span className="material-symbols-outlined text-emerald-500">check_circle</span>
          <p className="font-body-md text-body-md font-semibold">Jurnal berhasil dianalisis dan otomatis tersimpan ke Riwayat.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-8 items-stretch">
        <JournalEditor
          text={journalText}
          onTextChange={(val) => {
            setJournalText(val)
            setIsSaved(false)
            setIsAnalyzed(false)
            setAnalysisResult(null)
          }}
          isAnalyzing={isAnalyzing}
          onAnalyze={handleAnalyze}
          isDone={isAnalyzed}
        />

        <div
          className={`lg:col-span-4 flex flex-col transition-opacity duration-500 h-full ${
            isAnalyzed ? 'opacity-100' : 'opacity-50 pointer-events-none'
          }`}
        >
          <JournalInsightCard analyzed={isAnalyzed} analysis={analysisResult} />
        </div>
      </div>
    </DashboardLayout>
  )
}
