const { sql } = require("@databases/pg");
const db = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

const aiBaseUrl = (process.env.AI_SERVICE_URL || "https://crashyet-burnout-predict.hf.space").replace(/\/$/, "");

// --- Daily Checkins ---
const createCheckin = async (req, res) => {
  const { sleep_hours, work_hours, score_assessment, assessment_id } = req.body;
  const userId = req.user.id;

  const finalScoreAssessment = score_assessment !== undefined ? score_assessment : assessment_id;

  if (sleep_hours === undefined || work_hours === undefined) {
    return errorResponse(res, "sleep_hours and work_hours are required", 400);
  }

  try {
    // 1. Fetch past check-ins to build history lists for the ML model
    const pastCheckins = await db.query(sql`
      SELECT sleep_hours, work_hours, final_burnout_score
      FROM daily_checkins
      WHERE user_id = ${userId}
      ORDER BY created_at ASC
    `);

    const work_hours_list = [];
    const sleep_hours_list = [];
    const burnout_score_list = [];

    // Add past checkins
    for (let i = 0; i < pastCheckins.length; i++) {
      const item = pastCheckins[i];
      work_hours_list.push(parseFloat(item.work_hours || 0));
      sleep_hours_list.push(parseFloat(item.sleep_hours || 0));
      if (i === 0) {
        burnout_score_list.push(0);
      } else {
        burnout_score_list.push(parseFloat(pastCheckins[i - 1].final_burnout_score || 0));
      }
    }

    // Add today's inputs
    work_hours_list.push(parseFloat(work_hours));
    sleep_hours_list.push(parseFloat(sleep_hours));
    if (pastCheckins.length === 0) {
      burnout_score_list.push(0);
    } else {
      burnout_score_list.push(parseFloat(pastCheckins[pastCheckins.length - 1].final_burnout_score || 0));
    }

    // Slice to the last 7 days of inputs
    const final_work = work_hours_list.slice(-7);
    const final_sleep = sleep_hours_list.slice(-7);
    const final_burnout = burnout_score_list.slice(-7);

    // 2. Initialize prediction values using default fallback calculations
    let final_burnout_score = parseFloat(finalScoreAssessment || 0);
    let final_burnout_level = final_burnout_score > 70 ? "High" : final_burnout_score >= 40 ? "Moderate" : "Low";
    let note = "Hari pertama — prediksi berdasarkan kuesioner saja";
    let warning = "Prediksi besok akan tersedia mulai hari kedua. Terus input jam kerja dan tidurmu setiap hari ya.";

    const mlPayload = {
      work_hours_list: final_work,
      sleep_hours_list: final_sleep,
      burnout_score_list: final_burnout,
      questionnaire_score: parseFloat(finalScoreAssessment || 0)
    };

    // 3. Make ML call to the Combined API Server
    try {
      console.log("==================== ML SERVICE REQUEST ====================");
      console.log("Endpoint:", `${aiBaseUrl}/predict-burnout`);
      console.log("Payload:", JSON.stringify(mlPayload, null, 2));
      console.log("============================================================");

      const response = await fetch(`${aiBaseUrl}/predict-burnout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(mlPayload)
      });

      if (response.ok) {
        const mlData = await response.json();
        console.log("==================== ML SERVICE RESPONSE ===================");
        console.log("Response:", JSON.stringify(mlData, null, 2));
        console.log("============================================================");

        if (mlData && mlData.final_burnout_score !== undefined) {
          final_burnout_score = parseFloat(mlData.final_burnout_score);
          final_burnout_level = mlData.final_burnout_level || final_burnout_level;
          note = mlData.note || note;
          warning = mlData.trend_warning?.warning || warning;
        }
      } else {
        const errText = await response.text().catch(() => "");
        console.error("==================== ML SERVICE ERROR ======================");
        console.error("Status:", response.status);
        console.error("Error Body:", errText);
        console.error("============================================================");
      }
    } catch (fetchErr) {
      console.error("[ML SERVICE] Gagal terhubung ke ML Service:", fetchErr.message);
    }

    // 4. Retrieve the user's highest/dominant emotion for today
    let todayEmotion = "Netral";
    try {
      // Get current date in Asia/Jakarta (WIB) timezone, formatting as YYYY-MM-DD
      const jakartaDateStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Jakarta",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
      }).format(new Date());

      const todayStart = `${jakartaDateStr} 00:00:00.000`;
      const todayEnd = `${jakartaDateStr} 23:59:59.999`;
      
      const journalEmotions = await db.query(sql`
        SELECT je.emotion, je.probability
        FROM journal_emotions je
        JOIN journals j ON je.journal_id = j.id
        WHERE j.user_id = ${userId}
          AND j.created_at >= ${todayStart}
          AND j.created_at <= ${todayEnd}
        ORDER BY je.probability DESC
        LIMIT 1
      `);
      
      if (journalEmotions.length > 0) {
        const rawEmotion = journalEmotions[0].emotion;
        const m = rawEmotion.toLowerCase();
        if (m === 'anger') todayEmotion = 'Marah';
        else if (m === 'fear') todayEmotion = 'Cemas';
        else if (m === 'happy' || m === 'love') todayEmotion = 'Senang';
        else if (m === 'sadness') todayEmotion = 'Sedih';
        else if (m === 'neutral') todayEmotion = 'Netral';
        else todayEmotion = rawEmotion.charAt(0).toUpperCase() + rawEmotion.slice(1);
      }
    } catch (emotionErr) {
      console.error("[PREDICT CONTROLLER] Gagal mengambil emosi hari ini:", emotionErr);
    }

    // 5. Generate AI Recommendations from Gemini (Single JSON API Call to avoid 429 rate limits)
    let dashboard_recommendation = "Kondisi Anda cukup stabil, pertahankan pola istirahat yang baik.";
    if (process.env.GEN_AI_API) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${process.env.GEN_AI_API}`;
      
      const promptText = `Berdasarkan data check-in harian pengguna hari ini:
- Durasi Tidur: ${sleep_hours} jam
- Durasi Kerja: ${work_hours} jam
- Skor Kuis Kuesioner Hari Ini: ${finalScoreAssessment} dari 100
- Hasil Prediksi Model ML (Prediksi Burnout Esok Hari): Skor ${final_burnout_score.toFixed(1)} dari 100, Kategori Level: "${final_burnout_level}"
- Emosi Tertinggi Hari Ini (berdasarkan log jurnal harian): "${todayEmotion}"

Berikan respon dalam format JSON dengan dua key sebagai berikut:
1. "burnout_note": Satu rekomendasi kesehatan mental atau tindakan praktis pencegahan burnout yang empati, hangat, personal, singkat (maksimal 2 kalimat saja), dan ditulis dalam Bahasa Indonesia. Gunakan data durasi tidur dan kerja serta hasil prediksi burnout untuk memberikan rekomendasi yang sesuai.
2. "dashboard_recommendation": Kalimat rekomendasi kesehatan mental keseluruhan yang empati, hangat, personal, singkat (TEPAT 2 kalimat saja, tidak kurang dan tidak lebih), ditulis dalam Bahasa Indonesia, serta hindari penggunaan kata "aku".

Format JSON output harus persis seperti ini:
{
  "burnout_note": "isi teks rekomendasi burnout",
  "dashboard_recommendation": "isi teks rekomendasi dashboard"
}`;

      let retries = 3;
      let delayMs = 1500;
      while (retries > 0) {
        try {
          console.log("[GEN AI] Mengirim request single JSON ke Gemini...");
          const response = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: promptText
                }]
              }],
              generationConfig: {
                responseMimeType: "application/json"
              }
            })
          });

          if (response.ok) {
            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              const parsed = JSON.parse(text.trim());
              if (parsed.burnout_note) {
                note = parsed.burnout_note;
                console.log("[GEN AI] Burnout note berhasil didapatkan:", note);
              }
              if (parsed.dashboard_recommendation) {
                dashboard_recommendation = parsed.dashboard_recommendation;
                console.log("[GEN AI] Dashboard recommendation berhasil didapatkan:", dashboard_recommendation);
              }
              break;
            }
          } else {
            console.warn(`[GEN AI] Gemini API returned status ${response.status}. Retries remaining: ${retries - 1}`);
          }
        } catch (err) {
          console.error("[GEN AI] Gagal memanggil Gemini API:", err);
        }
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
          delayMs *= 2;
        }
      }
    }

    // 6. Save to the database daily_checkins table
    const result = await db.query(sql`
      INSERT INTO daily_checkins (user_id, sleep_hours, work_hours, score_assessment, final_burnout_score, final_burnout_level, note, warning, dashboard_recommendation)
      VALUES (${userId}, ${sleep_hours}, ${work_hours}, ${finalScoreAssessment}, ${final_burnout_score}, ${final_burnout_level}, ${note}, ${warning}, ${dashboard_recommendation})
      RETURNING id, user_id, sleep_hours, work_hours, score_assessment, final_burnout_score, final_burnout_level, note, warning, dashboard_recommendation, created_at
    `);

    const responseData = {
      ...result[0],
      ml_payload: mlPayload
    };

    return successResponse(res, "Check-in recorded successfully", responseData, 201);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to record check-in");
  }
};

const getCheckins = async (req, res) => {
  const userId = req.user.id;
  try {
    const checkins = await db.query(sql`
      SELECT dc.id, dc.user_id, dc.sleep_hours, dc.work_hours, dc.score_assessment, dc.score_assessment AS assessment_score, dc.final_burnout_score, dc.final_burnout_level, dc.note, dc.warning, dc.dashboard_recommendation, dc.created_at
      FROM daily_checkins dc
      WHERE dc.user_id = ${userId}
      ORDER BY dc.created_at DESC
    `);
    return successResponse(res, "Check-ins retrieved", checkins);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to retrieve check-ins");
  }
};

module.exports = { createCheckin, getCheckins };
