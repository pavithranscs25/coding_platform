import { getAuthenticatedSession, supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { findProblemByIdentity, getProblemIdentityKey, normalizeProblemType, PROBLEM_TYPES } from '../utils/problemIdentity'
import { calculateTotalXp } from '../utils/xp'

export const PROBLEM_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  ATTEMPTED: 'ATTEMPTED',
  SOLVED: 'SOLVED',
}

const STORAGE_PREFIX = 'logicfirst_progress_'
const listeners = new Set()

function getStorageKey(userId) {
  return `${STORAGE_PREFIX}${userId || 'guest'}`
}

function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn()
    } catch (err) {
      console.error('Error in progress listener:', err)
    }
  })
}

function getProgressKey(problemType, problemId) {
  return getProblemIdentityKey(problemType, problemId) || `legacy:${Number(problemId) || 0}`
}

function getProblemTypeFromEntry(entry) {
  return normalizeProblemType(
    entry?.problemType ||
    entry?.problem_type ||
    entry?.type ||
    entry?.problem_category ||
    entry?.category ||
    null
  )
}

function normalizeProgressEntry(entry) {
  const problemType = getProblemTypeFromEntry(entry)
  const problemId = Number(entry.problemId ?? entry.problem_id ?? entry.id ?? 0)
  const meta = problemType ? findProblemByIdentity(problemType, problemId) : null

  return {
    problemKey: getProgressKey(problemType, problemId),
    problemType,
    problemId,
    title: entry.title || meta?.title || `Problem ${problemId}`,
    difficulty: entry.difficulty || meta?.difficulty || 'Easy',
    topic: entry.topic || meta?.topic || '',
    status: entry.status || PROBLEM_STATUS.NOT_STARTED,
    lastAttemptAt: entry.lastAttemptAt || entry.last_attempted_at || entry.updated_at || null,
    solvedAt: entry.solvedAt || entry.solved_at || null,
  }
}

function readLocalProgress(userId) {
  try {
    const raw = localStorage.getItem(getStorageKey(userId))
    return raw ? JSON.parse(raw) : {}
  } catch (err) {
    console.error('Error reading progress:', err)
    return {}
  }
}

function saveLocalProgress(userId, progress) {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(progress))
    notifyListeners()
  } catch (err) {
    console.error('Error saving progress:', err)
  }
}

async function fetchSupabaseProgress(userId) {
  if (!userId || !isSupabaseConfigured) return {}

  const { data, error } = await supabase
    .from('problem_progress')
    .select('problem_type, problem_id, status, first_attempted_at, solved_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    if (error.code === '42703' || error.code === '42P01') {
      console.warn('[progressService] problem_type columns are not available yet. The migration is pending; legacy rows are preserved without reclassification.', error)
      return {}
    }

    console.error('Error fetching remote progress:', error)
    return {}
  }

  const mapped = {}
  ;(data || []).forEach((row) => {
    const problemType = normalizeProblemType(row.problem_type)
    const problemId = Number(row.problem_id)

    if (!problemType || !Number.isFinite(problemId)) {
      console.warn('[progressService] Skipping ambiguous legacy progress row without a valid problem_type.', {
        row,
      })
      return
    }

    const entry = normalizeProgressEntry({
      problemType,
      problemId,
      status: row.status,
      last_attempted_at: row.first_attempted_at || row.updated_at,
      solved_at: row.solved_at,
      updated_at: row.updated_at,
    })

    mapped[entry.problemKey] = entry
  })

  saveLocalProgress(userId, mapped)
  return mapped
}

