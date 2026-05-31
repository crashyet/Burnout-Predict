const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require("./src/routes/authRoutes");
const journalRoutes = require("./src/routes/journalRoutes");
const predictRoutes = require("./src/routes/predictRoutes");
const authMiddleware = require("./src/middleware/authMiddleware");
const { successResponse } = require("./src/utils/response");

const swaggerUi = require("swagger-ui-express");
const swaggerBackend = require("./swagger-backend.json");
const swaggerML = require("./swagger-ml.json");

const app = express();

// Middleware
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Endpoints to serve raw JSON specifications
app.get("/docs/backend.json", (req, res) => res.json(swaggerBackend));
app.get("/docs/ml.json", (req, res) => res.json(swaggerML));

// Swagger documentation route with API Explorer dropdown toggling
const swaggerOptions = {
    explorer: true,
    swaggerOptions: {
        urls: [
            {
                url: "/docs/backend.json",
                name: "NodeJS Backend API"
            },
            {
                url: "/docs/ml.json",
                name: "FastAPI Machine Learning API"
            }
        ]
    },
    customCssUrl: "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css",
    customJs: [
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js",
        "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js"
    ]
};
app.use("/docs", swaggerUi.serve, swaggerUi.setup(null, swaggerOptions));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/journal", journalRoutes);
app.use("/api/v1/predict", predictRoutes);

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

module.exports = app;
