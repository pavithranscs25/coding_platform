BEGIN;

DO $$
DECLARE
    relation_name TEXT;
    relation_kind "char";
    policy_name TEXT;
BEGIN
    FOREACH relation_name IN ARRAY ARRAY['coding_problems', 'sql_problems']
    LOOP
        SELECT c.relkind
        INTO relation_kind
        FROM pg_class AS c
        JOIN pg_namespace AS n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public'
          AND c.relname = relation_name;

        IF relation_kind IN ('r', 'p') THEN
            EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', relation_name);
            policy_name := relation_name || '_select_published';

            IF NOT EXISTS (
                SELECT 1
                FROM pg_policies
                WHERE schemaname = 'public'
                  AND tablename = relation_name
                  AND policyname = policy_name
            ) THEN
                EXECUTE format(
                    'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (is_published)',
                    policy_name,
                    relation_name
                );
            END IF;
        END IF;

        EXECUTE format('GRANT SELECT ON TABLE public.%I TO anon, authenticated', relation_name);
    END LOOP;
END
$$;

COMMIT;