async function persistSupabaseProgress(contextUserId, problem, status) {
  if (!problem?.id || !isSupabaseConfigured) return null

  const problemType = normalizeProblemType(problem.problemType || problem.type || problem.problem_type)
  if (!problemType) {
    console.warn('[progressService] Progress write skipped: no problem type supplied for the record.', {
      problemId: Number(problem.id),
      problem,
    })
    return null
  }

  const session = await getAuthenticatedSession('progressService', contextUserId)
  const userId = session?.user?.id
  if (!userId) {
    console.error('[progressService] Progress write skipped: no authenticated Supabase session.', {
      problemType,
      problemId: Number(problem.id),
    })
    return null
  }

  const now = new Date().toISOString()
  const current = readLocalProgress(userId)
  const existingKey = getProgressKey(problemType, problem.id)
  const existing = current[existingKey]

  const row = {
    user_id: userId,
    problem_type: problemType,
    problem_id: Number(problem.id),
    status,
    first_attempted_at: status === PROBLEM_STATUS.ATTEMPTED
      ? existing?.firstAttemptedAt || existing?.lastAttemptAt || now
      : existing?.firstAttemptedAt || existing?.lastAttemptAt || now,
    solved_at: status === PROBLEM_STATUS.SOLVED ? (existing?.solvedAt || now) : existing?.solvedAt || null,
    updated_at: now,
  }

  console.info('[progressService] upserting progress', {
    sessionExists: true,
    authenticatedUserId: userId,
    contextUserId: contextUserId || null,
    problemType,
    problemId: row.problem_id,
    status: row.status,
  })

  try {
    const { data, error } = await supabase
      .from('problem_progress')
      .upsert(row, { onConflict: 'user_id,problem_type,problem_id' })
      .select()
      .single()

    if (error) throw error

    const saved = normalizeProgressEntry({
      problemType: data.problem_type,
      problemId: data.problem_id,
      status: data.status,
      last_attempted_at: data.first_attempted_at || data.updated_at,
      solved_at: data.solved_at,
      updated_at: data.updated_at,
    })

    const nextProgress = { ...readLocalProgress(userId), [saved.problemKey]: saved }
    saveLocalProgress(userId, nextProgress)

    return saved
  } catch (error) {
    console.warn('[progressService] problem_type upsert target is unavailable; preserving legacy compatibility and alerting for migration.', {
      problemType,
      code: error?.code,
      message: error?.message,
    })

    const legacyRow = {
      user_id: userId,
      problem_id: Number(problem.id),
      status,
      first_attempted_at: row.first_attempted_at,
      solved_at: row.solved_at,
      updated_at: row.updated_at,
    }

    const { data, fallbackError } = await supabase
      .from('problem_progress')
      .upsert(legacyRow, { onConflict: 'user_id,problem_id' })
      .select()
      .single()

    if (fallbackError) {
      console.error('[progressService] Supabase upsert failed:', {
        status: fallbackError.status,
        code: fallbackError.code,
        message: fallbackError.message,
        details: fallbackError.details,
        hint: fallbackError.hint,
        userId,
        problemType,
        problemId: row.problem_id,
      })
      return null
    }

    const saved = normalizeProgressEntry({
      problemId: data.problem_id,
      status: data.status,
      last_attempted_at: data.first_attempted_at || data.updated_at,
      solved_at: data.solved_at,
      updated_at: data.updated_at,
    })

    const nextProgress = { ...readLocalProgress(userId), [saved.problemKey]: saved }
    saveLocalProgress(userId, nextProgress)

    return saved
  }
}

