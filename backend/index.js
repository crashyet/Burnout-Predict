const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require("./src/routes/authRoutes");
const trackingRoutes = require("./src/routes/trackingRoutes");
const assessmentRoutes = require("./src/routes/assessmentRoutes");
const authMiddleware = require("./src/middleware/authMiddleware");
const { successResponse } = require("./src/utils/response");

const app = express();

// Middleware
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tracking", trackingRoutes);
app.use("/api/v1/assessment", assessmentRoutes);

// Protected route example
app.get("/api/v1/profile", authMiddleware, (req, res) => {
    return successResponse(res, "Profile data accessed", { user: req.user });
});

// Route simpel
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));