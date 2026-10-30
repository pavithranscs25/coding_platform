BEGIN;

DROP FUNCTION public.get_leaderboard_solved_rows();

CREATE FUNCTION public.get_leaderboard_solved_rows()
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    avatar_url TEXT,
    problem_type TEXT,
    problem_id BIGINT,
    solved_at TIMESTAMPTZ
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT
        profile.user_id,
        profile.username,
        profile.avatar_url,
        progress.problem_type,
        progress.problem_id,
        progress.solved_at
    FROM public.problem_progress AS progress
    INNER JOIN public.profiles AS profile
        ON profile.user_id = progress.user_id
    WHERE progress.status = 'SOLVED'
      AND progress.problem_type IN ('CODING', 'SQL')
      AND auth.uid() IS NOT NULL
    ORDER BY progress.user_id, progress.solved_at, progress.problem_type, progress.problem_id;
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard_solved_rows() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_solved_rows() TO authenticated;

COMMIT;

-- Verify after applying this migration:
-- SELECT user_id, problem_type, problem_id, solved_at
-- FROM public.get_leaderboard_solved_rows();
--
-- SELECT count(*)
-- FROM public.problem_progress
-- WHERE status = 'SOLVED'
--   AND problem_type IN ('CODING', 'SQL');
