<div align="center">

# 🧠 BurnoutLens — Burnout Predict

**Platform Kesehatan Mental berbasis AI untuk Memantau & Mencegah Burnout**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat&logo=postgresql&logoColor=white)](https://supabase.com/)
[![FastAPI](https://img.shields.io/badge/ML%20Service-FastAPI-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat&logo=vercel)](https://vercel.com/)

</div>

---

## 📖 Tentang Proyek

**BurnoutLens** adalah aplikasi web full-stack yang membantu pengguna **memantau, memahami, dan mencegah burnout** secara proaktif setiap hari. Aplikasi ini dibangun di atas tiga layanan utama yang saling terintegrasi:

| Layanan | Stack | Fungsi |
|---------|-------|--------|
| **Front-End SPA** | React 19 + Vite + TypeScript | Antarmuka pengguna responsif |
| **Back-End API** | Node.js + Express 5 + PostgreSQL | RESTful API & logika bisnis |
| **ML Service** | Python + FastAPI (Hugging Face Spaces) | Prediksi burnout & deteksi emosi |

Dengan memadukan **model Machine Learning (LSTM Forecasting + Text Emotion Classification)** dan **Google Gemini AI**, platform ini mampu:
- Memprediksi **tingkat burnout esok hari** (Rendah / Sedang / Tinggi) berdasarkan pola historis 7 hari
- Mendeteksi **5 emosi dominan** dari teks jurnal harian secara otomatis
- Menghasilkan **rekomendasi & motivasi personal** yang hangat dan empatik setiap hari

---

## ✨ Fitur Lengkap Aplikasi

### 🔐 Sistem Autentikasi & Keamanan
- **Registrasi** akun baru dengan password di-hash menggunakan **bcryptjs**
- **Verifikasi Email** via OTP 6-digit yang dikirim melalui SMTP (Resend/Nodemailer)
- **Login** menghasilkan **JWT Token** dengan masa aktif yang bisa dikonfigurasi
- **Kirim Ulang OTP** jika kode kadaluwarsa (5 menit)
- **Navigation Guard**: Protected Routes (hanya untuk user terlogin) & Public-Only Routes (redirect jika sudah login)
- Penyimpanan sesi aman di `localStorage` dengan struktur `AuthSession`

### 📊 Daily Check-In (4 Langkah)

Alur wizard check-in harian yang terstruktur:

| Langkah | Konten | Detail |
|---------|--------|--------|
| **Step 1** — Jam Tidur | Slider interaktif | Range 0–24 jam dengan indikator visual |
| **Step 2** — Jam Kerja | Slider interaktif | Range 0–24 jam, catat aktivitas produktif |
| **Step 3** — Kuesioner | 10 pernyataan burnout | Setiap pernyataan dinilai 1–10 (Sangat Tidak Setuju → Sangat Setuju) |
| **Step 4** — Hasil | Dashboard skor & rekomendasi | Skor burnout, level risiko, insight AI, prediksi besok |

**Alur backend setelah submit:**
1. Hitung skor kuesioner (rata-rata × 10 → skala 0–100)
2. Ambil histori 7 hari terakhir dari database
3. Panggil **FastAPI ML** (`/predict-burnout`) → dapat `final_burnout_score`, `final_burnout_level`, `trend_warning`
4. Ambil emosi dominan dari jurnal hari ini (untuk konteks Gemini)
5. Panggil **Google Gemini AI** → dapat `burnout_note` & `dashboard_recommendation`
6. Simpan semua hasil ke tabel `daily_checkins`

### 📝 Jurnal Harian + Deteksi Emosi AI
- Editor teks bebas yang bersih dan minimalis
- Tombol **"Analisis Jurnal"** → kirim teks ke ML Service
- Model ML mendeteksi 5 emosi + probabilitas: `anger`, `fear`, `happy`, `love`, `sadness`
- **Gemini AI** membalas dengan pesan motivasi/empati per emosi dominan
- Kartu **Refleksi AI** menampilkan: emosi dominan + rekomendasi
- Tersimpan otomatis ke `journals`, `journal_emotions`, `journal_motivations`

### 🗓️ Mood Map — Kalender Emosi Bulanan
- Visualisasi kalender bulanan berwarna berdasarkan emosi dominan per hari
- Navigasi bulan dengan tombol prev/next
- **Klik tanggal** → tampilkan panel detail di sidebar
- Panel detail: emosi dominan, skor burnout, jam tidur/kerja, insight, motivasi, daftar jurnal
- Filter tab: **Semua** / **Jurnal** / **Check-In**
- Legenda warna mood: Tenang, Bahagia, Cemas, Lelah, Stres, Sedih

### 📈 Dashboard Interaktif
- **Kartu Prediksi Esok Hari**: Skor burnout (%), level risiko berwarna (Rendah/Sedang/Tinggi), rekomendasi utama, donut chart animasi
- **Ringkasan Check-In Hari Ini**: Skor burnout, jam tidur, jam kerja
- **Grafik Tren 7 Hari**: Bar chart dengan tooltip hover, warna adaptif per level risiko
- **Tren Warning**: Peringatan dari 3 check-in terakhir
- **Pratinjau Jurnal Terakhir**: Kutipan jurnal + emosi terdeteksi
- **Floating CTA Button**: Akses cepat ke halaman Check-In

### 🔌 Dokumentasi API Swagger UI
- Tersedia di endpoint `/docs` pada backend
- Mendukung dua spesifikasi: **NodeJS Backend API** & **FastAPI ML API**
- Dropdown pemilih API dengan explorer aktif
- Dapat langsung diuji dari browser tanpa tools eksternal

---

## 📁 Struktur Repositori

```
Burnout-Predict/
│
├── backend/                           # Node.js + Express REST API
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                  # Koneksi @databases/pg ke PostgreSQL
│   │   │   └── mailer.js              # Nodemailer SMTP untuk kirim OTP
│   │   ├── controllers/
│   │   │   ├── authController.js      # register, verifyOTP, login, resendOTP
│   │   │   ├── journalController.js   # createJournal, getJournals
│   │   │   └── predictController.js   # createCheckin, getCheckins
│   │   ├── middleware/
│   │   │   └── authMiddleware.js      # Verifikasi JWT Bearer Token
│   │   ├── routes/
│   │   │   ├── authRoutes.js          # /register /verify-otp /login /resend-otp
│   │   │   ├── journalRoutes.js       # POST & GET /journal (protected)
│   │   │   └── predictRoutes.js       # POST & GET /predict (protected)
│   │   └── utils/
│   │       └── response.js            # successResponse() & errorResponse()
│   ├── migrations/                    # File SQL migrasi (urutan kronologis)
│   ├── swagger-backend.json           # Spesifikasi OpenAPI 3.0 NodeJS API
│   ├── swagger-ml.json                # Spesifikasi OpenAPI 3.0 FastAPI ML
│   ├── index.js                       # Entrypoint: Express + Swagger UI setup
│   ├── migrations.js                  # Runner migrasi (umzug)
│   ├── API_DOCS.md                    # Dokumentasi API format Markdown
│   └── vercel.json                    # Konfigurasi deploy Vercel backend
│
├── front-end/                         # React 19 + Vite + TypeScript SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AuthLayout.tsx     # Wrapper layout halaman auth
│   │   │   │   ├── DashboardLayout.tsx# Wrapper layout dalam aplikasi
│   │   │   │   ├── Sidebar.tsx        # Navigasi sidebar
│   │   │   │   └── Topbar.tsx         # Topbar + info user + logout
│   │   │   └── ui/
│   │   │       ├── Button.tsx         # Komponen tombol reusable
│   │   │       ├── Card.tsx           # Komponen kartu reusable
│   │   │       └── Input.tsx          # Komponen input reusable
│   │   ├── data/
│   │   │   └── mockDashboardData.ts   # Interface & helper tipe data dashboard
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx        # Halaman beranda publik (marketing)
│   │   │   ├── LoginPage.tsx          # Form login
│   │   │   ├── RegisterPage.tsx       # Form registrasi
│   │   │   ├── OtpVerifyPage.tsx      # Verifikasi OTP (animasi Framer Motion)
│   │   │   ├── DashboardPage.tsx      # Dashboard utama & widget
│   │   │   ├── DailyCheckInPage.tsx   # Check-in wizard 4 langkah
│   │   │   ├── JournalPage.tsx        # Tulis jurnal + AI reflection
│   │   │   ├── MoodMapPage.tsx        # Kalender emosi + riwayat
│   │   │   └── NotFoundPage.tsx       # Halaman 404
│   │   ├── routes/
│   │   │   └── AppRouter.tsx          # React Router + ProtectedRoute guard
│   │   ├── services/
│   │   │   ├── apiClient.ts           # HTTP client terpusat (fetch + timeout 15s)
│   │   │   ├── authService.ts         # register, login, OTP, session management
│   │   │   ├── trackingService.ts     # createCheckIn, getCheckIns, createJournal, getJournals
│   │   │   ├── historyService.ts      # Riwayat lokal & agregasi kalender mood
│   │   │   └── predictionService.ts   # Fetch prediksi burnout terbaru
│   │   └── types/
│   │       ├── auth.ts                # Tipe payload & response autentikasi
│   │       ├── tracking.ts            # CheckIn, Journal, CreateCheckInPayload
│   │       └── user.ts                # User, AuthSession, RegisteredUser
│   ├── public/                        # Aset statis
│   ├── vercel.json                    # SPA rewrite rules untuk Vercel
│   ├── tailwind.config.ts             # Sistem desain & token warna Material Design
│   ├── vite.config.ts                 # Konfigurasi Vite
│   └── tsconfig.app.json              # Konfigurasi TypeScript
│
├── machine_learning/                      # Python FastAPI ML Service
│   ├── AI_Forecasting-Burnout Predict/    # Forecasting model
│   ├── AI_Text Emotion/                   # Text emotion model
│   ├── requirements.txt                   # Dependencies
│   ├── server.py                          # FastAPI server
│   └── Dockerfile                         # Docker configuration
└── README.md
```

---

## 🛠️ Tech Stack

### Front-End
| Library | Versi | Kegunaan |
|---------|-------|---------|
| React | 19 | Framework UI SPA |
| Vite | 8 | Build tool & dev server |
| TypeScript | ~6 | Type safety |
| Tailwind CSS | 3.4 | Utility-first styling + Material Design tokens |
| React Router DOM | 7 | Client-side routing & navigation guards |
| Framer Motion | 12 | Animasi halaman & micro-interactions |

### Back-End
| Library | Versi | Kegunaan |
|---------|-------|---------|
| Node.js | ≥ 18 | Runtime server |
| Express | 5 | RESTful API framework |
| @databases/pg | 5.5 | PostgreSQL driver (tagged template SQL) |
| jsonwebtoken | 9 | JWT generation & validation |
| bcryptjs | 3 | Password hashing |
| nodemailer | 8 | Kirim OTP via SMTP |
| swagger-ui-express | 5 | Serve dokumentasi interaktif |
| umzug | 3.8 | Database migration runner |

### Database & Infrastruktur
| Layanan | Fungsi |
|---------|--------|
| PostgreSQL (via Supabase) | Database relasional utama |
| Vercel | Hosting front-end & back-end |
| Hugging Face Spaces | Hosting FastAPI ML service |

### AI & Machine Learning
| Layanan | Fungsi |
|---------|--------|
| FastAPI (Python) | Framework serving model ML |
| Model GRU Forecasting | Prediksi skor burnout esok hari dari time series |
| Model Text Classifier | Deteksi 5 emosi dari teks jurnal |
| Google Gemini AI | Generasi rekomendasi & pesan motivasi personal |

---

## 🗄️ Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users {
        int id PK
        varchar name
        varchar email
        varchar password
        boolean is_verified
        varchar otp
        timestamp otp_expiry
        timestamp created_at
    }

    daily_checkins {
        int id PK
        int user_id FK
        decimal sleep_hours
        decimal work_hours
        int score_assessment
        decimal final_burnout_score
        varchar final_burnout_level
        text note
        text warning
        text dashboard_recommendation
        timestamp created_at
    }

    journals {
        int id PK
        int user_id FK
        text content
        timestamp created_at
    }

    journal_emotions {
        int id PK
        int journal_id FK
        varchar emotion
        decimal probability
    }

    journal_motivations {
        int id PK
        int journal_id FK
        varchar emotion
        text message
    }

    users ||--o{ daily_checkins : "melakukan"
    users ||--o{ journals : "menulis"
    journals ||--o{ journal_emotions : "memiliki"
    journals ||--o{ journal_motivations : "mendapat"
```

**Keterangan Relasi:**
- Satu `user` dapat memiliki banyak `daily_checkins` (one-to-many)
- Satu `user` dapat memiliki banyak `journals` (one-to-many)
- Satu `journal` dapat memiliki banyak `journal_emotions` — satu per emosi yang terdeteksi (one-to-many)
- Satu `journal` dapat memiliki banyak `journal_motivations` — satu pesan per emosi dominan (one-to-many)

---

## 🔄 System Flow (DFD)

```mermaid
sequenceDiagram
    autonumber
    
    box rgb(240, 248, 255) "Client / User Interface"
        actor User as Pengguna
        participant FE as Frontend (UI)
    end
    
    box rgb(245, 255, 250) "Core Logic & Database"
        participant BE as Backend & DB
    end

    box rgb(255, 250, 240) "AI & ML Services"
        participant ML as ML Model Engine
        participant AI as Generative AI (LLM)
    end

    %% 1. AUTENTIKASI SECTION
    rect rgb(230, 240, 255)
        Note over User, AI: 1. Autentikasi & Akses Masuk
        alt Alur Register (Belum Punya Akun)
            User->>FE: Isi Email & Password Baru -> Klik Register
            FE->>BE: Request OTP Register
            BE-->>User: Kirim Kode OTP ke Email
            User->>FE: Masukkan Kode OTP
            FE->>BE: Validasi OTP
            alt OTP Valid
                BE-->>FE: Registrasi Berhasil & Kirim Token Session
                FE-->>User: Redirect ke Personal Dashboard
            else OTP Salah
                BE-->>FE: Error: OTP Salah / Kadaluarsa
                FE-->>User: Tampilkan Pesan Error
            end
        else Alur Login (Sudah Punya Akun)
            User->>FE: Isi Email & Password -> Klik Masuk
            FE->>BE: Verifikasi Kredensial Login
            alt Kredensial Benar
                BE-->>FE: Login Sukses & Kirim Token Session
                FE-->>User: Redirect ke Personal Dashboard
            else Kredensial Salah
                BE-->>FE: Error: Email/Password Salah
                FE-->>User: Tampilkan Pesan Gagal Login
            end
        end
    end

    %% 2. FITUR 1: DAILY CHECK-IN
    rect rgb(255, 240, 230)
        Note over User, AI: 2. Fitur 1: Daily Check-In
        User->>FE: Buka Menu Daily Check-In
        User->>FE: Isi Jam Tidur, Kerja & Kuesioner -> Klik Submit
        FE->>BE: Kirim Data Metrik Harian
        BE->>BE: Simpan Metrik ke Database
        BE->>ML: Oper Data Metrik & Hasil Kuesioner
        Note over ML: Hitung Skor Burnout Hari Ini<br/>& Prediksi Risiko Besok
        ML-->>BE: Return (Skor Burnout & Teks Prediksi)
        BE-->>FE: Kirim Hasil Analisis Burnout
        FE-->>User: Tampilkan Skor Hari Ini & Prediksi Esok Hari
        User->>FE: Klik Selesai
        FE->>BE: Request Refresh Data Dashboard
        BE-->>FE: Kirim Data Terbaru
        FE-->>User: Tampilkan Dashboard Ter-update
    end

    %% 3. FITUR 2: DAILY JOURNAL (DENGAN PENYIMPANAN DATA ML & GEN AI)
    rect rgb(235, 250, 240)
        Note over User, AI: 3. Fitur 2: Daily Journal
        User->>FE: Buka Menu Daily Journal
        User->>FE: Ketik Cerita/Keluh Kesah -> Klik Analisis
        FE->>BE: Kirim Teks Jurnal
        BE->>BE: Simpan Teks Jurnal ke Database
        BE->>ML: Oper Teks Jurnal (Sentiment Analysis)
        Note over ML: Ekstrak & Prediksi<br/>2 Emosi Paling Dominan
        ML-->>BE: Return (2 Label Emosi)
        BE->>AI: Kirim 2 Emosi (Prompt: Generate Kata-Kata Motivasi/Refleksi)
        Note over AI: Proses Penggenerasian Kalimat<br/>berdasarkan Emosi
        AI-->>BE: Return (Kalimat Respons AI)
        
        %% --- BAGIAN PENYIMPANAN YANG BARU DITAMBAHKAN ---
        BE->>BE: Simpan Hasil (2 Emosi & Kalimat AI) ke Database
        %% ------------------------------------------------
        
        BE-->>FE: Kirim Hasil Lengkap (2 Emosi + Teks Gen AI)
        FE-->>User: Tampilkan 2 Emosi & Kalimat Refleksi AI ke User
        User->>FE: Klik Selesai / Kembali ke Dashboard
        FE->>BE: Request Refresh Data Dashboard
        BE-->>FE: Kirim Data Terbaru
        FE-->>User: Tampilkan Dashboard Ter-update
    end

    %% 4. FITUR 3: MOOD MAPPING
    rect rgb(255, 245, 225)
        Note over User, AI: 4. Fitur 3: Mood Mapping
        User->>FE: Buka Menu Mood Mapping Bulanan
        FE->>BE: Request Data Emosi (Rentang 1 Bulan)
        BE->>BE: Query & Agregasi Data Jurnal Bulanan
        Note over BE: Kalkulasi Emosi Paling Dominan<br/>Per Hari di Bulan Tersebut
        BE-->>FE: Kirim Array Data Emosi Dominan Bulanan
        FE->>FE: Render Tampilan Kalender Mood
        FE-->>User: Tampilkan Visual Kalender Mood Full 1 Bulan
        User->>FE: Klik Kembali
        FE-->>User: Arahkan ke Hub Utama (Dashboard)
    end
```

---

## 🌐 Rute Halaman

| Path | Akses | Halaman | Deskripsi |
|------|-------|---------|-----------|
| `/` | Publik | LandingPage | Beranda marketing & CTA |
| `/register` | Publik only | RegisterPage | Form daftar akun |
| `/login` | Publik only | LoginPage | Form login |
| `/otp-verify` | Publik only | OtpVerifyPage | Input & verifikasi OTP |
| `/dashboard` | 🔒 Protected | DashboardPage | Dashboard & ringkasan harian |
| `/daily-checkin` | 🔒 Protected | DailyCheckInPage | Wizard check-in 4 langkah |
| `/journal` | 🔒 Protected | JournalPage | Tulis jurnal + AI reflection |
| `/mood-map` | 🔒 Protected | MoodMapPage | Kalender emosi & riwayat |
| `*` | Publik | NotFoundPage | Halaman 404 |

---

## 🔌 Dokumentasi API

**Base URL Produksi:** `https://burnout-predict.vercel.app/api/v1`  
**Base URL Lokal:** `http://localhost:5000/api/v1`  
**Swagger UI:** `http://localhost:5000/docs`

### Autentikasi
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|:----:|-----------|
| POST | `/auth/register` | ✗ | Daftar akun baru, kirim OTP ke email |
| POST | `/auth/verify-otp` | ✗ | Verifikasi OTP → kembalikan JWT |
| POST | `/auth/login` | ✗ | Login → kembalikan JWT |
| POST | `/auth/resend-otp` | ✗ | Kirim ulang OTP baru |

### Check-In & Prediksi Burnout
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|:----:|-----------|
| POST | `/predict` | ✅ JWT | Submit check-in, jalankan ML + Gemini |
| GET | `/predict` | ✅ JWT | Ambil semua riwayat check-in (descending) |

### Jurnal Harian
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|:----:|-----------|
| POST | `/journal` | ✅ JWT | Buat jurnal, deteksi emosi ML + Gemini |
| GET | `/journal` | ✅ JWT | Ambil semua jurnal (`?limit=N` opsional) |

### Utilitas
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|:----:|-----------|
| GET | `/profile` | ✅ JWT | Data profil user dari JWT |
| GET | `/health` | ✗ | Health check server |

---

## 🚀 Cara Menjalankan Secara Lokal

### Prasyarat
- **Node.js** ≥ 18 dan npm
- **PostgreSQL** atau akun [Supabase](https://supabase.com) (gratis)
- Akun **Resend** atau SMTP lain untuk pengiriman email OTP
- **Google AI Studio API Key** untuk fitur Gemini
- (Opsional) Instance FastAPI ML yang berjalan

---

### 1. Clone Repositori

```bash
git clone https://github.com/novanzahr/Burnout-Predict.git
cd Burnout-Predict
```

---

### 2. Setup & Jalankan Backend

```bash
cd backend
npm install
```

Salin `.env.example` menjadi `.env` dan isi nilainya:

```env
PORT=5000

# Koneksi PostgreSQL (format Supabase/standard)
DB_URL=postgresql://user:password@host:5432/dbname

# JSON Web Token
JWT_SECRET=ganti-dengan-secret-yang-kuat
JWT_EXPIRES_IN=1d

# SMTP untuk pengiriman OTP (contoh Resend)
EMAIL_HOST=smtp.resend.com
EMAIL_PORT=465
EMAIL_USER=resend
EMAIL_PASS=re_xxxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@yourdomain.com

# URL FastAPI ML Service
AI_SERVICE_URL=https://your-space.hf.space/

# Google Gemini AI
GEN_AI_API=AIzaSy_your_gemini_api_key
```

Jalankan migrasi database untuk membuat semua tabel:

```bash
npm run migrate
```

Jalankan server backend (mode development dengan hot-reload):

```bash
npm run dev
```

> Server berjalan di **http://localhost:5000**  
> Swagger UI tersedia di **http://localhost:5000/docs**

---

### 3. Setup & Jalankan Front-End

Buka terminal baru:

```bash
cd front-end
npm install
```

Salin `.env.example` menjadi `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_USE_MOCK_API=false
VITE_APP_NAME=BurnoutLens
```

> **Tips:** Set `VITE_USE_MOCK_API=true` untuk menjalankan aplikasi tanpa backend, menggunakan data mock dari `localStorage`.

Jalankan dev server:

```bash
npm run dev
```

> Aplikasi berjalan di **http://localhost:5173**

---

## 🔧 Daftar Script NPM

### Backend (`/backend`)
```bash
npm run dev              # Server dengan hot-reload (node --watch)
npm start                # Server production
npm run migrate          # Jalankan semua migrasi SQL (UP)
npm run migrate:rollback # Rollback migrasi terakhir (DOWN)
```

### Front-End (`/front-end`)
```bash
npm run dev              # Dev server Vite
npm run build            # Type-check + build production (dist/)
npm run lint             # Jalankan ESLint
npm run preview          # Preview hasil build secara lokal
```

---

## 🤝 Author

Proyek ini dibuat untuk keperluan **Capstone Project** CodingCamp 2026 by DBS Foundation

Team:

* Adhitya Putra Arif Nugroho - CFCC726D6Y0138 - Full-Stack Web Developer - [GitHub](https://github.com/crashyet)
* Raihan Faisal Ramdani - CFCC313D6Y0687 - Full-Stack Web Developer - [GitHub](https://github.com/ponyonye)
* Novanna Zahrah Zahrani - CACC284D6X2545 - AI Engineer - [GitHub](https://github.com/novanzahr)
* Fardaniyah Hazhiratul Dzauq - CACC284D6X0948 - AI Engineer - [GitHub](https://github.com/zhizhira)
* Nanik Erawati - CDCC284D6X2024 - Data Scientist - [GitHub](https://github.com/NanikErawati)
* Geisya Yuni Maura - CDCC284D6X2760 - Data Scientist - [GitHub](https://github.com/geisyamaura)

---

© 2026 **BurnoutLens** — Menjaga Kesejahteraan Mental Anda. 
