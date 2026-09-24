ALTER TABLE "exams"
  ADD COLUMN IF NOT EXISTS "internship_start_date" date,
  ADD COLUMN IF NOT EXISTS "internship_end_date" date,
  ADD COLUMN IF NOT EXISTS "internship_duration" varchar(50);

UPDATE "exams"
SET "is_public" = false
WHERE "internship_start_date" IS NULL
   OR "internship_end_date" IS NULL
   OR "internship_duration" IS NULL;
