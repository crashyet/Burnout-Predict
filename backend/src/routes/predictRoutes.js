const express = require("express");
const router = express.Router();
const { createCheckin, getCheckins } = require("../controllers/predictController");
const authMiddleware = require("../middleware/authMiddleware");

// All routes here are protected
router.use(authMiddleware);

router.post("/", createCheckin);
router.get("/", getCheckins);

module.exports = router;
