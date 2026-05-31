import { useEffect, useMemo, useState } from 'react'
import { DashboardLayout } from '../components/layout/DashboardLayout'
import { createCheckIn, getCheckIns, getLocalDateString } from '../services/trackingService'

type CheckInQuestionProps = {
  label: string
  value: number
  onChange: (value: number) => void
}

function getRangeBackground(value: number, min: number, max: number) {
  const percent = ((value - min) / (max - min)) * 100
  return { background: `linear-gradient(to right, #13409e ${percent}%, #dce9ff ${percent}%)` }
}

function StepHeader({ icon, stepLabel, title, subtitle }: { icon: string; stepLabel: string; title: string; subtitle: string }) {
  return (
    <div className="mb-10 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high border border-outline-variant/30 text-primary text-xs font-bold mb-5">
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
        {stepLabel}
      </div>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">{title}</h1>
      <p className="mt-3 text-on-surface-variant text-base md:text-lg">{subtitle}</p>
    </div>
  )
}

function CheckInQuestion({ label, value, onChange }: CheckInQuestionProps) {
  return (
    <div className="bg-white border border-outline-variant/45 rounded-[2rem] p-6 md:p-8 shadow-sm shadow-primary/5 transition-all hover:shadow-md hover:border-primary/30 relative overflow-hidden">
      <div className="flex items-start justify-between gap-5 mb-7">
        <p className="text-base md:text-lg leading-relaxed font-semibold text-on-surface">{label}</p>
        <div className="shrink-0 min-w-12 h-10 rounded-full bg-primary text-white px-4 grid place-items-center font-extrabold">{value}</div>
      </div>

      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="range-input"
        style={getRangeBackground(value, 1, 10)}
      />

      <div className="mt-4 flex justify-between text-xs md:text-sm font-bold text-on-surface-variant/75">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
      <div className="mt-2 flex justify-between text-[11px] md:text-xs text-on-surface-variant">
        <span>Sangat Tidak Setuju</span>
        <span>Sangat Setuju</span>
      </div>
    </div>
  )
}

function SleepStep({ sleepHours, setSleepHours }: { sleepHours: number; setSleepHours: (value: number) => void }) {
  return (
    <>
      <StepHeader icon="bedtime" stepLabel="Langkah 1 dari 4" title="Jam Tidur" subtitle="Masukkan durasi tidur Anda semalam." />

      <section className="glass-card rounded-[2rem] md:rounded-[3rem] p-8 md:p-12">
        <div className="text-center">
          <p className="text-xl md:text-2xl font-bold text-on-surface">Berapa jam Anda tidur semalam?</p>
          <div className="my-9 flex justify-center">
            <div className="w-36 h-36 rounded-full bg-primary text-white grid place-items-center shadow-xl shadow-primary/20">
              <div>
                <div className="text-5xl font-extrabold">{sleepHours}</div>
                <div className="text-sm font-semibold opacity-90">jam</div>
              </div>
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={24}
            value={sleepHours}
            onChange={(e) => setSleepHours(Math.max(0, Math.min(24, Number(e.target.value))))}
            className="range-input"
            style={getRangeBackground(sleepHours, 0, 24)}
          />

          <div className="mt-4 flex justify-between text-sm font-semibold text-on-surface-variant">
            <span>0 jam</span>
            <span>12 jam</span>
            <span>24 jam</span>
          </div>
        </div>
      </section>
    </>
  )
}

function WorkStep({ workHours, setWorkHours }: { workHours: number; setWorkHours: (value: number) => void }) {
  return (
    <>
      <StepHeader icon="work_history" stepLabel="Langkah 2 dari 4" title="Jam Kerja / Belajar" subtitle="Catat durasi aktivitas produktif Anda hari ini." />

      <section className="glass-card rounded-[2rem] md:rounded-[3rem] p-8 md:p-12">
        <div className="text-center">
          <p className="text-xl md:text-2xl font-bold text-on-surface">Berapa jam Anda bekerja atau belajar hari ini?</p>
          <div className="my-9 flex justify-center">
            <div className="w-36 h-36 rounded-full bg-primary text-white grid place-items-center shadow-xl shadow-secondary/20">
              <div>
                <div className="text-5xl font-extrabold">{workHours}</div>
                <div className="text-sm font-semibold opacity-90">jam</div>
              </div>
            </div>
          </div>

          <input
            type="range"
            min={0}
            max={24}
            value={workHours}
            onChange={(e) => setWorkHours(Math.max(0, Math.min(24, Number(e.target.value))))}
            className="range-input"
            style={getRangeBackground(workHours, 0, 24)}
          />

          <div className="mt-4 flex justify-between text-sm font-semibold text-on-surface-variant">
            <span>0 jam</span>
            <span>12 jam</span>
            <span>24 jam</span>
          </div>
        </div>
      </section>
    </>
  )
}

