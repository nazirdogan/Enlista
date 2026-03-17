import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Get the current user from the session cookie — required to save
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
    // session read failed
  }

  // In development, fall back to a real dev user so FK constraints are satisfied
  if (!userId) {
    if (process.env.NODE_ENV === 'development') {
      userId = process.env.DEV_USER_ID ?? 'c32afbb1-8393-4ef4-85c9-e9d5af0a3cbb'
    } else {
      return Response.json({ error: 'You must be signed in to save a listing.' }, { status: 401 })
    }
  }

  // Use service role to bypass RLS, or fall back to anon
  const adminClient = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : createClient(supabaseUrl, anonKey)

  // Strip preview-only fields and inject user_id
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = body as Record<string, unknown>

  const payload = {
    ...rest,
    user_id: userId,
  }

  const { data, error } = await adminClient
    .from('listings')
    .insert(payload)
    .select('id')
    .single()

  if (error || !data) {
    return Response.json({ error: error?.message ?? 'Insert failed' }, { status: 500 })
  }

  return Response.json({ id: (data as { id: string }).id })
}
