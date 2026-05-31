-- Drop new tables
DROP TABLE IF EXISTS journal_emotions CASCADE;
DROP TABLE IF EXISTS journal_motivations CASCADE;
DROP TABLE IF EXISTS daily_checkins CASCADE;
DROP TABLE IF EXISTS journals CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Recreate original users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recreate original daily_checkins table
CREATE TABLE IF NOT EXISTS daily_checkins (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    sleep_hours DECIMAL(4,2),
    work_hours DECIMAL(4,2),
    energy_level INT,
    stress_level INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recreate original journals table
CREATE TABLE IF NOT EXISTS journals (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    mood_expression VARCHAR(255),
    sentiment_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recreate original self_assessments table
CREATE TABLE IF NOT EXISTS self_assessments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    total_score INT,
    category VARCHAR(255),
    answers JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recreate original burnout_predictions table
CREATE TABLE IF NOT EXISTS burnout_predictions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    prediction_score DECIMAL(5,2),
    risk_level VARCHAR(255),
    recommendation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recreate original journal_emotions table
CREATE TABLE IF NOT EXISTS journal_emotions (
    id SERIAL PRIMARY KEY,
    journal_id INT NOT NULL,
    emotion VARCHAR(255) NOT NULL,
    probability DECIMAL(5,4) NOT NULL,
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE
);

-- Recreate original journal_motivations table
CREATE TABLE IF NOT EXISTS journal_motivations (
    id SERIAL PRIMARY KEY,
    journal_id INT NOT NULL,
    message TEXT NOT NULL,
    emotion VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE
);
