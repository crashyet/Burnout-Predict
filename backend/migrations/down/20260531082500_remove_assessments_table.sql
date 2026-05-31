-- Recreate assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    answers JSON NOT NULL,
    score INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Re-add the foreign key constraint
ALTER TABLE daily_checkins
  ADD CONSTRAINT daily_checkins_score_assessment_fkey
  FOREIGN KEY (score_assessment) REFERENCES assessments(id) ON DELETE SET NULL;
