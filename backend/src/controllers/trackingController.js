const { sql } = require("@databases/mysql");
const db = require("../config/db");
const { successResponse, errorResponse } = require("../utils/response");

// --- Daily Checkins ---
const createCheckin = async (req, res) => {
  const { sleep_hours, work_hours, energy_level, stress_level } = req.body;
  const userId = req.user.id;

  try {
    await db.query(sql`
      INSERT INTO daily_checkins (user_id, sleep_hours, work_hours, energy_level, stress_level)
      VALUES (${userId}, ${sleep_hours}, ${work_hours}, ${energy_level}, ${stress_level})
    `);
    return successResponse(res, "Check-in recorded successfully", null, 201);
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

  if (!content || !content.trim()) {
    return errorResponse(res, "Journal content cannot be empty", 400);
  }

  try {
    let mood_expression = "neutral";
    let all_probabilities = { anger: 0, fear: 0, happy: 0, love: 0, sadness: 0 };
    let top_2_emotions = [];

    try {
      const aiBaseUrl = (process.env.AI_SERVICE_URL || "https://crashyet-burnout-predict.hf.space").replace(/\/$/, "");
      const aiResponse = await fetch(`${aiBaseUrl}/predict-emotion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: content })
      });

      if (aiResponse.ok) {
        const aiResult = await aiResponse.json();
        if (aiResult && aiResult.final_emotion) {
          mood_expression = aiResult.final_emotion;
          all_probabilities = aiResult.all_probabilities || all_probabilities;
          top_2_emotions = aiResult.top_2_emotions || [];
        }
      } else {
        console.warn("ML Service error status:", aiResponse.status);
      }
    } catch (aiErr) {
      console.error("Failed to fetch emotion prediction from ML service:", aiErr);
    }

    // Insert journal
    const journalResult = await db.query(sql`
      INSERT INTO journals (user_id, content, mood_expression, sentiment_score)
      VALUES (${userId}, ${content}, NULL, NULL)
    `);
    const journalId = journalResult.insertId;

    // Save individual emotions into journal_emotions
    for (const [emotion, prob] of Object.entries(all_probabilities)) {
      await db.query(sql`
        INSERT INTO journal_emotions (journal_id, emotion, probability)
        VALUES (${journalId}, ${emotion}, ${prob})
      `);
    }

    // Generate supportive/motivational messages for top emotions
    const motivationsList = [];
    const nonZeroEmotions = top_2_emotions.filter(item => item.probability > 0);

    const emotionsToMotivate = nonZeroEmotions.length > 0
      ? (nonZeroEmotions.length === 1 ? [nonZeroEmotions[0]] : nonZeroEmotions.slice(0, 2))
      : [{ emotion: mood_expression, probability: 1.0 }];

    for (const item of emotionsToMotivate) {
      const emotionName = item.emotion;
      let message = `Tetap semangat dan jaga kesehatan mentalmu ya! (${emotionName})`;

      if (process.env.GEN_AI_API) {
        let retries = 3;
        let delayMs = 1000;
        while (retries > 0) {
          try {
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEN_AI_API}`;
            const geminiResponse = await fetch(geminiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `Berdasarkan jurnal harian berikut: "${content}" dan emosi "${emotionName}" yang terdeteksi, berikan sebuah pesan motivasi atau dukungan psikologis yang hangat, empati, singkat (maksimal 2-3 kalimat), dan ditulis dalam Bahasa Indonesia.`
                  }]
                }]
              })
            });

            if (geminiResponse.ok) {
              const geminiData = await geminiResponse.json();
              const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (generatedText) {
                message = generatedText.trim();
                break;
              }
            } else {
              console.warn(`Gemini API returned status ${geminiResponse.status} for emotion ${emotionName}. Retries remaining: ${retries - 1}`);
            }
          } catch (geminiErr) {
            console.error(`Failed to generate motivation for ${emotionName} from Gemini API:`, geminiErr);
          }
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
            delayMs *= 2;
          }
        }
      }

      // Save motivation message into journal_motivations
      await db.query(sql`
        INSERT INTO journal_motivations (journal_id, message, emotion)
        VALUES (${journalId}, ${message}, ${emotionName})
      `);

      motivationsList.push({
        emotion: emotionName,
        message: message
      });
    }

    return successResponse(res, "Journal entry created", {
      id: journalId,
      content,
      mood_expression,
      emotions: all_probabilities,
      motivations: motivationsList
    }, 201);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to create journal entry");
  }
};

const getJournals = async (req, res) => {
  const userId = req.user.id;
  const limit = (req.query && req.query.limit) ? parseInt(req.query.limit, 10) : null;
  try {
    const query = (limit && !isNaN(limit))
      ? sql`SELECT * FROM journals WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit}`
      : sql`SELECT * FROM journals WHERE user_id = ${userId} ORDER BY created_at DESC`;
    const journals = await db.query(query);
    
    const results = await Promise.all(journals.map(async (journal) => {
      const emotions = await db.query(sql`
        SELECT emotion, probability FROM journal_emotions WHERE journal_id = ${journal.id}
      `);
      const motivations = await db.query(sql`
        SELECT message, emotion FROM journal_motivations WHERE journal_id = ${journal.id}
      `);
      
      const emotionObj = {};
      emotions.forEach(e => {
        emotionObj[e.emotion] = parseFloat(e.probability);
      });

      return {
        ...journal,
        emotions: emotionObj,
        motivations: motivations.map(m => ({
          emotion: m.emotion,
          message: m.message
        }))
      };
    }));

    return successResponse(res, "Journals retrieved", results);
  } catch (err) {
    console.error(err);
    return errorResponse(res, "Failed to retrieve journals");
  }
};

module.exports = { createCheckin, getCheckins, createJournal, getJournals };
