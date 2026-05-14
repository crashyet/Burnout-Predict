const { sql } = require("@databases/mysql");
const db = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

// --- Daily Checkins ---
const createCheckin = async (req, res) => {
  const { sleep_hours, energy_level, stress_level } = req.body;
  const userId = req.user.id;

  try {
    await db.query(sql`
      INSERT INTO daily_checkins (user_id, sleep_hours, energy_level, stress_level)
      VALUES (${userId}, ${sleep_hours}, ${energy_level}, ${stress_level})
    `);
    return successResponse(res, "Check-in recorded successfully", null, 21);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to record check-in");
  }
};

const getCheckins = async (req, res) => {
  const userId = req.user.id;
  try {
    const checkins = await db.query(sql`SELECT * FROM daily_checkins WHERE user_id = ${userId} ORDER BY created_at DESC`);
    return successResponse(res, "Check-ins retrieved", checkins);
  } catch (err) {
    return errorResponse(res, "Failed to retrieve check-ins");
  }
};

// --- Journals ---
const createJournal = async (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;

  try {
    // Placeholder untuk AI processing (nantinya bisa panggil API AI di sini)
    const mood_expression = "neutral"; 
    const sentiment_score = 0.0;

    await db.query(sql`
      INSERT INTO journals (user_id, content, mood_expression, sentiment_score)
      VALUES (${userId}, ${content}, ${mood_expression}, ${sentiment_score})
    `);
    return successResponse(res, "Journal entry created", null, 21);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to create journal entry");
  }
};

const getJournals = async (req, res) => {
  const userId = req.user.id;
  try {
    const journals = await db.query(sql`SELECT * FROM journals WHERE user_id = ${userId} ORDER BY created_at DESC`);
    return successResponse(res, "Journals retrieved", journals);
  } catch (err) {
    return errorResponse(res, "Failed to retrieve journals");
  }
};

module.exports = { createCheckin, getCheckins, createJournal, getJournals };