function QuestionnaireStep({ answers, setAnswers }: { answers: number[]; setAnswers: (next: number[]) => void }) {
  const statements = [
    'Saya merasa lelah secara fisik setelah bekerja atau belajar.',
    'Saya merasa kehabisan energi untuk menjalani aktivitas sehari-hari.',
    'Saya merasa lelah secara emosional.',
    'Saya merasa sulit berkonsentrasi saat bekerja atau belajar.',
    'Saya merasa kehilangan semangat terhadap pekerjaan atau tugas saya.',
    'Saya merasa frustrasi dengan aktivitas yang saya jalani.',
    'Saya merasa pekerjaan atau tugas terasa terlalu berat bagi saya.',
    'Saya merasa sulit termotivasi untuk menyelesaikan pekerjaan atau tugas.',
    'Saya merasa tertekan oleh tanggung jawab yang saya miliki.',
    'Saya merasa tidak mampu menghadapi tuntutan aktivitas sehari-hari.',
  ]

  const updateAnswer = (index: number, value: number) => {
    const next = [...answers]
    next[index] = value
    setAnswers(next)
  }

  return (
    <>
      <StepHeader
        icon="progress_activity"
        stepLabel="Langkah 3 dari 4"
        title="Kuesioner Burnout"
        subtitle="Nilai setiap pernyataan sesuai kondisi Anda hari ini."
      />

      <section className="rounded-[2rem] bg-white/75 backdrop-blur-md border border-outline-variant/40 p-5 mb-8 flex flex-col sm:flex-row items-center gap-4 shadow-sm shadow-primary/5">
        <div className="w-12 h-12 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">info</span>
        </div>
        <p className="flex-1 text-center sm:text-left text-on-surface">
          Geser slider untuk memberikan penilaian. <strong className="text-primary">1</strong> = Sangat Tidak Setuju,
          hingga <strong className="text-primary">10</strong> = Sangat Setuju.
        </p>
      </section>

      <div className="flex flex-col gap-5">
        {statements.map((statement, index) => (
          <CheckInQuestion key={statement} label={`${index + 1}. ${statement}`} value={answers[index]} onChange={(value) => updateAnswer(index, value)} />
        ))}
      </div>
    </>
  )
}

