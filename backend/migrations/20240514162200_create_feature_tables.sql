-- Daily Checkins Table
CREATE TABLE IF NOT EXISTS daily_checkins (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    sleep_hours DECIMAL(4,2),
    energy_level INT,
    stress_level INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Journals Table
CREATE TABLE IF NOT EXISTS journals (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    mood_expression VARCHAR(255),
    sentiment_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Self Assessments Table
CREATE TABLE IF NOT EXISTS self_assessments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    total_score INT,
    category VARCHAR(255),
    answers JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Burnout Predictions Table
CREATE TABLE IF NOT EXISTS burnout_predictions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    prediction_score DECIMAL(5,2),
    risk_level VARCHAR(255),
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
