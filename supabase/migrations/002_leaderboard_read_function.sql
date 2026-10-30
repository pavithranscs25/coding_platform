BEGIN;

CREATE OR REPLACE FUNCTION public.get_leaderboard_solved_rows()
RETURNS TABLE (
    user_id UUID,
    username TEXT,
    avatar_url TEXT,
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
        progress.problem_id,
        progress.solved_at
    FROM public.problem_progress AS progress
    INNER JOIN public.profiles AS profile
        ON profile.user_id = progress.user_id
    WHERE progress.status = 'SOLVED'
      AND auth.uid() IS NOT NULL
    ORDER BY progress.user_id, progress.solved_at, progress.problem_id;
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard_solved_rows() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_leaderboard_solved_rows() TO authenticated;

COMMIT;