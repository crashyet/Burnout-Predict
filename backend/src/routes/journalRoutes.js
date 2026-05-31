const express = require("express");
const router = express.Router();
const { createJournal, getJournals } = require("../controllers/journalController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes here are protected
router.use(authMiddleware);

router.post("/", createJournal);
router.get("/", getJournals);

module.exports = router;
