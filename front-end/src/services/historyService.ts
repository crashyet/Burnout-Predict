export interface DailyHistory {
  date: string // format: YYYY-MM-DD
  journal: string
  emotion: 'Tenang' | 'Bahagia' | 'Cemas' | 'Lelah' | 'Stres' | 'Sedih' | string
  burnoutScore: number
  riskLevel: 'Rendah' | 'Sedang' | 'Tinggi'
}

export interface JournalEntry {
  id: string
  date: string // format: YYYY-MM-DD
  content: string
  detectedEmotion: string
  insight: string
  recommendation: string
  createdAt: string
}

const DEFAULT_HISTORY: DailyHistory[] = [
  {
    date: '2026-05-29',
    journal: 'Hari ini cukup melelahkan karena banyak meeting, tapi bersyukur bisa menyelesaikan task utama sebelum sore. Sedikit cemas dengan tugas besok.',
    emotion: 'Lelah',
    burnoutScore: 50,
    riskLevel: 'Sedang'
  },
  {
    date: '2026-05-28',
    journal: 'Terjadi gangguan server produksi di pagi hari yang sangat menegangkan. Menguras energi untuk koordinasi dengan tim infrastruktur.',
    emotion: 'Stres',
    burnoutScore: 84,
    riskLevel: 'Tinggi'
  },
  {
    date: '2026-05-27',
    journal: 'Pekerjaan berjalan stabil hari ini. Berhasil menyelesaikan beberapa revisi dokumen penting dan sempat istirahat siang yang cukup.',
    emotion: 'Tenang',
    burnoutScore: 30,
    riskLevel: 'Rendah'
  },
  {
    date: '2026-05-26',
    journal: 'Sangat senang karena usulan proyek baru disetujui oleh manajemen! Rasanya semua lelah terbayarkan.',
    emotion: 'Bahagia',
    burnoutScore: 22,
    riskLevel: 'Rendah'
  },
  {
    date: '2026-05-22',
    journal: 'Hari ini saya merasa cukup lelah tapi masih bisa menyelesaikan tugas.',
    emotion: 'Lelah',
    burnoutScore: 76,
    riskLevel: 'Tinggi'
  },
  {
    date: '2026-05-15',
    journal: 'Menghabiskan waktu sore dengan berjalan kaki di taman kota. Menghirup udara segar sangat membantu menjernihkan pikiran.',
    emotion: 'Tenang',
    burnoutScore: 18,
    riskLevel: 'Rendah'
  },
  {
    date: '2026-05-12',
    journal: 'Merasa kurang tidur dan sulit berkonsentrasi sepanjang hari. Banyak pekerjaan tertunda.',
    emotion: 'Sedih',
    burnoutScore: 48,
    riskLevel: 'Sedang'
  },
  {
    date: '2026-05-08',
    journal: 'Khawatir berlebihan tentang presentasi triwulanan esok hari. Sulit untuk rileks.',
    emotion: 'Cemas',
    burnoutScore: 65,
    riskLevel: 'Sedang'
  },
  {
    date: '2026-05-05',
    journal: 'Berhasil melakukan deployment sistem baru tanpa kendala. Rasanya lega dan puas.',
    emotion: 'Bahagia',
    burnoutScore: 25,
    riskLevel: 'Rendah'
  },
  {
    date: '2026-05-01',
    journal: 'Menikmati hari libur dengan bersantai di rumah dan memasak makanan favorit.',
    emotion: 'Tenang',
    burnoutScore: 15,
    riskLevel: 'Rendah'
  }
]

