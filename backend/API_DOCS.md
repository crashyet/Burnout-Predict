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
  "energy_level": 8,
  "stress_level": 3
}
```

### 5. Get All Check-ins
- **Method**: `GET`
- **URL**: `/tracking/checkins`

### 6. Create Journal Entry
- **Method**: `POST`
- **URL**: `/tracking/journal`
- **Body (JSON)**:
```json
{
  "content": "Hari ini saya merasa cukup lelah tapi produktif."
}
```

### 7. Get All Journals
- **Method**: `GET`
- **URL**: `/tracking/journals`

---

## 🧠 Assessment & Prediction
*(Membutuhkan Token)*

### 8. Create Self Assessment
- **Method**: `POST`
- **URL**: `/assessment/assessment`
- **Body (JSON)**:
```json
{
  "total_score": 75,
  "category": "Sedang",
  "answers": {
    "q1": "Sering",
    "q2": "Kadang-kadang",
    "q3": "Jarang"
  }
}
```

### 9. Get All Assessments
- **Method**: `GET`
- **URL**: `/assessment/assessments`

### 10. Create Burnout Prediction
- **Method**: `POST`
- **URL**: `/assessment/prediction`
- **Body (JSON)**:
```json
{
  "prediction_score": 0.82,
  "risk_level": "Tinggi",
  "recommendation": "Disarankan untuk mengambil istirahat minimal 2 hari dan meditasi."
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