export function subscribeToProgress(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

export function getUserProgress(userId) {
  return readLocalProgress(userId)
}

export async function fetchUserProgress(userId) {
  if (userId && isSupabaseConfigured) {
    return fetchSupabaseProgress(userId)
  }
  return readLocalProgress(userId)
}

export async function fetchUserProgressFromSupabase(contextUserId) {
  const session = await getAuthenticatedSession('fetchUserProgress', contextUserId)
  const userId = session?.user?.id
  if (!userId) throw new Error('No authenticated Supabase user is available.')

  const { data, error } = await supabase
    .from('problem_progress')
    .select('problem_type, problem_id, status, first_attempted_at, solved_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    if (error.code === '42703' || error.code === '42P01') {
      console.warn('[progressService] problem_type columns are not available yet; legacy records remain read-only until the migration is applied.', error)
      const fallback = await supabase
        .from('problem_progress')
        .select('problem_id, status, first_attempted_at, solved_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })

      if (fallback.error) throw fallback.error

      return (fallback.data || []).map((row) => normalizeProgressEntry({
        problemId: row.problem_id,
        status: row.status,
        last_attempted_at: row.first_attempted_at || row.updated_at,
        solved_at: row.solved_at,
        updated_at: row.updated_at,
      }))
    }

    throw error
  }

  return (data || []).map((row) => {
    const problemType = normalizeProblemType(row.problem_type)
    if (!problemType) {
      console.warn('[progressService] Skipping ambiguous legacy row in profile data.', { row })
      return null
    }

    return normalizeProgressEntry({
      problemType,
      problemId: row.problem_id,
      status: row.status,
      last_attempted_at: row.first_attempted_at || row.updated_at,
      solved_at: row.solved_at,
      updated_at: row.updated_at,
    })
  }).filter(Boolean)
}

export function getProblemStatus(userId, problemTypeOrId, problemIdOverride) {
  const progress = getUserProgress(userId)
  const problemType = problemIdOverride !== undefined ? normalizeProblemType(problemTypeOrId) : null
  const resolvedId = problemIdOverride !== undefined ? problemIdOverride : problemTypeOrId
  const key = problemType ? getProgressKey(problemType, resolvedId) : String(resolvedId)
  return progress[key]?.status || PROBLEM_STATUS.NOT_STARTED
}

export async function recordAttempt(userId, problem) {
  if (!problem?.id) return

  const problemType = normalizeProblemType(problem.problemType || problem.type || problem.problem_type)
  if (!problemType) {
    console.warn('[progressService] recordAttempt skipped because the problem type is missing.', { problem })
    return
  }

  const progress = getUserProgress(userId)
  const key = getProgressKey(problemType, problem.id)
  const existing = progress[key]
  const nextStatus = existing?.status === PROBLEM_STATUS.SOLVED
    ? PROBLEM_STATUS.SOLVED
    : PROBLEM_STATUS.ATTEMPTED

  const nextEntry = normalizeProgressEntry({
    problemType,
    problemId: problem.id,
    title: problem.title,
    difficulty: problem.difficulty || 'Easy',
    topic: problem.topic || '',
    status: nextStatus,
    lastAttemptAt: new Date().toISOString(),
    solvedAt: existing?.solvedAt || null,
  })

  progress[key] = nextEntry
  saveLocalProgress(userId, progress)

  if (isSupabaseConfigured) {
    await persistSupabaseProgress(userId, { ...problem, problemType }, nextStatus)
  }
}

export async function recordSolved(userId, problem) {
  if (!problem?.id) return

  const problemType = normalizeProblemType(problem.problemType || problem.type || problem.problem_type)
  if (!problemType) {
    console.warn('[progressService] recordSolved skipped because the problem type is missing.', { problem })
    return
  }

  const progress = getUserProgress(userId)
  const key = getProgressKey(problemType, problem.id)
  const existing = progress[key]
  const now = new Date().toISOString()

  progress[key] = normalizeProgressEntry({
    problemType,
    problemId: problem.id,
    title: problem.title,
    difficulty: problem.difficulty || 'Easy',
    topic: problem.topic || '',
    status: PROBLEM_STATUS.SOLVED,
    lastAttemptAt: now,
    solvedAt: existing?.solvedAt || now,
  })

  saveLocalProgress(userId, progress)

  if (isSupabaseConfigured) {
    await persistSupabaseProgress(userId, { ...problem, problemType }, PROBLEM_STATUS.SOLVED)
  }
}

function buildUserStats(progress) {
  const records = Object.values(progress || {}).filter((record) => record.problemType)

  const solvedList = records.filter((r) => r.status === PROBLEM_STATUS.SOLVED)
  const attemptedList = records.filter(
    (r) => r.status === PROBLEM_STATUS.ATTEMPTED || r.status === PROBLEM_STATUS.SOLVED
  )

  const difficultyBreakdown = {
    Easy: 0,
    Medium: 0,
    Hard: 0,
  }

  solvedList.forEach((item) => {
    if (difficultyBreakdown[item.difficulty] !== undefined) {
      difficultyBreakdown[item.difficulty] += 1
    } else {
      difficultyBreakdown.Easy += 1
    }
  })

  const totalXp = calculateTotalXp(solvedList)

  const activeDates = new Set()
  records.forEach((r) => {
    if (r.lastAttemptAt) activeDates.add(r.lastAttemptAt.slice(0, 10))
    if (r.solvedAt) activeDates.add(r.solvedAt.slice(0, 10))
  })

  const currentStreak = activeDates.size > 0 ? (solvedList.length > 0 ? 1 : 0) : 0

  const recentActivity = [...records]
    .sort((a, b) => {
      const timeA = new Date(a.solvedAt || a.lastAttemptAt || 0).getTime()
      const timeB = new Date(b.solvedAt || b.lastAttemptAt || 0).getTime()
      return timeB - timeA
    })
    .slice(0, 5)

  return {
    problemsSolved: solvedList.length,
    problemsAttempted: attemptedList.length,
    currentStreak,
    totalXp,
    difficultyBreakdown,
    recentActivity,
    solvedList,
  }
}

export function getUserStats(userId) {
  return buildUserStats(getUserProgress(userId))
}

export async function fetchUserStats(userId) {
  const progress = userId && isSupabaseConfigured ? await fetchUserProgress(userId) : getUserProgress(userId)
  return buildUserStats(progress)
}