const DEFAULT_JOURNALS: JournalEntry[] = [
  {
    id: 'j_1',
    date: '2026-05-29',
    content: 'Hari ini cukup melelahkan karena banyak meeting, tapi bersyukur bisa menyelesaikan task utama sebelum sore. Sedikit cemas dengan tugas besok.',
    detectedEmotion: 'Lelah',
    insight: 'Anda menunjukkan indikasi kelelahan fisik atau mental. Beban aktivitas yang tinggi tampaknya mulai memengaruhi energi Anda.',
    recommendation: 'Ambil jeda istirahat penuh selama 15-30 menit tanpa gawai. Hindari menambah tugas baru hari ini.',
    createdAt: '2026-05-29T10:30:00.000Z'
  },
  {
    id: 'j_2',
    date: '2026-05-28',
    content: 'Terjadi gangguan server produksi di pagi hari yang sangat menegangkan. Menguras energi untuk koordinasi dengan tim infrastruktur.',
    detectedEmotion: 'Stres',
    insight: 'Ada emosi frustrasi atau stres tinggi yang disebabkan oleh masalah pekerjaan mendesak.',
    recommendation: 'Lakukan peregangan fisik ringan dan dengarkan musik instrumental yang tenang untuk meredakan denyut jantung.',
    createdAt: '2026-05-28T09:15:00.000Z'
  },
  {
    id: 'j_3',
    date: '2026-05-27',
    content: 'Pekerjaan berjalan stabil hari ini. Berhasil menyelesaikan beberapa revisi dokumen penting dan sempat istirahat siang yang cukup.',
    detectedEmotion: 'Tenang',
    insight: 'Suasana hati Anda tergolong stabil dan damai hari ini.',
    recommendation: 'Lanjutkan rutinitas harian Anda dengan tetap memperhatikan keseimbangan hidup.',
    createdAt: '2026-05-27T17:00:00.000Z'
  },
  {
    id: 'j_4',
    date: '2026-05-26',
    content: 'Sangat senang karena usulan proyek baru disetujui oleh manajemen! Rasanya semua lelah terbayarkan.',
    detectedEmotion: 'Senang',
    insight: 'Anda mengekspresikan kepuasan dan rasa syukur hari ini.',
    recommendation: 'Nikmati momen ini dan pertahankan semangat positif ini!',
    createdAt: '2026-05-26T16:45:00.000Z'
  },
  {
    id: 'j_5',
    date: '2026-05-22',
    content: 'Hari ini saya merasa cukup lelah tapi masih bisa menyelesaikan tugas.',
    detectedEmotion: 'Lelah',
    insight: 'Kelelahan fisik terdeteksi akibat pengerjaan tugas yang berkelanjutan.',
    recommendation: 'Ambil waktu tidur malam yang lebih awal dan kurangi paparan layar sebelum tidur.',
    createdAt: '2026-05-22T15:20:00.000Z'
  }
]

export function getLocalDateString(): string {
  const d = new Date()
  const offset = d.getTimezoneOffset()
  const localDate = new Date(d.getTime() - (offset * 60 * 1000))
  return localDate.toISOString().split('T')[0]
}

export function getHistoryList(): DailyHistory[] {
  const stored = localStorage.getItem('user_history')
  if (!stored) {
    localStorage.setItem('user_history', JSON.stringify(DEFAULT_HISTORY))
    return DEFAULT_HISTORY
  }
  try {
    let list: DailyHistory[] = JSON.parse(stored)
    
    // Sync with today's checkin from localStorage if available
    const todayCheckinStr = localStorage.getItem('today_checkin')
    if (todayCheckinStr) {
      const todayCheckin = JSON.parse(todayCheckinStr)
      const todayStr = getLocalDateString()
      
      const index = list.findIndex(h => h.date === todayStr)
      if (index >= 0) {
        list[index] = {
          ...list[index],
          burnoutScore: todayCheckin.score,
          riskLevel: todayCheckin.risk,
          emotion: list[index].emotion || 'Lelah'
        }
      } else {
        list.unshift({
          date: todayStr,
          journal: '',
          emotion: 'Lelah',
          burnoutScore: todayCheckin.score,
          riskLevel: todayCheckin.risk
        })
      }
      localStorage.setItem('user_history', JSON.stringify(list))
    }

    return list
  } catch (e) {
    return DEFAULT_HISTORY
  }
}

export function saveHistoryItem(item: Partial<DailyHistory> & { date: string }): DailyHistory[] {
  const list = getHistoryList()
  const index = list.findIndex(h => h.date === item.date)
  if (index >= 0) {
    list[index] = {
      ...list[index],
      ...item
    } as DailyHistory
  } else {
    list.unshift({
      date: item.date,
      journal: item.journal || '',
      emotion: item.emotion || 'Tenang',
      burnoutScore: item.burnoutScore || 0,
      riskLevel: item.riskLevel || 'Rendah'
    })
  }
  localStorage.setItem('user_history', JSON.stringify(list))
  return list
}

