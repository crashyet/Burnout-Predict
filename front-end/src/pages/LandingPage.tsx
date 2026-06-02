import { Link } from 'react-router-dom'

function LandingNavbar() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-surface/80 dark:bg-surface-dim/80 backdrop-blur-md shadow-sm shadow-primary/5 transition-all duration-300">
      <div className="flex justify-between items-center w-full px-container-margin py-4 max-w-7xl mx-auto">
        <div className="text-headline-md font-headline-md font-bold text-primary dark:text-primary">
          BurnoutLens
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#">Beranda</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#Burnout">Burnout</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#cara-kerja">Cara Kerja</a>
          <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors" href="#fitur">Fitur</a>
        </div>
        <div className="flex gap-4 items-center">
          <Link to="/login" className="px-6 py-2 rounded-full border border-primary text-primary font-label-md hover:bg-primary/5 transition-all duration-300 active:scale-95 inline-block">Masuk</Link>
          <Link to="/register" className="px-6 py-2 rounded-full bg-primary text-on-primary font-label-md shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all duration-300 active:scale-95 inline-block">Daftar</Link>
        </div>
      </div>
    </nav>
  )
}

function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-x-0 top-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 right-0 translate-x-1/2 w-[520px] max-w-full h-[520px] bg-transparent rounded-full blur-3xl -z-10" />
      </div>
      <div className="max-w-7xl mx-auto px-container-margin">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="font-headline-xl text-headline-xl lg:text-5xl leading-tight text-on-surface">
                Sebelum Lelah Menjadi <span className="text-gradient-primary">Burnout</span>, Kenali Batas Dirimu Hari Ini.
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
                BurnoutLens membantu kamu melakukan Daily Check-In, menulis Daily Journal, melihat prediksi burnout esok hari, dan memantau mood mapping bulanan.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="px-8 py-4 bg-primary text-on-primary rounded-full font-label-md text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95">
                Mulai Check-In
              </Link>
              <button
                onClick={() => {
                  const el = document.getElementById('cara-kerja');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-4 bg-surface-container text-primary rounded-full font-label-md text-lg hover:bg-surface-container-high transition-all active:scale-95 flex items-center gap-2"
                type="button"
              >
                <span className="material-symbols-outlined">play_circle</span>
                Lihat Cara Kerja
              </button>
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant opacity-80 pt-4">
              <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <p className="font-label-sm text-label-sm">Privat, suportif, dan dirancang untuk membantu kamu memahami diri dengan lebih tenang.</p>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div className="absolute bottom-8 right-0 w-[360px] max-w-full h-[360px] bg-transparent rounded-full -z-10 pointer-events-none" />
            <div className="glass-effect rounded-[2.5rem] p-8 shadow-2xl shadow-primary/10 border border-white/50 relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-error/20" />
                  <div className="w-3 h-3 rounded-full bg-tertiary/20" />
                  <div className="w-3 h-3 rounded-full bg-primary/20" />
                </div>
                <div className="h-2 w-32 bg-surface-container rounded-full" />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1 bg-surface-container-lowest rounded-[2.5rem] p-10 border border-surface-container shadow-sm">
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant mb-4 font-bold">Skor Burnout Hari Ini</p>
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle className="text-surface-container" cx="48" cy="48" fill="transparent" r="42" stroke="currentColor" strokeWidth="8" />
                        <circle className="text-primary" cx="48" cy="48" fill="transparent" r="42" stroke="currentColor" strokeDasharray="263.8" strokeDashoffset="79.1" strokeWidth="8" />
                      </svg>
                      <span className="absolute font-headline-md text-on-surface text-xl">70%</span>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest">Waspada</span>
                  </div>
                </div>

                <div className="col-span-2 md:col-span-1 space-y-4">
                  <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container shadow-sm">
                    <p className="text-[10px] uppercase text-on-surface-variant mb-1">Prediksi Besok</p>
                    <p className="font-label-md text-secondary">Risiko Sedang</p>
                  </div>
                  <div className="bg-white rounded-[2.5rem] p-10 border border-surface-container shadow-sm">
                    <p className="text-[10px] uppercase text-on-surface-variant mb-3">Emosi Dominan</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-error/10 text-error rounded text-[10px] font-bold italic">Lelah</span>
                      <span className="px-2 py-1 bg-tertiary/10 text-tertiary rounded text-[10px] font-bold italic">Cemas</span>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-[10px] font-bold italic">Tenang</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 bg-primary/5 rounded-[2.5rem] p-10 border border-primary/10 shadow-sm flex gap-4 items-start">
                  <div className="p-2 bg-primary rounded-xl shrink-0">
                    <span className="material-symbols-outlined text-on-primary text-sm">psychology</span>
                  </div>
                  <div>
                    <p className="font-label-md text-primary mb-1">Insight AI</p>
                    <p className="text-label-sm text-on-surface leading-snug">Pola tidurmu menurun minggu ini. Coba beri ruang untuk istirahat.</p>
                  </div>
                </div>

                <div className="col-span-2 flex items-end gap-1 h-12 px-4 opacity-40">
                  <div className="w-full bg-primary/20 h-[40%] rounded-t-sm" />
                  <div className="w-full bg-primary/20 h-[60%] rounded-t-sm" />
                  <div className="w-full bg-primary/20 h-[30%] rounded-t-sm" />
                  <div className="w-full bg-primary/20 h-[80%] rounded-t-sm" />
                  <div className="w-full bg-primary/60 h-[100%] rounded-t-sm" />
                  <div className="w-full bg-primary/20 h-[50%] rounded-t-sm" />
                  <div className="w-full bg-primary/20 h-[40%] rounded-t-sm" />
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 w-32 h-32 border border-primary/10 rounded-full animate-pulse" />
            <div className="absolute -top-6 -right-6 w-48 h-48 border border-secondary/10 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  )
}

function ProblemSection() {
  return (
    <section id="Burnout" className="scroll-mt-24 py-section-gap px-container-margin max-w-7xl mx-auto">
      <div className="text-center space-y-4 mb-16">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Merasa Lelah Padahal Baru Saja Bangun Tidur?</h2>
        <p className="font-body-md text-on-surface-variant max-w-2xl mx-auto">Burnout sering kali muncul perlahan. Kenali tanda-tandanya sebelum aktivitas harian terasa semakin berat.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-8 bg-surface-container-lowest rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-500 group border border-surface-container">
          <div className="w-14 h-14 bg-primary-fixed text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">battery_alert</span>
          </div>
          <h3 className="font-headline-md text-on-surface mb-3">Lelah Fisik & Mental</h3>
          <p className="text-on-surface-variant font-body-md">Energi terasa terkuras sepanjang hari, bahkan setelah tidur atau beristirahat.</p>
        </div>
        <div className="p-8 bg-surface-container-lowest rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-500 group border border-surface-container">
          <div className="w-14 h-14 bg-secondary-fixed text-secondary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">trending_down</span>
          </div>
          <h3 className="font-headline-md text-on-surface mb-3">Kehilangan Motivasi</h3>
          <p className="text-on-surface-variant font-body-md">Tugas yang biasanya bisa dikerjakan mulai terasa berat dan sulit dimulai.</p>
        </div>
        <div className="p-8 bg-surface-container-lowest rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-500 group border border-surface-container">
          <div className="w-14 h-14 bg-tertiary-fixed text-tertiary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">mood_bad</span>
          </div>
          <h3 className="font-headline-md text-on-surface mb-3">Emosi Lebih Sensitif</h3>
          <p className="text-on-surface-variant font-body-md">Kamu jadi lebih mudah cemas, frustrasi, atau kewalahan oleh hal-hal kecil.</p>
        </div>
      </div>
    </section>
  )
}

function FlowSection() {
  return (
    <section id="cara-kerja" className="scroll-mt-24 py-section-gap bg-surface-container-low overflow-hidden">
      <div className="px-container-margin max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-20">
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Pantau Kondisimu dalam Alur yang Sederhana</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          <div className="relative z-10 flex flex-col items-center text-center p-8 bg-white rounded-[2rem] border border-surface-container shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-3xl">assignment_turned_in</span>
            </div>
            <h4 className="font-label-md text-on-surface mb-2 font-bold">1. Daily Check-In</h4>
            <p className="text-body-sm text-on-surface-variant text-sm leading-relaxed">Catat jam tidur, jam kerja, dan jawab pertanyaan singkat tentang kondisimu hari ini.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center p-8 bg-white rounded-[2rem] border border-surface-container shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-6 group-hover:bg-secondary group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-3xl">edit_note</span>
            </div>
            <h4 className="font-label-md text-on-surface mb-2 font-bold">2. Daily Journal</h4>
            <p className="text-body-sm text-on-surface-variant text-sm leading-relaxed">Tulis refleksi harian agar pola emosi dan pemicu stres lebih mudah dikenali.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center p-8 bg-white rounded-[2rem] border border-surface-container shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center mb-6 group-hover:bg-tertiary group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-3xl">psychology</span>
            </div>
            <h4 className="font-label-md text-on-surface mb-2 font-bold">3. Prediksi Burnout Esok Hari</h4>
            <p className="text-body-sm text-on-surface-variant text-sm leading-relaxed">Lihat estimasi risiko burnout untuk esok hari berdasarkan data check-in dan jurnal.</p>
          </div>

          <div className="relative z-10 flex flex-col items-center text-center p-8 bg-white rounded-[2rem] border border-surface-container shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 group">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-3xl">calendar_month</span>
            </div>
            <h4 className="font-label-md text-on-surface mb-2 font-bold">4. Mood Mapping</h4>
            <p className="text-body-sm text-on-surface-variant text-sm leading-relaxed">Pantau riwayat emosi dan skor burnout dalam tampilan bulanan yang mudah dibaca.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function DetailedFeatures() {
  return (
    <section id="fitur" className="scroll-mt-24 py-section-gap px-container-margin max-w-7xl mx-auto">
      <div className="text-center space-y-4 mb-20">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Fitur Utama untuk Kesadaran Diri</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card 1: Daily Check-In */}
        <div className="group relative bg-white rounded-[2.5rem] p-10 shadow-sm border border-surface-container overflow-hidden hover:shadow-xl transition-all duration-700">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="mb-6">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined">checklist</span>
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">Daily Check-In</h3>
              <p className="font-body-md text-on-surface-variant">
                Catat jam tidur, jam kerja, dan jawab pertanyaan singkat untuk melihat kondisi burnout harianmu.
              </p>
            </div>

            {/* Preview UI */}
            <div className="bg-surface-container-low/50 rounded-2xl p-4 border border-outline-variant/10 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant">
                <span>METRIK HARI INI</span>
                <span className="material-symbols-outlined text-sm">check_circle</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white rounded-xl p-2.5 border border-outline-variant/10 shadow-sm">
                  <p className="text-[10px] text-on-surface-variant">Jam Tidur</p>
                  <p className="text-sm font-extrabold text-on-surface">7.5 Jam</p>
                </div>
                <div className="bg-white rounded-xl p-2.5 border border-outline-variant/10 shadow-sm">
                  <p className="text-[10px] text-on-surface-variant">Jam Kerja</p>
                  <p className="text-sm font-extrabold text-on-surface">8 Jam</p>
                </div>
                <div className="bg-white rounded-xl p-2.5 border border-outline-variant/10 shadow-sm col-span-2 flex justify-between items-center px-3">
                  <div>
                    <p className="text-[10px] text-on-surface-variant text-left">Skor Burnout</p>
                    <p className="text-xs font-extrabold text-on-surface text-left">45 / 100</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200/50">Risiko Sedang</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Daily Journal */}
        <div className="group relative bg-white rounded-[2.5rem] p-10 shadow-sm border border-surface-container overflow-hidden hover:shadow-xl transition-all duration-700">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="mb-6">
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined">auto_awesome</span>
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">Daily Journal</h3>
              <p className="font-body-md text-on-surface-variant">
                Tulis refleksi harian untuk membantu mengenali emosi, pemicu stres, dan pola aktivitas yang memengaruhi kondisimu.
              </p>
            </div>

            {/* Preview UI */}
            <div className="bg-surface-container-low/50 rounded-2xl p-4 border border-outline-variant/10 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant">
                <span>REFLEKSI JURNAL</span>
                <span className="material-symbols-outlined text-sm">edit_note</span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-outline-variant/10 shadow-sm space-y-2">
                <p className="text-[11px] text-on-surface-variant italic leading-relaxed">
                  "Hari ini pekerjaan sangat padat... merasa sedikit lelah."
                </p>
                <div className="flex justify-between items-center pt-2 border-t border-outline-variant/5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-surface-container-high text-on-primary-container border border-outline-variant/30">Emosi: Lelah</span>
                  <span className="text-[9px] text-on-surface-variant">17:30 WIB</span>
                </div>
              </div>
              <div className="bg-primary/5 rounded-xl p-3 border border-primary/10 flex gap-2 items-start">
                <span className="material-symbols-outlined text-primary text-xs shrink-0 mt-0.5">tips_and_updates</span>
                <p className="text-[10px] text-on-surface-variant leading-relaxed">
                  <span className="font-bold text-primary block">Rekomendasi AI:</span>
                  Prioritaskan tidur 7-8 jam malam ini dan luangkan waktu 15 menit untuk relaksasi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Prediksi Burnout Esok Hari */}
        <div className="group relative bg-white rounded-[2.5rem] p-10 shadow-sm border border-surface-container overflow-hidden hover:shadow-xl transition-all duration-700">
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="mb-6">
              <div className="w-12 h-12 bg-error/10 text-error rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined">speed</span>
              </div>
              <h3 className="font-headline-md text-on-surface mb-4">Prediksi Burnout Esok Hari</h3>
              <p className="font-body-md text-on-surface-variant">
                Lihat estimasi risiko burnout untuk esok hari berdasarkan data check-in dan jurnal yang kamu isi.
              </p>
            </div>

            {/* Preview UI */}
            <div className="bg-surface-container-low/50 rounded-2xl p-4 border border-outline-variant/10 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant">
                <span>PREDIKSI ESOK HARI</span>
                <span className="material-symbols-outlined text-sm">psychology</span>
              </div>
              <div className="bg-white rounded-xl p-3 border border-outline-variant/10 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-on-surface-variant">Estimasi Risiko</p>
                  <p className="text-sm font-extrabold text-on-surface">Sedang (55%)</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <span className="material-symbols-outlined text-lg">sentiment_neutral</span>
                </div>
              </div>
              <div className="bg-error-container/20 rounded-xl p-2.5 border border-error/15 flex gap-2 items-start">
                <span className="material-symbols-outlined text-error text-xs shrink-0 mt-0.5">warning</span>
                <p className="text-[9.5px] text-on-surface-variant leading-relaxed">
                  <span className="font-bold text-error block">Tren Warning:</span>
                  Kurang tidur dalam 2 hari terakhir terdeteksi.
                </p>
              </div>
              <div className="bg-white rounded-xl p-2.5 border border-outline-variant/10 text-[9.5px] text-on-surface-variant leading-relaxed">
                <span className="font-bold text-secondary block mb-0.5">Rekomendasi:</span>
                Kurangi aktivitas malam ini dan pastikan tidur cukup.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CalendarSection() {
  return (
    <section id="kalender" className="py-section-gap px-container-margin max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 relative">
          <div className="glass-effect rounded-[3rem] p-8 shadow-2xl shadow-primary/5">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-on-surface">Kalender Emosi</h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-surface-container rounded-full" type="button"><span className="material-symbols-outlined">chevron_left</span></button>
                <button className="p-2 hover:bg-surface-container rounded-full" type="button"><span className="material-symbols-outlined">chevron_right</span></button>
              </div>
            </div>

            <div className="calendar-grid-mini mb-6">
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d) => (
                <div key={d} className="text-center text-[10px] font-bold text-on-surface-variant uppercase">{d}</div>
              ))}

              <div className="calendar-cell-mini bg-transparent" />
              <div className="calendar-cell-mini bg-transparent" />
              <div className="calendar-cell-mini mood-tenang">1</div>
              <div className="calendar-cell-mini mood-bahagia">2</div>
              <div className="calendar-cell-mini mood-tenang">3</div>
              <div className="calendar-cell-mini mood-lelah">4</div>
              <div className="calendar-cell-mini mood-stres">5</div>
              <div className="calendar-cell-mini mood-cemas">6</div>
              <div className="calendar-cell-mini mood-lelah">7</div>
              <div className="calendar-cell-mini mood-sedih">8</div>
              <div className="calendar-cell-mini mood-tenang">9</div>
              <div className="calendar-cell-mini mood-bahagia">10</div>
              <div className="calendar-cell-mini mood-bahagia">11</div>
              <div className="calendar-cell-mini mood-tenang">12</div>
              <div className="calendar-cell-mini mood-stres">13</div>
              <div className="calendar-cell-mini bg-surface-bright text-outline border border-outline-variant/30">14</div>
              <div className="calendar-cell-mini bg-surface-bright text-outline border border-outline-variant/30">15</div>
              <div className="calendar-cell-mini bg-surface-bright text-outline border border-outline-variant/30">16</div>
              <div className="calendar-cell-mini bg-surface-bright text-outline border border-outline-variant/30">17</div>
              <div className="calendar-cell-mini bg-surface-bright text-outline border border-outline-variant/30">18</div>
              <div className="calendar-cell-mini bg-surface-bright text-outline border border-outline-variant/30">19</div>
            </div>

            <div className="border-t border-outline-variant/20 pt-5">
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">Legenda Mood</h4>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full mood-tenang" /><span className="text-[11px] text-on-surface">Tenang</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full mood-bahagia" /><span className="text-[11px] text-on-surface">Bahagia</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full mood-cemas" /><span className="text-[11px] text-on-surface">Cemas</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full mood-lelah" /><span className="text-[11px] text-on-surface">Lelah</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full mood-stres" /><span className="text-[11px] text-on-surface">Stres</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full mood-sedih" /><span className="text-[11px] text-on-surface">Sedih</span></div>
              </div>
            </div>

            <div className="mt-5 bg-primary/5 border border-primary/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
                <p className="text-[12px] font-bold text-primary">Insight AI BurnoutLens</p>
              </div>
              <p className="text-[12px] text-on-surface-variant leading-relaxed">Mood tenang dominan di awal bulan, dengan peningkatan stres menjelang akhir minggu kedua.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-4">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Pola Mood Lebih Mudah Terlihat</h2>
            <p className="font-body-lg text-on-surface-variant">Visualisasi bulanan memberikan gambaran besar tentang kesehatan mentalmu. Identifikasi faktor lingkungan yang mempengaruhi mood kamu secara objektif.</p>
          </div>
          <div className="p-8 bg-tertiary-container/10 border border-tertiary-container/20 rounded-[2rem] space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
              <h4 className="font-label-md text-tertiary">Insight Bulanan</h4>
            </div>
            <p className="font-body-md text-on-surface">"Mood cemas paling sering muncul di awal minggu. Coba perhatikan pola aktivitas atau tugas pada hari tersebut."</p>
            <button className="text-tertiary font-label-md flex items-center gap-2 group" type="button">
              Lihat Rekomendasi
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function CtaSection() {
  return (
    <section className="py-24 px-container-margin max-w-7xl mx-auto">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-container rounded-[3rem] p-12 lg:p-20 text-center text-on-primary">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute -top-1/2 -left-1/4 w-[800px] h-[800px] bg-white/5 rounded-full animate-[pulse_15s_infinite]" />
          <div className="absolute -bottom-1/2 -right-1/4 w-[600px] h-[600px] bg-white/5 rounded-full animate-[pulse_20s_infinite]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <h2 className="font-headline-xl text-headline-xl lg:text-5xl">Jangan Tunggu Sampai Benar-benar Lelah.</h2>
          <p className="font-body-lg text-on-primary/80">Mulai pantau energi, emosi, dan pola burnout-mu dari hari ini.</p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link to="/register" className="px-10 py-5 bg-white text-primary rounded-full font-bold text-lg shadow-2xl hover:bg-surface-bright transition-all active:scale-95">Daftar Sekarang</Link>
            <Link to="/login" className="px-10 py-5 border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all active:scale-95">Masuk ke Akun</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

function LandingFooter() {
  return (
    <footer className="bg-surface-container-low py-section-gap">
      <div className="flex flex-col items-center justify-center gap-base px-container-margin w-full max-w-7xl mx-auto">
        <div className="font-headline-md text-primary font-bold mb-4">BurnoutLens</div>
        <p className="font-label-sm text-label-sm text-on-surface-variant/60">© 2026 BurnoutLens. Capstone Project Dicoding x DBS Foundation</p>
      </div>
    </footer>
  )
}

export function LandingPage() {
  return (
    <div className="bg-background text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed font-body-md overflow-x-hidden">
      <LandingNavbar />
      <HeroSection />
      <ProblemSection />
      <FlowSection />
      <DetailedFeatures />
      <CalendarSection />
      <CtaSection />
      <LandingFooter />
    </div>
  )
}
