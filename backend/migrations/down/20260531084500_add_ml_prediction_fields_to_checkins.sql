ALTER TABLE daily_checkins
  DROP COLUMN IF EXISTS final_burnout_score,
  DROP COLUMN IF EXISTS final_burnout_level,
  DROP COLUMN IF EXISTS note,
  DROP COLUMN IF EXISTS warning;
