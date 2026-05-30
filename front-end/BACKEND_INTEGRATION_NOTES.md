# BurnoutLens — Backend Integration Notes

> Dokumen ini ditujukan untuk tim backend agar dapat menghubungkan REST API ke frontend BurnoutLens tanpa perlu mengubah tampilan atau logika UI.

---

## 1. Setup Environment

Buat file `.env` di root project frontend (salin dari `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_USE_MOCK_API=false
VITE_APP_NAME=BurnoutLens
```

> **`VITE_USE_MOCK_API=true`** → frontend berjalan penuh menggunakan `localStorage` / mock data (tidak butuh backend).  
> **`VITE_USE_MOCK_API=false`** → frontend memanggil endpoint backend nyata via `apiClient`.

---

## 2. Base URL

```
http://localhost:5000/api/v1
```

Dibaca dari `import.meta.env.VITE_API_BASE_URL`. Fallback ke URL di atas jika env tidak diset.  
File: `src/services/apiClient.ts`

---

## 3. Service Frontend & Fungsinya

| Service | File | Fungsi |
|---|---|---|
| API Client | `src/services/apiClient.ts` | HTTP helper terpusat (GET, POST, PUT, PATCH, DELETE) |
| Auth Service | `src/services/authService.ts` | Register, OTP, Login, Logout, Session |
| Tracking Service | `src/services/trackingService.ts` | Check-In dan Journal |
| Assessment Service | `src/services/assessmentService.ts` | Assessment kuesioner dan Prediksi Burnout |
| History Service | `src/services/historyService.ts` | Riwayat harian lokal (dipakai saat mock mode) |

---

## 4. Endpoint yang Diharapkan

### Auth

#### `POST /auth/register`

**Request body:**
```json
{
  "name": "Raihan Faisal",
  "email": "raihan@email.com",
  "password": "password123"
}
```

**Response ideal (200):**
```json
{
  "message": "Registrasi berhasil. Kode OTP telah dikirim ke email Anda."
}
```

---

#### `POST /auth/verify-otp`

**Request body:**
```json
{
  "email": "raihan@email.com",
  "otp_code": "123456"
}
```

**Response ideal (200):**
```json
{
  "message": "Verifikasi OTP berhasil.",
  "verified": true
}
```

---

#### `POST /auth/login`

**Request body:**
```json
{
  "email": "raihan@email.com",
  "password": "password123"
}
```

**Response ideal (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI...",
  "user": {
    "id": "usr_001",
    "name": "Raihan Faisal",
    "email": "raihan@email.com"
  }
}
```

> Token disimpan di `localStorage` dan dikirim sebagai `Authorization: Bearer <token>` pada semua request berikutnya.

---

### Profile

#### `GET /profile`

**Header:** `Authorization: Bearer <token>`

**Response ideal (200):**
```json
{
  "id": "usr_001",
  "name": "Raihan Faisal",
  "email": "raihan@email.com"
}
```

---

### Tracking

#### `POST /tracking/checkin`

**Header:** `Authorization: Bearer <token>`

**Request body:**
```json
{
  "date": "2026-05-30",
  "sleep_hours": 7,
  "work_hours": 9,
  "energy_level": 6,
  "stress_level": 7,
  "questionnaire_answers": [7, 8, 6, 9, 5, 7, 8, 6, 9, 7]
}
```

**Response ideal (200/201):**
```json
{
  "id": "chk_001",
  "date": "2026-05-30",
  "sleep_hours": 7,
  "work_hours": 9,
  "energy_level": 6,
  "stress_level": 7,
  "burnout_score": 72,
  "risk_level": "Tinggi",
  "created_at": "2026-05-30T10:00:00.000Z"
}
```

---

#### `GET /tracking/checkins`

**Header:** `Authorization: Bearer <token>`

**Response ideal (200):**
```json
[
  {
    "id": "chk_001",
    "date": "2026-05-30",
    "sleep_hours": 7,
    "work_hours": 9,
    "burnout_score": 72,
    "risk_level": "Tinggi",
    "created_at": "2026-05-30T10:00:00.000Z"
  }
]
```

atau dibungkus:
```json
{ "data": [ ... ] }
```

---

#### `POST /tracking/journal`

**Header:** `Authorization: Bearer <token>`

**Request body:**
```json
{
  "date": "2026-05-30",
  "content": "Hari ini terasa sangat melelahkan karena banyak meeting...",
  "detected_emotion": "Lelah",
  "insight": "Kelelahan fisik terdeteksi akibat aktivitas tinggi.",
  "recommendation": "Istirahat cukup malam ini."
}
```

**Response ideal (200/201):**
```json
{
  "id": "jnl_001",
  "date": "2026-05-30",
  "content": "Hari ini terasa sangat melelahkan...",
  "detected_emotion": "Lelah",
  "insight": "...",
  "recommendation": "...",
  "created_at": "2026-05-30T14:00:00.000Z"
}
```

---

#### `GET /tracking/journals`

**Header:** `Authorization: Bearer <token>`  
**Query param opsional:** `?date=2026-05-30`

**Response ideal (200):**
```json
[
  {
    "id": "jnl_001",
    "date": "2026-05-30",
    "content": "...",
    "detected_emotion": "Lelah",
    "insight": "...",
    "recommendation": "...",
    "created_at": "2026-05-30T14:00:00.000Z"
  }
]
```

---

### Assessment & Prediction

#### `POST /assessment/assessment`

**Header:** `Authorization: Bearer <token>`

**Request body:**
```json
{
  "answers": {
    "q1": 7, "q2": 8, "q3": 6, "q4": 9, "q5": 5,
    "q6": 7, "q7": 8, "q8": 6, "q9": 9, "q10": 7
  },
  "total_score": 72
}
```

**Response ideal (200):**
```json
{
  "id": "asc_001",
  "total_score": 72,
  "category": "Tinggi",
  "answers": { ... },
  "created_at": "2026-05-30T10:00:00.000Z"
}
```

---

#### `GET /assessment/assessments`

**Header:** `Authorization: Bearer <token>`

**Response ideal (200):** array/wrapped Assessment objects.

---

#### `POST /assessment/prediction`

**Header:** `Authorization: Bearer <token>`

**Request body:**
```json
{
  "sleep_hours": 7,
  "work_hours": 9,
  "assessment_score": 72
}
```

**Response ideal (200):**
```json
{
  "id": "pred_001",
  "prediction_score": 78,
  "risk_level": "Tinggi",
  "recommendation": "Segera kurangi beban kerja dan prioritaskan tidur cukup.",
  "created_at": "2026-05-30T10:00:00.000Z"
}
```

---

#### `GET /assessment/predictions`

**Header:** `Authorization: Bearer <token>`

**Response ideal (200):** array/wrapped Prediction objects, **terbaru di index 0**.

---

### Utility

#### `GET /health`

**Response ideal (200):**
```json
{ "status": "ok" }
```

---

## 5. Konvensi Penting

| Hal | Konvensi |
|---|---|
| Field nama | **snake_case** (contoh: `prediction_score`, `risk_level`, `created_at`) |
| Timestamp | ISO 8601 string: `"2026-05-30T10:00:00.000Z"` |
| Error HTTP | Gunakan status code yang benar (400, 401, 422, 500) |
| Error body | `{ "message": "Pesan error yang dapat dibaca pengguna" }` |
| Auth | Bearer token di header `Authorization` |
| List response | Array langsung `[...]` atau dibungkus `{ "data": [...] }` — keduanya diterima oleh adapter frontend |

---

## 6. Adapter / Normalizer

Frontend memiliki adapter di setiap service yang menangani perbedaan nama field antara backend dan UI:

- `normalizeCheckInResponse()` — di `trackingService.ts`
- `normalizeJournalResponse()` — di `trackingService.ts`
- `normalizePredictionResponse()` — di `assessmentService.ts`
- `normalizeAssessmentResponse()` — di `assessmentService.ts`

Jika nama field backend berbeda dari yang diharapkan, **cukup edit adapter di service-nya** — tidak perlu mengubah halaman UI.

---

## 7. Cara Mengaktifkan Mode API Nyata

1. Set `.env`:
   ```
   VITE_USE_MOCK_API=false
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```
2. Jalankan backend di `http://localhost:5000`
3. Jalankan frontend: `npm run dev`

---

## 8. Catatan

- **Backend tidak dibuat di repository frontend ini.** Semua file di sini adalah frontend-only (React + TypeScript + Vite).
- Saat `VITE_USE_MOCK_API=true`, aplikasi berjalan penuh tanpa backend menggunakan `localStorage`.
- Password pengguna disimpan sementara di `localStorage` hanya untuk mock flow — **jangan tampilkan di UI.**
- Saat backend sudah siap, ganti `VITE_USE_MOCK_API=false` dan sesuaikan adapter jika response berbeda.
