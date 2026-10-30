import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'your_supabase_project_url' &&
  !supabaseUrl.includes('placeholder')
)

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)

export async function getAuthenticatedSession(operation, contextUserId) {
  if (!isSupabaseConfigured) {
    console.warn(`[${operation}] Supabase is not configured.`)
    return null
  }

  const { data, error } = await supabase.auth.getSession()
  const session = data?.session || null
  const authenticatedUserId = session?.user?.id || null

  console.info(`[${operation}] Supabase session`, {
    sessionExists: Boolean(session),
    authenticatedUserId,
    contextUserId: contextUserId || null,
    userIdsMatch: contextUserId ? contextUserId === authenticatedUserId : null,
  })

  if (error) {
    console.error(`[${operation}] Could not read Supabase session:`, {
      message: error.message,
      status: error.status,
      code: error.code,
    })
    return null
  }

  return session
}

