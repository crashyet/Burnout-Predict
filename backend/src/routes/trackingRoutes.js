const express = require("express");
const router = express.Router();
const { createCheckin, getCheckins, createJournal, getJournals } = require("../controllers/trackingController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes here are protected
router.use(authMiddleware);

router.post("/checkin", createCheckin);
router.get("/checkins", getCheckins);

router.post("/journal", createJournal);
router.get("/journals", getJournals);

module.exports = router;
