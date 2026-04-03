import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTransactionalEmail } from '@/lib/email/resend'

const VALID_EMPLOYEE_COUNTS = ['1-5', '6-15', '16-50', '51-100', '100+']
const VALID_FOCUS_AREAS = ['leasing', 'sales', 'off-plan', 'all']

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { firstName, lastName, email, phone, agencyName, employeeCount, location, focusArea, message } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !agencyName || !employeeCount || !location) {
      return NextResponse.json({ error: 'All required fields must be filled.' }, { status: 400 })
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
    }

    // Validate employee count
    if (!VALID_EMPLOYEE_COUNTS.includes(employeeCount)) {
      return NextResponse.json({ error: 'Invalid employee count range.' }, { status: 400 })
    }

    // Validate focus area
    if (!Array.isArray(focusArea) || focusArea.length === 0 || !focusArea.every((f: string) => VALID_FOCUS_AREAS.includes(f))) {
      return NextResponse.json({ error: 'Invalid focus area selection.' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Rate limit: reject if same email submitted in last 5 minutes
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: recent } = await supabase
      .from('contact_leads')
      .select('id')
      .eq('email', email)
      .gte('created_at', fiveMinAgo)
      .limit(1)

    if (recent && recent.length > 0) {
      return NextResponse.json({ error: 'You have already submitted a request. Please wait a few minutes.' }, { status: 429 })
    }

    // Insert lead
    const { error: insertError } = await supabase.from('contact_leads').insert({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      agency_name: agencyName,
      employee_count: employeeCount,
      location,
      focus_area: focusArea,
      message: message || null,
    })

    if (insertError) {
      console.error('Failed to insert contact lead:', insertError)
      return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    // Send notification email
    try {
      await sendTransactionalEmail({
        type: 'contact_lead',
        to: 'nazir@enlista.io',
        firstName,
        lastName,
        email,
        phone,
        agencyName,
        employeeCount,
        location,
        focusArea,
        message,
      })
    } catch (emailErr) {
      // Log but don't fail the request — lead is already saved
      console.error('Failed to send lead notification email:', emailErr)
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
}
