# 🚀 Burnout Predict API Documentation

**Base URL**: `http://localhost:5000/api/v1`

---

## 🔐 Authentication
Semua endpoint selain Register, Login, dan Verify OTP membutuhkan Header:  
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
Memvalidasi akun menggunakan kode OTP dari email.
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
Mendapatkan JWT Token untuk mengakses fitur lainnya.
- **Method**: `POST`
- **URL**: `/auth/login`
- **Body (JSON)**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## 📊 Daily Tracking
*(Membutuhkan Token)*

### 4. Create Daily Check-in
- **Method**: `POST`
- **URL**: `/tracking/checkin`
- **Body (JSON)**:
```json
{
  "sleep_hours": 7.5,
  "work_hours": 8.0,
  "energy_level": 8,
  "stress_level": 3
}
```

### 5. Get All Check-ins
- **Method**: `GET`
- **URL**: `/tracking/checkins`

### 6. Create Journal Entry
Menganalisis emosi jurnal dengan ML model dan men-generate pesan motivasi menggunakan Gemini.
- **Method**: `POST`
- **URL**: `/tracking/journal`
- **Body (JSON)**:
```json
{
  "content": "Hari ini saya merasa cukup lelah tapi produktif."
}
```
- **Response (JSON)**:
```json
{
  "success": true,
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
      },
      {
        "emotion": "anger",
        "message": "Pesan dukungan psikologis dari Gemini..."
      }
    ]
  }
}
```

### 7. Get All Journals
Mengambil semua data jurnal lengkap dengan data emosi dan pesan motivasi.
- **Method**: `GET`
- **URL**: `/tracking/journals`

---

## 🧠 Assessment & Prediction
*(Membutuhkan Token)*

### 8. Create Self Assessment & Burnout Prediction
Menyimpan data kuesioner mandiri dan sekaligus menjalankan perhitungan prediksi burnout menggunakan model ML forecasting.
- **Method**: `POST`
- **URL**: `/assessment/assessment`
- **Body (JSON)**:
```json
{
  "total_score": 75,
  "answers": {
    "q1": "Sering",
    "q2": "Kadang-kadang",
    "q3": "Jarang",
    "q4": "Sering",
    "q5": "Sering",
    "q6": "Kadang-kadang",
    "q7": "Jarang",
    "q8": "Kadang-kadang",
    "q9": "Jarang",
    "q10": "Sering"
  }
}
```
- **Response (JSON)**:
```json
{
  "success": true,
  "message": "Assessment saved and prediction calculated successfully",
  "data": {
    "assessment": {
      "total_score": 75,
      "answers": {
        "q1": "Sering",
        "q2": "Kadang-kadang",
        "q3": "Jarang",
        "q4": "Sering",
        "q5": "Sering",
        "q6": "Kadang-kadang",
        "q7": "Jarang",
        "q8": "Kadang-kadang",
        "q9": "Jarang",
        "q10": "Sering"
      }
    },
    "prediction": {
      "prediction_score": 75.0,
      "risk_level": "High",
      "recommendation": "Burnout kamu hari ini cukup tinggi (75.0)...",
      "details": {
        "final_burnout_score": 75.0,
        "final_burnout_level": "High",
        "weighting_type": "questionnaire only",
        "trend_warning": {
          "trend": "insufficient_data",
          "warning": "Burnout kamu hari ini cukup tinggi..."
        }
      }
    }
  }
}
```

### 9. Get All Assessments
- **Method**: `GET`
- **URL**: `/assessment/assessments`

### 10. Create Burnout Prediction (Legacy / Standalone)
*(Digunakan jika ingin menghitung ulang prediksi burnout secara terpisah tanpa input assessment baru)*
- **Method**: `POST`
- **URL**: `/assessment/prediction`
- **Body (JSON - Optional)**:
```json
{
  "questionnaire_score": 55.0
}
```
*(Catatan: Jika `questionnaire_score` tidak dikirim, backend akan mengambil dari self assessment terakhir user).*

- **Response (JSON)**:
```json
{
  "success": true,
  "message": "Prediction recorded successfully",
  "data": {
    "prediction_score": 53.65,
    "risk_level": "Moderate",
    "recommendation": "Burnout kamu perlahan naik...",
    "details": {
      "behavior_prediction_score": 52.3,
      "questionnaire_score": 55.0,
      "final_burnout_score": 53.65,
      "final_burnout_level": "Moderate",
      "difference": 2.7,
      "weighting_type": "balanced weighting",
      "note": "Data 3 hari...",
      "trend_warning": {
        "trend": "increasing",
        "avg_delta": 1.2,
        "streak_up": 2,
        "severity": "medium",
        "warning": "Burnout kamu perlahan naik..."
      }
    }
  }
}
```

### 11. Get All Predictions
- **Method**: `GET`
- **URL**: `/assessment/predictions`

---

## 🛠 Utility
### 12. Health Check
- **Method**: `GET`
- **URL**: `/health`

### 13. Profile (Test Token)
- **Method**: `GET`
- **URL**: `/profile`
