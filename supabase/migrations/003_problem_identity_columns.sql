BEGIN;

ALTER TABLE public.problem_progress
    ADD COLUMN IF NOT EXISTS problem_type TEXT;

ALTER TABLE public.submissions
    ADD COLUMN IF NOT EXISTS problem_type TEXT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'problem_progress_problem_type_check'
    ) THEN
        ALTER TABLE public.problem_progress
            ADD CONSTRAINT problem_progress_problem_type_check
            CHECK (problem_type IS NULL OR problem_type IN ('CODING', 'SQL'));
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'submissions_problem_type_check'
    ) THEN
        ALTER TABLE public.submissions
            ADD CONSTRAINT submissions_problem_type_check
            CHECK (problem_type IS NULL OR problem_type IN ('CODING', 'SQL'));
    END IF;
END $$;

DO $$
DECLARE
    typed_duplicates INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO typed_duplicates
    FROM (
        SELECT user_id, problem_type, problem_id
        FROM public.problem_progress
        WHERE problem_type IS NOT NULL
        GROUP BY user_id, problem_type, problem_id
        HAVING COUNT(*) > 1
    ) duplicate_rows;

    IF typed_duplicates > 0 THEN
        RAISE EXCEPTION
            'Refusing to replace the legacy progress uniqueness: typed rows already violate (user_id, problem_type, problem_id). Review and clean duplicates before applying this migration.';
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_problem_progress_user_problem_type_identity
    ON public.problem_progress (user_id, problem_type, problem_id);

CREATE INDEX IF NOT EXISTS idx_problem_progress_problem_type
    ON public.problem_progress (problem_type);

CREATE INDEX IF NOT EXISTS idx_submissions_problem_type
    ON public.submissions (problem_type);

COMMENT ON COLUMN public.problem_progress.problem_type IS 'Catalog type for the recorded problem identity: CODING or SQL.';
COMMENT ON COLUMN public.submissions.problem_type IS 'Catalog type for the recorded problem identity: CODING or SQL.';

ALTER TABLE public.problem_progress
    DROP CONSTRAINT IF EXISTS problem_progress_user_id_problem_id_key;

COMMIT;

-- Review checklist before execution:
-- 1. The new unique index is created only after checking for typed duplicate rows.
-- 2. Historical rows with NULL problem_type are intentionally left untouched.
-- 3. The legacy unique constraint on (user_id, problem_id) is dropped only after the composite identity is in place.
-- 4. Nothing in submissions is made unique; only the nullable problem_type column is added.
--
-- Safe verification queries (run manually after applying in a database):
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conrelid = 'public.problem_progress'::regclass
--   AND conname LIKE '%problem%';
--
-- SELECT user_id, problem_type, problem_id, COUNT(*)
-- FROM public.problem_progress
-- WHERE problem_type IS NOT NULL
-- GROUP BY user_id, problem_type, problem_id
-- HAVING COUNT(*) > 1;
--
-- SELECT table_name, column_name, is_nullable
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name IN ('problem_progress', 'submissions')
-- ORDER BY table_name, ordinal_position;
