# LogicFirst Supabase Foundation

This folder contains the database foundation for the LogicFirst Phase 2A work.

## Tables

The schema includes:

- `public.profiles`
- `public.problem_progress`
- `public.submissions`

## Relationship overview

```text
auth.users
    │
    └── profiles

auth.users
    │
    ├── problem_progress
    │
    └── submissions
```

## Status values

### Problem progress

- `NOT_STARTED`
- `ATTEMPTED`
- `SOLVED`

### Submission results

- `Accepted`
- `Wrong Answer`
- `Runtime Error`
- `Compilation Error`
- `Time Limit Exceeded`

## Why there is no problem foreign key

Problems are currently still defined in the frontend application, not in PostgreSQL. They live in:

- `src/data/problems.js`
- `src/data/databaseProblems.js`

The database schema intentionally does not create a foreign key to a problem table because those problem definitions still live in the app and will be migrated later in a future phase.

## RLS

Row Level Security is enabled on all user-owned tables. Each authenticated user can access only their own records using `auth.uid() = user_id` checks.

## Environment variables

The app expects the public Vite environment variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Do not add service-role keys to the frontend environment.

## Applying the migration

To apply the database foundation, open the Supabase SQL Editor and run:

```sql
-- paste contents of supabase/migrations/001_initial_schema.sql
```

This migration is intentionally left for manual application in Supabase, as requested for Phase 2A.

## Applying the leaderboard read function

The existing profile and progress RLS policies allow users to read only their own rows. The global leaderboard therefore uses a narrowly scoped, read-only RPC without changing those policies or any table definitions.

After the initial schema is applied, open the Supabase SQL Editor and run the contents of:

```text
supabase/migrations/002_leaderboard_read_function.sql
```

The function is executable by authenticated users only and returns usernames, avatar URLs, and solved problem IDs/timestamps for ranking.
