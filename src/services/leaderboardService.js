import { getXpForDifficulty } from '../utils/xp'
import { findProblemByIdentity, getProblemIdentityKey, normalizeProblemType } from '../utils/problemIdentity'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

function resolveDifficulty(problemType, problemId) {
  const problem = findProblemByIdentity(problemType, problemId)
  return problem?.difficulty || 'Easy'
}

export async function getLeaderboard() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.')
  }

  const { data, error } = await supabase.rpc('get_leaderboard_solved_rows')
  if (error) {
    console.error('Unable to fetch Supabase leaderboard:', error)
    throw error
  }

  const users = new Map()
  for (const row of data || []) {
    if (!row.user_id || row.problem_id == null) continue

    const problemType = normalizeProblemType(row.problem_type)
    if (!problemType) {
      console.warn('[leaderboardService] Skipping solved row without a valid problem type.', { row })
      continue
    }

    let entry = users.get(row.user_id)
    if (!entry) {
      entry = {
        id: row.user_id,
        username: row.username || 'Learner',
        avatarUrl: row.avatar_url || null,
        solvedProblems: new Map(),
        earliestSolve: row.solved_at || null,
      }
      users.set(row.user_id, entry)
    }

    const problemId = Number(row.problem_id)
    const logicalKey = getProblemIdentityKey(problemType, problemId)
    if (!entry.solvedProblems.has(logicalKey)) {
      entry.solvedProblems.set(logicalKey, resolveDifficulty(problemType, problemId))
    }

    if (row.solved_at && (!entry.earliestSolve || row.solved_at < entry.earliestSolve)) {
      entry.earliestSolve = row.solved_at
    }
  }

  const rankedUsers = [...users.values()]
    .map((entry) => {
      const solvedProblems = [...entry.solvedProblems.entries()].map(([logicalKey, difficulty]) => ({
        logicalKey,
        difficulty,
      }))
      const totalXp = solvedProblems.reduce((sum, problem) => sum + getXpForDifficulty(problem.difficulty), 0)
      return {
        id: entry.id,
        username: entry.username,
        avatarUrl: entry.avatarUrl,
        problemsSolved: solvedProblems.length,
        totalXp,
        earliestSolve: entry.earliestSolve,
      }
    })
    .filter((entry) => entry.problemsSolved > 0)
    .sort((left, right) => (
      right.totalXp - left.totalXp ||
      right.problemsSolved - left.problemsSolved ||
      String(left.earliestSolve || '').localeCompare(String(right.earliestSolve || '')) ||
      left.username.localeCompare(right.username) ||
      left.id.localeCompare(right.id)
    ))

  return rankedUsers.map((entry, index) => ({ ...entry, rank: index + 1 }))
}

