import { getAuthenticatedSession, isSupabaseConfigured, supabase } from '../lib/supabaseClient'

export async function getMyProfile(contextUserId) {
  if (!isSupabaseConfigured) throw new Error('Supabase is not configured.')

  const session = await getAuthenticatedSession('getMyProfile', contextUserId)
  const userId = session?.user?.id
  if (!userId) throw new Error('No authenticated Supabase user is available.')

  const { data, error } = await supabase
    .from('profiles')
    .select('username, email, avatar_url, created_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}
