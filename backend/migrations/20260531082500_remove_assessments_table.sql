-- Drop the foreign key constraint on daily_checkins pointing to assessments
ALTER TABLE daily_checkins DROP CONSTRAINT IF EXISTS daily_checkins_score_assessment_fkey;

-- Drop the assessments table
DROP TABLE IF EXISTS assessments CASCADE;
