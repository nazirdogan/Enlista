// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // DEV ONLY: skip all auth checks in development
  if (process.env.NODE_ENV === 'development') {
    return supabaseResponse
  }

  // Always use getUser() — not getSession() — to verify JWT server-side
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Admin routes: must be authenticated + in ADMIN_EMAILS allowlist
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }
    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim())
    if (!adminEmails.includes(user.email ?? '')) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  // Dashboard routes: must be authenticated AND have an active subscription
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/new') ||
    pathname.startsWith('/listings') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/analytics')
  ) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    // Skip subscription check when returning from Stripe checkout (webhook may not
    // have fired yet — the checkout=trial/success param signals this)
    const fromCheckout = request.nextUrl.searchParams.get('checkout')
    if (!fromCheckout) {
      const { data: agency, error: agencyError } = await supabase
        .from('agencies')
        .select('account_status')
        .eq('user_id', user.id)
        .single()

      // PGRST116 = "no rows" (new user, no agency yet) — redirect to onboarding
      // Other errors = infrastructure issue — fail open to avoid blocking active subscribers
      if (agencyError && agencyError.code !== 'PGRST116') {
        console.error('[middleware] agency lookup failed:', agencyError.message)
        return supabaseResponse
      }

      const status = agency?.account_status
      const allowed = ['trial', 'active']
      if (!status || !allowed.includes(status)) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
