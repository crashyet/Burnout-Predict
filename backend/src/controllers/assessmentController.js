const { sql } = require("@databases/mysql");
const db = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

// --- Self Assessments ---
const createAssessment = async (req, res) => {
  const { total_score, category, answers } = req.body;
  const userId = req.user.id;

  try {
    await db.query(sql`
      INSERT INTO self_assessments (user_id, total_score, category, answers)
      VALUES (${userId}, ${total_score}, ${category}, ${JSON.stringify(answers)})
    `);
    return successResponse(res, "Assessment saved", null, 21);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to save assessment");
  }
};

const getAssessments = async (req, res) => {
  const userId = req.user.id;
  try {
    const assessments = await db.query(sql`SELECT * FROM self_assessments WHERE user_id = ${userId} ORDER BY created_at DESC`);
    // Parse JSON answers back to object
    const results = assessments.map(a => ({...a, answers: JSON.parse(a.answers)}));
    return successResponse(res, "Assessments retrieved", results);
  } catch (err) {
    return errorResponse(res, "Failed to retrieve assessments");
  }
};

// --- Burnout Predictions ---
const createPrediction = async (req, res) => {
  const { prediction_score, risk_level, recommendation } = req.body;
  const userId = req.user.id;

  try {
    await db.query(sql`
      INSERT INTO burnout_predictions (user_id, prediction_score, risk_level, recommendation)
      VALUES (${userId}, ${prediction_score}, ${risk_level}, ${recommendation})
    `);
    return successResponse(res, "Prediction recorded", null, 21);
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
