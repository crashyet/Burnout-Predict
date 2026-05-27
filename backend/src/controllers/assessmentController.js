const { sql } = require("@databases/pg");
const db = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

// --- Self Assessments ---
const createAssessment = async (req, res) => {
  const { total_score, answers } = req.body;
  const userId = req.user.id;

  if (total_score === undefined || !answers) {
    return errorResponse(res, "total_score and answers are required", 400);
  }

  try {
    // 1. Save self assessment to the database
    await db.query(sql`
      INSERT INTO self_assessments (user_id, total_score, category, answers)
      VALUES (${userId}, ${total_score}, NULL, ${JSON.stringify(answers)})
    `);

    // 2. Fetch user's checkin history (latest 7 days, sorted chronologically)
    const checkins = await db.query(sql`
      SELECT sleep_hours, work_hours FROM daily_checkins
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 7
    `);
    const reversedCheckins = [...checkins].reverse();
    const sleep_hours_list = reversedCheckins.map(c => parseFloat(c.sleep_hours) || 0.0);
    const work_hours_list = reversedCheckins.map(c => parseFloat(c.work_hours) || 0.0);

    // 3. Fetch user's prediction history (latest 7 predictions, sorted chronologically)
    const prevPredictions = await db.query(sql`
      SELECT prediction_score FROM burnout_predictions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 7
    `);
    const reversedPredictions = [...prevPredictions].reverse();
    const burnout_score_list = reversedPredictions.map(p => parseFloat(p.prediction_score) || 0.0);

    // 4. Use the newly submitted total_score as the questionnaire_score
    const questionnaire_score = parseFloat(total_score);

    // 5. Call ML API
    let prediction_score = questionnaire_score;
    let risk_level = "Low";
    let recommendation = "Tetap jaga kesehatan fisik dan mental Anda.";
    let fullAiResponse = null;

    try {
      const aiBaseUrl = (process.env.AI_SERVICE_URL || "https://crashyet-burnout-predict.hf.space").replace(/\/$/, "");
      const aiResponse = await fetch(`${aiBaseUrl}/predict-burnout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_hours_list,
          sleep_hours_list,
          burnout_score_list,
          questionnaire_score
        })
      });

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        fullAiResponse = aiResult;
        if (aiResult && aiResult.final_burnout_score !== undefined) {
          prediction_score = aiResult.final_burnout_score;
          risk_level = aiResult.final_burnout_level || risk_level;
          recommendation = aiResult.trend_warning?.warning || aiResult.note || recommendation;
        }
      } else {
        console.warn("ML Service error status:", aiResponse.status);
      }
    } catch (aiErr) {
      console.error("Failed to fetch burnout prediction from ML service:", aiErr);
    }

    // 6. Store prediction results in the database
    await db.query(sql`
      INSERT INTO burnout_predictions (user_id, prediction_score, risk_level, recommendation)
      VALUES (${userId}, ${prediction_score}, ${risk_level}, ${recommendation})
    `);

    return successResponse(res, "Assessment saved and prediction calculated successfully", {
      assessment: {
        total_score,
        answers
      },
      prediction: {
        prediction_score,
        risk_level,
        recommendation,
        details: fullAiResponse
      }
    }, 201);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to save assessment and calculate prediction");
  }
};

const getAssessments = async (req, res) => {
  const userId = req.user.id;
  try {
    const assessments = await db.query(sql`SELECT * FROM self_assessments WHERE user_id = ${userId} ORDER BY created_at DESC`);
    // Parse JSON answers back to object safely
    const results = assessments.map(a => {
      let parsedAnswers = a.answers;
      if (typeof a.answers === "string") {
        try {
          parsedAnswers = JSON.parse(a.answers);
        } catch (e) {
          console.error("Failed to parse answers JSON:", e);
        }
      }
      return { ...a, answers: parsedAnswers };
    });
    return successResponse(res, "Assessments retrieved", results);
  } catch (err) {
    console.error("Failed to retrieve assessments:", err);
    return errorResponse(res, "Failed to retrieve assessments");
  }
};

// --- Burnout Predictions ---
const createPrediction = async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Fetch user's checkin history (latest 7 days, sorted chronologically)
    const checkins = await db.query(sql`
      SELECT sleep_hours, work_hours FROM daily_checkins
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 7
    `);
    const reversedCheckins = [...checkins].reverse();
    const sleep_hours_list = reversedCheckins.map(c => parseFloat(c.sleep_hours) || 0.0);
    const work_hours_list = reversedCheckins.map(c => parseFloat(c.work_hours) || 0.0);

    // 2. Fetch user's prediction history (latest 7 predictions, sorted chronologically)
    const prevPredictions = await db.query(sql`
      SELECT prediction_score FROM burnout_predictions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 7
    `);
    const reversedPredictions = [...prevPredictions].reverse();
    const burnout_score_list = reversedPredictions.map(p => parseFloat(p.prediction_score) || 0.0);

    // 3. Determine questionnaire score
    let questionnaire_score = req.body.questionnaire_score;
    if (questionnaire_score === undefined && req.body.prediction_score !== undefined) {
      questionnaire_score = req.body.prediction_score;
    }
    if (questionnaire_score === undefined) {
      const latestAssessment = await db.query(sql`
        SELECT total_score FROM self_assessments
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT 1
      `);
      if (latestAssessment.length > 0) {
        questionnaire_score = parseFloat(latestAssessment[0].total_score);
      } else {
        questionnaire_score = 50.0; // Default fallback score
      }
    }

    // 4. Call ML API
    let prediction_score = questionnaire_score;
    let risk_level = "Low";
    let recommendation = "Tetap jaga kesehatan fisik dan mental Anda.";
    let fullAiResponse = null;

    try {
      const aiBaseUrl = (process.env.AI_SERVICE_URL || "https://crashyet-burnout-predict.hf.space").replace(/\/$/, "");
      const aiResponse = await fetch(`${aiBaseUrl}/predict-burnout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_hours_list,
          sleep_hours_list,
          burnout_score_list,
          questionnaire_score
        })
      });

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        fullAiResponse = aiResult;
        if (aiResult && aiResult.final_burnout_score !== undefined) {
          prediction_score = aiResult.final_burnout_score;
          risk_level = aiResult.final_burnout_level || risk_level;
          recommendation = aiResult.trend_warning?.warning || aiResult.note || recommendation;
        }
      } else {
        console.warn("ML Service error status:", aiResponse.status);
      }
    } catch (aiErr) {
      console.error("Failed to fetch burnout prediction from ML service:", aiErr);
    }

    // 5. Store prediction results in the database
    await db.query(sql`
      INSERT INTO burnout_predictions (user_id, prediction_score, risk_level, recommendation)
      VALUES (${userId}, ${prediction_score}, ${risk_level}, ${recommendation})
    `);

    return successResponse(res, "Prediction recorded successfully", {
      prediction_score,
      risk_level,
      recommendation,
      details: fullAiResponse
    }, 201);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to record prediction");
  }
};

const getPredictions = async (req, res) => {
  const userId = req.user.id;
  try {
    const predictions = await db.query(sql`SELECT * FROM burnout_predictions WHERE user_id = ${userId} ORDER BY created_at DESC`);
    return successResponse(res, "Predictions retrieved", predictions);
  } catch (err) {
    return errorResponse(res, "Failed to retrieve predictions");
  }
};

module.exports = { createAssessment, getAssessments, createPrediction, getPredictions };
