import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const token = url.searchParams.get('t')
  // Prefer explicit env var; fall back to the request's own origin so the
  // route works in tests (where NEXT_PUBLIC_BASE_URL is unset) and in edge
  // runtimes where relative URLs are rejected by NextResponse.redirect.
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? `${url.protocol}//${url.host}`

  if (!token) {
    return NextResponse.redirect(`${baseUrl}/auth`)
  }

  // Log the click (fire and forget — don't block redirect on DB write)
  const supabase = createClient()
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null

  supabase
    .from('outreach_clicks')
    .insert({ tracking_token: token, ip })
    .then(() => {}) // intentionally not awaited

  return NextResponse.redirect(`${baseUrl}/auth?t=${token}`, { status: 307 })
}
