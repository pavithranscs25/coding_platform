import { getAuthenticatedSession, isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { getProblemTypeForLanguage, normalizeProblemType } from '../utils/problemIdentity'

export async function createSubmission({
  userId,
  problemId,
  problemType,
  language,
  code,
  status,
  executionTime,
  memory,
}) {
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured; submission insert skipped.')
    return null
  }

  const session = await getAuthenticatedSession('submissionService', userId)
  const resolvedUserId = session?.user?.id
  if (!resolvedUserId) {
    console.error('[submissionService] Submission skipped: no authenticated Supabase session.')
    return null
  }

  const resolvedProblemType = normalizeProblemType(problemType) || getProblemTypeForLanguage(language)

  const payload = {
    user_id: resolvedUserId,
    problem_type: resolvedProblemType,
    problem_id: Number(problemId),
    language: language || 'python',
    code: code || '',
    status: status || 'Accepted',
    execution_time_ms: executionTime ?? null,
    memory_kb: memory == null ? null : Math.round(Number(memory) * 1024),
    submitted_at: new Date().toISOString(),
  }

  console.info('[submissionService] inserting submission', {
    userId: resolvedUserId,
    authenticatedUserId: session.user.id,
    problemType: payload.problem_type,
    problemId: payload.problem_id,
    payload,
  })

  const { error } = await supabase.from('submissions').insert(payload)

  if (error) {
    console.error('[submissionService] Supabase insert failed:', {
      status: error.status,
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      userId: resolvedUserId,
      problemType: payload.problem_type,
      problemId: payload.problem_id,
    })
    return null
  }

  console.log('[submissionService] insert succeeded for user', resolvedUserId)
  return payload
}

export async function getMySubmissions() {
  if (!isSupabaseConfigured) return []

  const session = await getAuthenticatedSession('getMySubmissions')
  const userId = session?.user?.id
  if (!userId) return []

  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Error loading submissions:', error)
    return []
  }

  return data || []
}

export async function getRecentSubmissions(contextUserId, limit = 5) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  const session = await getAuthenticatedSession('getRecentSubmissions', contextUserId)
  const userId = session?.user?.id
  if (!userId) throw new Error('No authenticated Supabase user is available.')

  const { data, error } = await supabase
    .from('submissions')
    .select('id, problem_type, problem_id, language, status, execution_time_ms, memory_kb, submitted_at')
    .eq('user_id', userId)
    .order('submitted_at', { ascending: false })
    .limit(limit)

  if (error) {
    if (error.code === '42703' || error.code === '42P01') {
      console.warn('[submissionService] problem_type is not available yet; legacy rows are read without catalog metadata.', error)
      const fallback = await supabase
        .from('submissions')
        .select('id, problem_id, language, status, execution_time_ms, memory_kb, submitted_at')
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false })
        .limit(limit)

      if (fallback.error) throw fallback.error
      return fallback.data || []
    }

    throw error
  }

  return data || []
}

export async function getSubmissionStats(contextUserId) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  const session = await getAuthenticatedSession('getSubmissionStats', contextUserId)
  const userId = session?.user?.id
  if (!userId) throw new Error('No authenticated Supabase user is available.')

  const [allResult, acceptedResult] = await Promise.all([
    supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId),
    supabase
      .from('submissions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'Accepted'),
  ])

  if (allResult.error) throw allResult.error
  if (acceptedResult.error) throw acceptedResult.error

  return {
    totalSubmissions: allResult.count || 0,
    acceptedSubmissions: acceptedResult.count || 0,
  }
}
