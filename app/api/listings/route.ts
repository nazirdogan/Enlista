import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Try to get the authenticated user
  let userId: string | null = null
  try {
    const cookieStore = cookies()
    const sessionClient = createServerClient(supabaseUrl, anonKey, {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    })
    const { data: { user } } = await sessionClient.auth.getUser()
    userId = user?.id ?? null
  } catch {
    // no session
  }

  // Dev fallback — same user that save-listing uses
  if (!userId) {
    if (process.env.NODE_ENV === 'development') {
      userId = process.env.DEV_USER_ID ?? 'c32afbb1-8393-4ef4-85c9-e9d5af0a3cbb'
    } else {
      return Response.json({ error: 'Unauthorised' }, { status: 401 })
    }
  }

  const adminClient = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : createClient(supabaseUrl, anonKey)

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id) {
    // Single listing fetch
    const { data, error } = await adminClient
      .from('listings')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return Response.json({ error: 'Listing not found' }, { status: 404 })
    }

    return Response.json({ listing: data })
  }

  // All listings
  const { data, error } = await adminClient
    .from('listings')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ listings: data })
}
