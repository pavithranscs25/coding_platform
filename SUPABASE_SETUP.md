# LogicFirst Supabase Setup

This document summarizes the Phase 2A database foundation for the LogicFirst project.

## Database tables

### profiles

Stores account metadata for each Supabase auth user.

Columns:
- `id`
- `user_id`
- `username`
- `email`
- `avatar_url`
- `created_at`
- `updated_at`

Constraints:
- unique `user_id`
- unique `username`
- `user_id` references `auth.users(id)` with `ON DELETE CASCADE`

### problem_progress

Stores a user’s per-problem lifecycle state.

Columns:
- `id`
- `user_id`
- `problem_id`
- `status`
- `first_attempted_at`
- `solved_at`
- `updated_at`

Allowed statuses:
- `NOT_STARTED`
- `ATTEMPTED`
- `SOLVED`

### submissions

Stores accepted or rejected coding submissions.

Columns:
- `id`
- `user_id`
- `problem_id`
- `language`
- `code`
- `status`
- `execution_time_ms`
- `memory_kb`
- `submitted_at`

Allowed statuses:
- `Accepted`
- `Wrong Answer`
- `Runtime Error`
- `Compilation Error`
- `Time Limit Exceeded`

## Relationship model

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

## Why no problem foreign key

There is no `problem_id` foreign key because the challenge definitions are still runtime/local app data for now, coming from:

- `src/data/problems.js`
- `src/data/databaseProblems.js`

This aligns with the Phase 2A scope, where database foundation is created before the future problem migration.

## RLS policy model

All user-owned tables have RLS enabled and policies limited to the signed-in user's own records.

Examples:
- `auth.uid() = user_id`
- `WITH CHECK (auth.uid() = user_id)`

This ensures that users cannot access or modify data belonging to another account.

## Trigger functions

The migration creates:

- `public.handle_new_user()`
- `public.set_updated_at()`

These support:
- automatic profile creation when a new auth user is created
- automatic `updated_at` refresh on profile/progress updates

## Environment variables

Expected frontend variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Never add a service-role key to the frontend environment.

## Apply migration manually

Open the Supabase SQL Editor and run the migration file:

```text
supabase/migrations/001_initial_schema.sql
```

This migration is intentionally not applied automatically here.

## Phase boundary

This file covers Phase 2A only.

- Supabase database foundation is created.
- No leaderboard logic, no real code execution, no Google Sign-In, and no UI changes are included.
- Phase 2B+ remains out of scope for this step.
