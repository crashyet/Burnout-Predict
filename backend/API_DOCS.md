# 🚀 Burnout Predict API Documentation

**Base URL**: `http://localhost:5000/api/v1`

---

## 🔐 Authentication
Semua endpoint selain Register, Login, Verify OTP, dan Resend OTP membutuhkan Header:  
`Authorization: Bearer <your_jwt_token>`

### 1. Register User
Mendaftarkan akun baru dan mengirimkan 6-digit OTP ke email.
- **Method**: `POST`
- **URL**: `/auth/register`
- **Body (JSON)**:
```json
{
  "name": "User",
  "email": "user@example.com",
  "password": "password123"
}
```

### 2. Verify OTP
Memvalidasi akun menggunakan kode OTP dari email. Mengembalikan JWT token jika verifikasi sukses.
- **Method**: `POST`
- **URL**: `/auth/verify-otp`
- **Body (JSON)**:
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

### 3. Login
Mendapatkan JWT Token untuk mengakses fitur lainnya. Jika user belum terverifikasi, akan mengembalikan status error 401 dan mengirimkan OTP baru ke email.
- **Method**: `POST`
- **URL**: `/auth/login`
- **Body (JSON)**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### 4. Resend OTP
Mengirim ulang kode OTP ke email yang belum terverifikasi.
- **Method**: `POST`
- **URL**: `/auth/resend-otp`
- **Body (JSON)**:
```json
{
  "email": "user@example.com"
}
```

---

## 📝 Journaling
*(Membutuhkan Token)*

### 5. Create Journal Entry
Menganalisis emosi dari teks jurnal harian dengan model ML dan secara otomatis membuat pesan motivasi/empati dari Gemini untuk setiap emosi yang terdeteksi.
- **Method**: `POST`
- **URL**: `/journal`
- **Body (JSON)**:
```json
{
  "content": "Hari ini saya merasa cukup lelah tapi produktif."
}
```
- **Response (JSON)**:
```json
{
  "status": "success",
  "message": "Journal entry created",
  "data": {
    "id": 12,
    "content": "Hari ini saya merasa cukup lelah tapi produktif.",
    "mood_expression": "sadness",
    "emotions": {
      "anger": 0.15,
      "fear": 0.05,
      "happy": 0.1,
      "love": 0.1,
      "sadness": 0.6
    },
    "motivations": [
      {
        "emotion": "sadness",
        "message": "Pesan dukungan psikologis dari Gemini..."
      }
    ]
  }
}
```

### 6. Get All Journals
Mengambil semua data jurnal lengkap dengan data emosi dan pesan motivasi. Mendukung parameter query `limit`.
- **Method**: `GET`
- **URL**: `/journal`
- **Query Parameters**:
  - `limit` (optional): Jumlah jurnal teratas/terakhir yang ingin diambil (contoh: `limit=5`)

---

## 📊 Burnout Prediction & Checkin
*(Membutuhkan Token)*

### 7. Create Daily Check-in & Prediction
Mencatat durasi tidur, durasi kerja, dan skor assessment/id kuesioner. Endpoint ini memanggil model ML untuk memprediksi tingkat burnout (Low/Moderate/High) serta Gemini AI untuk mendapatkan rekomendasi kesehatan mental.
- **Method**: `POST`
- **URL**: `/predict`
- **Body (JSON)**:
```json
{
  "sleep_hours": 7.5,
  "work_hours": 8.0,
  "score_assessment": 75,
  "assessment_id": 1
}
```
- **Response (JSON)**:
```json
{
  "status": "success",
  "message": "Check-in recorded successfully",
  "data": {
    "id": 1,
    "user_id": 12,
    "sleep_hours": 7.5,
    "work_hours": 8.0,
    "score_assessment": 75,
    "final_burnout_score": 68.5,
    "final_burnout_level": "Moderate",
    "note": "Rekomendasi pencegahan burnout...",
    "warning": "Peringatan tren burnout...",
    "dashboard_recommendation": "Rekomendasi keseluruhan...",
    "created_at": "2026-05-28T12:00:00.000Z",
    "ml_payload": {
      "work_hours_list": [8.0],
      "sleep_hours_list": [7.5],
      "burnout_score_list": [0],
      "questionnaire_score": 75.0
    }
  }
}
```

### 8. Get All Check-ins & Predictions
Mengambil semua riwayat daily check-in dan hasil prediksi burnout secara descending.
- **Method**: `GET`
- **URL**: `/predict`

---

## 🛠 Utility

### 9. Profile (Check JWT Token Profile Data)
Mendapatkan detail profil user yang terautentikasi berdasarkan JWT token.
- **Method**: `GET`
- **URL**: `/profile`

### 10. Health Check
Memastikan server API berjalan lancar.
- **Method**: `GET`
- **URL**: `/health`