function StepFour({
  isAnalyzed,
  score,
  risk,
  sleepHours,
  workHours,
  onEditAnswers,
  alreadySubmitted,
  note,
  warning,
}: {
  isAnalyzed: boolean
  score: number
  risk: string
  sleepHours: number
  workHours: number
  onEditAnswers: () => void
  alreadySubmitted?: boolean
  note?: string
  warning?: string
}) {
  const circleLength = 389.56
  const offset = circleLength - (score / 100) * circleLength

  const prediction = risk === 'Tinggi' ? 'Risiko burnout perlu diperhatikan' : risk === 'Sedang' ? 'Risiko burnout perlu dipantau' : 'Kondisi cenderung stabil'
  const insight = warning || ''
  const recommendation = note || ''

  if (!isAnalyzed) {
    return (
      <section className="min-h-[calc(100vh-12rem)] grid place-items-center">
        <div className="glass-card rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 max-w-2xl w-full text-center">
          <div className="mx-auto mb-8 w-[92px] h-[92px] rounded-full border-8 border-surface-container-high border-t-primary animate-spin" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">Menganalisis Check-In Anda</h1>
          <p className="mt-4 text-on-surface-variant text-base md:text-lg">Menyimpan metrik harian dan menghitung skor burnout dengan model AI...</p>

          <div className="mt-8 grid gap-4 text-left">
            <div className="flex items-center gap-3 rounded-2xl bg-white border border-outline-variant/40 p-4">
              <div className="w-[26px] h-[26px] rounded-full bg-surface-container-high text-primary grid place-items-center shrink-0">
                <span className="material-symbols-outlined text-[16px]">database</span>
              </div>
              <span className="font-semibold text-on-surface">Menyimpan metrik harian</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white border border-outline-variant/40 p-4">
              <div className="w-[26px] h-[26px] rounded-full bg-surface-container-high text-primary grid place-items-center shrink-0">
                <span className="material-symbols-outlined text-[16px]">psychology</span>
              </div>
              <span className="font-semibold text-on-surface">Menghitung skor burnout</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white border border-outline-variant/40 p-4">
              <div className="w-[26px] h-[26px] rounded-full bg-surface-container-high text-primary grid place-items-center shrink-0">
                <span className="material-symbols-outlined text-[16px]">query_stats</span>
              </div>
              <span className="font-semibold text-on-surface">Menganalisis pola</span>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-white border border-outline-variant/40 p-4">
              <div className="w-[26px] h-[26px] rounded-full bg-surface-container-high text-primary grid place-items-center shrink-0">
                <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
              </div>
              <span className="font-semibold text-on-surface">Menyiapkan prediksi besok</span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section>
      {alreadySubmitted && (
        <div className="mb-8 rounded-[2rem] bg-amber-50 border border-amber-200 p-5 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
          <div className="w-12 h-12 shrink-0 rounded-full bg-amber-100 flex items-center justify-center text-amber-800">
            <span className="material-symbols-outlined">info</span>
          </div>
          <p className="flex-1 text-center sm:text-left text-amber-900 font-semibold leading-relaxed">
            Anda telah menyelesaikan check-in harian hari ini. Pengisian ulang atau pengubahan jawaban baru dapat dilakukan kembali besok.
          </p>
        </div>
      )}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high text-primary font-bold text-xs mb-5">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          Check-In Selesai
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-on-surface">Hasil Check-In Hari Ini</h1>
        <p className="mt-3 text-on-surface-variant text-base md:text-lg">Berikut ringkasan kondisi Anda berdasarkan jam tidur, jam kerja, dan jawaban kuesioner burnout.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 mb-8">
        <div className="md:col-span-4 glass-card rounded-[2rem] p-8 text-center flex flex-col items-center justify-center">
          <p className="text-xs font-extrabold tracking-widest uppercase text-on-surface-variant mb-5">Skor Burnout Hari Ini</p>
          <div className="relative w-36 h-36 mb-4">
            <svg className="w-36 h-36 -rotate-90">
              <circle cx="72" cy="72" r="62" stroke="#dce9ff" strokeWidth="13" fill="none" />
              <circle cx="72" cy="72" r="62" stroke="#67577E" strokeWidth="13" fill="none" strokeLinecap="round" strokeDasharray={circleLength} strokeDashoffset={offset} />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div>
                <div className="text-5xl font-extrabold text-on-surface">{score}</div>
                <div className="text-sm font-bold text-on-surface-variant">/100</div>
              </div>
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-bold ${risk === 'Tinggi' ? 'bg-error-container text-on-error-container' : risk === 'Sedang' ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
              }`}
          >
            Risiko {risk}
          </span>
        </div>

        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="rounded-[2rem] bg-white border border-outline-variant/40 p-6 shadow-sm shadow-primary/5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-5">
              <span className="material-symbols-outlined">wb_sunny</span>
            </div>
            <p className="text-sm font-bold text-on-surface-variant">Prediksi Besok</p>
            <h3 className="mt-2 text-xl font-extrabold text-on-surface">{prediction}</h3>
          </div>

          <div className="rounded-[2rem] bg-white border border-outline-variant/40 p-6 shadow-sm shadow-primary/5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center mb-5">
              <span className="material-symbols-outlined">bedtime</span>
            </div>
            <p className="text-sm font-bold text-on-surface-variant">Jam Tidur</p>
            <h3 className="mt-2 text-3xl font-extrabold text-on-surface">{sleepHours} jam</h3>
          </div>

          <div className="rounded-[2rem] bg-white border border-outline-variant/40 p-6 shadow-sm shadow-primary/5">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary grid place-items-center mb-5">
              <span className="material-symbols-outlined">work_history</span>
            </div>
            <p className="text-sm font-bold text-on-surface-variant">Jam Kerja</p>
            <h3 className="mt-2 text-3xl font-extrabold text-on-surface">{workHours} jam</h3>
          </div>

          <div className="rounded-[2rem] bg-white border border-outline-variant/40 p-6 shadow-sm shadow-primary/5">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/10 text-tertiary grid place-items-center mb-5">
              <span className="material-symbols-outlined">monitor_heart</span>
            </div>
            <p className="text-sm font-bold text-on-surface-variant">Status Risiko</p>
            <h3 className="mt-2 text-3xl font-extrabold text-on-surface">{risk}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
        <div className="rounded-[2rem] bg-white border border-outline-variant/40 p-6 md:p-7 shadow-sm shadow-primary/5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary grid place-items-center shrink-0">
              <span className="material-symbols-outlined">tips_and_updates</span>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-on-surface">Rekomendasi Singkat</h3>
              <p className="mt-3 text-on-surface-variant leading-relaxed">{recommendation}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] bg-primary text-white p-6 md:p-7 shadow-lg shadow-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 grid place-items-center shrink-0">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div>
              <h3 className="text-xl font-extrabold">Insight AI</h3>
              <p className="mt-3 text-white/85 leading-relaxed">{insight}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-between gap-3">
        {!alreadySubmitted ? (
          <button
            type="button"
            onClick={onEditAnswers}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white border border-outline-variant px-7 py-3 text-on-surface font-bold hover:bg-surface-container-low transition"
          >
            <span className="material-symbols-outlined">edit</span>
            Ubah Jawaban
          </button>
        ) : (
          <div />
        )}

        <a
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-white font-bold shadow-lg shadow-primary/20 hover:opacity-95 active:scale-95 transition"
        >
          Selesai
          <span className="material-symbols-outlined">check</span>
        </a>
      </div>
    </section>
  )
}

export function DailyCheckInPage() {
  const savedTodayCheckin = useMemo(() => {
    const todayCheckInStr = localStorage.getItem('today_checkin')
    if (!todayCheckInStr) return null
    try {
      const parsed = JSON.parse(todayCheckInStr)
      if (!parsed.timestamp) return null
      const checkInDate = parsed.timestamp.split('T')[0]
      if (checkInDate === getLocalDateString()) {
        return parsed
      }
    } catch { }
    return null
  }, [])

  const [sleepHours, setSleepHours] = useState(savedTodayCheckin?.sleepHours ?? 7)
  const [workHours, setWorkHours] = useState(savedTodayCheckin?.workHours ?? 8)
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState([5, 5, 5, 5, 5, 5, 5, 5, 5, 5])
  const [currentStep, setCurrentStep] = useState(savedTodayCheckin ? 4 : 1)
  const [isAnalyzed, setIsAnalyzed] = useState(!!savedTodayCheckin)
  const [errorText, setErrorText] = useState('')
  const [note, setNote] = useState<string | undefined>(savedTodayCheckin?.note)
  const [warning, setWarning] = useState<string | undefined>(savedTodayCheckin?.warning)
  const [isLoading, setIsLoading] = useState(true)
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState(!!savedTodayCheckin)
  const [scoreFromDB, setScoreFromDB] = useState<number | null>(savedTodayCheckin?.score ?? null)
  const [riskFromDB, setRiskFromDB] = useState<string | null>(savedTodayCheckin?.risk ?? null)

  useEffect(() => {
    async function checkStatus() {
      try {
        const checkins = await getCheckIns()
        const todayStr = getLocalDateString()
        const todayCheckIn = checkins.find((c) => {
          const cDate = c.createdAt ? c.createdAt.split('T')[0] : c.date
          return cDate === todayStr
        })

        if (todayCheckIn) {
          setSleepHours(todayCheckIn.sleep_hours)
          setWorkHours(todayCheckIn.work_hours ?? 8)
          setScoreFromDB(todayCheckIn.score_assessment ?? todayCheckIn.burnoutScore ?? null)
          setRiskFromDB(todayCheckIn.riskLevel ?? null)
          setNote(todayCheckIn.note)
          setWarning(todayCheckIn.warning)
          setAlreadyCheckedIn(true)
          setCurrentStep(4)
          setIsAnalyzed(true)

          localStorage.setItem(
            'today_checkin',
            JSON.stringify({
              sleepHours: todayCheckIn.sleep_hours,
              workHours: todayCheckIn.work_hours ?? 8,
              score: todayCheckIn.score_assessment ?? todayCheckIn.burnoutScore,
              risk: todayCheckIn.riskLevel,
              note: todayCheckIn.note,
              warning: todayCheckIn.warning,
              timestamp: todayCheckIn.createdAt || new Date().toISOString()
            })
          )
        } else {
          setAlreadyCheckedIn(false)
          localStorage.removeItem('today_checkin')
          setScoreFromDB(null)
          setRiskFromDB(null)
          setNote(undefined)
          setWarning(undefined)
          setCurrentStep(1)
          setIsAnalyzed(false)
        }
      } catch (err) {
        console.error("Failed to check status from database:", err)
      } finally {
        setIsLoading(false)
      }
    }
    checkStatus()
  }, [])

  const score = useMemo(() => {
    if (alreadyCheckedIn && scoreFromDB !== null) return scoreFromDB
    const average = questionnaireAnswers.reduce((sum, value) => sum + value, 0) / questionnaireAnswers.length
    return Math.max(0, Math.min(100, Math.round(average * 10)))
  }, [questionnaireAnswers, alreadyCheckedIn, scoreFromDB])

  const risk = alreadyCheckedIn && riskFromDB ? riskFromDB : (score > 70 ? 'Tinggi' : score >= 40 ? 'Sedang' : 'Rendah')

  const validateCurrentStep = () => {
    if (currentStep === 1 && (sleepHours < 0 || sleepHours > 24)) return 'Jam tidur harus di antara 0 dan 24 jam.'
    if (currentStep === 2 && (workHours < 0 || workHours > 24)) return 'Jam kerja harus di antara 0 dan 24 jam.'
    if (currentStep === 3 && questionnaireAnswers.some((answer) => answer < 1)) return 'Lengkapi semua jawaban kuesioner.'
    return ''
  }

  const goNext = () => {
    const err = validateCurrentStep()
    if (err) {
      setErrorText(err)
      return
    }
    setErrorText('')
    setCurrentStep((prev) => Math.min(prev + 1, 4))
  }

  const goPrev = () => {
    setErrorText('')
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const analyzeCheckIn = async () => {
    const err = validateCurrentStep()
    if (err) {
      setErrorText(err)
      return
    }

    setErrorText('')
    setCurrentStep(4)
    setIsAnalyzed(false)

    const payload = {
      date: getLocalDateString(),
      sleep_hours: sleepHours,
      work_hours: workHours,
      score_assessment: score,
    }

    console.log("==================== FRONTEND CHECK-IN REQUEST ====================")
    console.log("Payload sent to backend:", payload)
    console.log("===================================================================")

    try {
      const res = await createCheckIn(payload)

      console.log("==================== FRONTEND CHECK-IN RESPONSE ===================")
      console.log("Response received from backend:", res)
      console.log("===================================================================")

      const finalScore = res.score_assessment ?? res.burnoutScore ?? score
      const finalRisk = res.riskLevel ?? (score > 70 ? 'Tinggi' : score >= 40 ? 'Sedang' : 'Rendah')

      setNote(res.note)
      setWarning(res.warning)

      localStorage.setItem(
        'today_checkin',
        JSON.stringify({
          sleepHours,
          workHours,
          score: finalScore,
          risk: finalRisk,
          note: res.note,
          warning: res.warning,
          timestamp: new Date().toISOString()
        })
      )
      setIsAnalyzed(true)
    } catch (err: any) {
      console.error(err)
      setErrorText(err?.message || 'Gagal menyimpan check-in ke server.')

      // Fallback local storage saving so user flow is not broken
      localStorage.setItem(
        'today_checkin',
        JSON.stringify({
          sleepHours,
          workHours,
          score,
          risk: score > 70 ? 'Tinggi' : score >= 40 ? 'Sedang' : 'Rendah',
          timestamp: new Date().toISOString()
        })
      )
      setIsAnalyzed(true)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout currentPath="/daily-checkin" topbarTitle="Check-In Harian">
        <div className="min-h-[calc(100vh-12rem)] grid place-items-center">
          <div className="mx-auto w-[92px] h-[92px] rounded-full border-8 border-surface-container-high border-t-primary animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout currentPath="/daily-checkin" topbarTitle="Check-In Harian">
      <div className="max-w-[940px] mx-auto">
        {currentStep === 1 ? <SleepStep sleepHours={sleepHours} setSleepHours={setSleepHours} /> : null}
        {currentStep === 2 ? <WorkStep workHours={workHours} setWorkHours={setWorkHours} /> : null}
        {currentStep === 3 ? <QuestionnaireStep answers={questionnaireAnswers} setAnswers={setQuestionnaireAnswers} /> : null}
        {currentStep === 4 ? (
          <StepFour
            isAnalyzed={isAnalyzed}
            score={score}
            risk={risk}
            sleepHours={sleepHours}
            workHours={workHours}
            onEditAnswers={() => setCurrentStep(3)}
            alreadySubmitted={alreadyCheckedIn}
            note={note}
            warning={warning}
          />
        ) : null}

        {errorText ? <p className="mt-5 text-sm text-error">{errorText}</p> : null}

        <div className="mt-8 flex flex-col sm:flex-row justify-between gap-3">
          {currentStep > 1 && currentStep < 4 ? (
            <button
              type="button"
              onClick={goPrev}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white border border-outline-variant px-7 py-3 text-on-surface font-bold hover:bg-surface-container-low transition"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Kembali
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-white font-bold shadow-lg shadow-primary/20 hover:opacity-95 active:scale-95 transition"
            >
              Selanjutnya
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          ) : null}

          {currentStep === 3 ? (
            <button
              type="button"
              onClick={analyzeCheckIn}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3 text-white font-bold shadow-lg shadow-primary/20 hover:opacity-95 active:scale-95 transition"
            >
              Analisis Check-In
              <span className="material-symbols-outlined">send</span>
            </button>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  )
}