export function getJournalList(): JournalEntry[] {
  const stored = localStorage.getItem('user_journals')
  if (!stored) {
    localStorage.setItem('user_journals', JSON.stringify(DEFAULT_JOURNALS))
    return DEFAULT_JOURNALS
  }
  try {
    return JSON.parse(stored)
  } catch (e) {
    return DEFAULT_JOURNALS
  }
}

export function getJournalsByDate(dateStr: string): JournalEntry[] {
  const list = getJournalList()
  return list
    .filter((j) => j.date === dateStr)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function saveJournalEntry(
  content: string,
  emotion: string,
  insight: string,
  recommendation: string
): JournalEntry {
  const journals = getJournalList()
  const todayStr = getLocalDateString()

  // Avoid saving duplicate journal entries with exact same content on today's date
  const duplicate = journals.find(
    (j) => j.date === todayStr && j.content.trim() === content.trim()
  )

  if (duplicate) {
    // Prevent duplicating the entry. We can update its metadata and fields, then return it.
    duplicate.detectedEmotion = emotion
    duplicate.insight = insight
    duplicate.recommendation = recommendation
    duplicate.createdAt = new Date().toISOString()
    localStorage.setItem('user_journals', JSON.stringify(journals))

    saveHistoryItem({
      date: todayStr,
      journal: content,
      emotion: emotion === 'Senang' ? 'Bahagia' : emotion,
    })

    return duplicate
  }

  const newEntry: JournalEntry = {
    id: `journal_${Date.now()}`,
    date: todayStr,
    content,
    detectedEmotion: emotion,
    insight,
    recommendation,
    createdAt: new Date().toISOString(),
  }

  journals.unshift(newEntry)
  localStorage.setItem('user_journals', JSON.stringify(journals))

  // Sync back to daily history
  saveHistoryItem({
    date: todayStr,
    journal: content,
    emotion: emotion === 'Senang' ? 'Bahagia' : emotion,
  })

  return newEntry
}

export function analyzeJournalText(text: string): {
  emotion: string
  insight: string
  recommendation: string
} {
  const lowerText = text.toLowerCase()
  let emotion = 'Netral'
  let insight = ''
  let recommendation = ''

  if (
    lowerText.includes('capek') ||
    lowerText.includes('lelah') ||
    lowerText.includes('burnout') ||
    lowerText.includes('pusing')
  ) {
    emotion = 'Lelah'
    insight = 'Anda menunjukkan indikasi kelelahan fisik atau mental. Beban aktivitas yang tinggi tampaknya mulai memengaruhi energi Anda.'
    recommendation = 'Ambil jeda istirahat penuh selama 15-30 menit tanpa gawai. Hindari menambah tugas baru hari ini.'
  } else if (
    lowerText.includes('cemas') ||
    lowerText.includes('takut') ||
    lowerText.includes('khawatir')
  ) {
    emotion = 'Cemas'
    insight = 'Terdapat tanda kecemasan atau kekhawatiran berlebih mengenai masa depan atau situasi saat ini.'
    recommendation = 'Lakukan latihan pernapasan dalam (teknik 4-7-8) selama 5 menit untuk membantu menenangkan pikiran Anda.'
  } else if (
    lowerText.includes('marah') ||
    lowerText.includes('kesal') ||
    lowerText.includes('emosi')
  ) {
    emotion = 'Marah'
    insight = 'Ada emosi frustrasi atau kejengkelan terhadap situasi atau interaksi sosial tertentu.'
    recommendation = 'Sempatkan waktu sendiri (time-out) sejenak, regangkan otot, atau tuliskan kekesalan Anda tanpa filter di kertas.'
  } else if (
    lowerText.includes('senang') ||
    lowerText.includes('lega') ||
    lowerText.includes('bahagia')
  ) {
    emotion = 'Senang'
    insight = 'Anda mengekspresikan kepuasan, rasa syukur, atau kegembiraan yang positif hari ini.'
    recommendation = 'Pertahankan momen menyenangkan ini! Bagikan energi positif ini dengan orang terdekat atau catat sebagai memori berharga.'
  } else {
    emotion = 'Netral'
    insight = 'Suasana hati Anda tergolong stabil dan netral hari ini tanpa adanya gejolak emosi ekstrem.'
    recommendation = 'Lanjutkan rutinitas harian Anda dengan tetap menjaga keseimbangan waktu kerja dan istirahat.'
  }

  return { emotion, insight, recommendation }
}
