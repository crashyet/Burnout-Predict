-- Drop all existing tables to perform a clean/fresh migrate
DROP TABLE IF EXISTS journal_emotions CASCADE;
DROP TABLE IF EXISTS journal_motivations CASCADE;
DROP TABLE IF EXISTS burnout_predictions CASCADE;
DROP TABLE IF EXISTS daily_checkins CASCADE;
DROP TABLE IF EXISTS journals CASCADE;
DROP TABLE IF EXISTS self_assessments CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Recreate users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recreate journals table (only text/content)
CREATE TABLE journals (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recreate journal_emotions table (left unmodified)
CREATE TABLE journal_emotions (
    id SERIAL PRIMARY KEY,
    journal_id INT NOT NULL,
    emotion VARCHAR(255) NOT NULL,
    probability DECIMAL(5,4) NOT NULL,
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE
);

-- Recreate journal_motivations table (left unmodified)
CREATE TABLE journal_motivations (
    id SERIAL PRIMARY KEY,
    journal_id INT NOT NULL,
    message TEXT NOT NULL,
    emotion VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE
);

-- Recreate assessments table
CREATE TABLE assessments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    answers JSON NOT NULL,
    score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recreate daily_checkins table (sleep_hours, work_hours, score_assessment)
CREATE TABLE daily_checkins (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    sleep_hours DECIMAL(4,2) NOT NULL,
    work_hours DECIMAL(4,2) NOT NULL,
    score_assessment INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (score_assessment) REFERENCES assessments(id) ON DELETE SET NULL
);
