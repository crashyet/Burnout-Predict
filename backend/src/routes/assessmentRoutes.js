const express = require("express");
const router = express.Router();
const { createAssessment, getAssessments, createPrediction, getPredictions } = require("../controllers/assessmentController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes here are protected
router.use(authMiddleware);

router.post("/assessment", createAssessment);
router.get("/assessments", getAssessments);

router.post("/prediction", createPrediction);
router.get("/predictions", getPredictions);

module.exports = router;
