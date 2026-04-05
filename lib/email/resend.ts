import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Enlista <hello@enlista.io>'

export type EmailPayload =
  | { type: 'welcome'; to: string; agencyName: string }
  | { type: 'trial_expiry'; to: string; agencyName: string; expiresAt: string }
  | { type: 'payment_failed'; to: string; agencyName: string }
  | { type: 'subscription_confirmed'; to: string; agencyName: string; plan: string }
  | {
      type: 'contact_lead'
      to: string
      firstName: string
      lastName: string
      email: string
      phone: string
      agencyName: string
      employeeCount: string
      location: string
      focusArea: string[]
      message?: string
    }

export async function sendTransactionalEmail(payload: EmailPayload) {
  const agencyName = 'agencyName' in payload ? payload.agencyName : ''
  const plan = 'plan' in payload ? payload.plan : ''
  const subjects: Record<string, string> = {
    welcome: `Welcome to Enlista, ${agencyName}!`,
    trial_expiry: `Your Enlista trial expires soon`,
    payment_failed: `Action required: Payment failed for your Enlista subscription`,
    subscription_confirmed: `You're now on the ${plan} plan — welcome aboard`,
    contact_lead: `New Agency Lead: ${'agencyName' in payload ? payload.agencyName : ''}`,
  }

  const html = buildEmailHtml(payload)

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: payload.to,
    subject: subjects[payload.type],
    html,
  })

  if (error) throw new Error(`Resend error: ${String(error)}`)
  return data
}

function buildEmailHtml(payload: EmailPayload): string {
  const base = `<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">`
  const footer = `<p style="color:#9ca3af;font-size:12px;margin-top:32px;">Enlista · Dubai, UAE</p></div>`

  switch (payload.type) {
    case 'welcome':
      return `${base}<h2>Welcome, ${payload.agencyName}!</h2><p>Your 7-day free trial is now active. Generate your first listing at <a href="https://enlista.io/new">enlista.io/new</a>.</p>${footer}`
    case 'trial_expiry':
      return `${base}<h2>Your trial expires on ${payload.expiresAt}</h2><p>Upgrade now to keep generating listings for ${payload.agencyName}.</p>${footer}`
    case 'payment_failed':
      return `${base}<h2>Payment failed</h2><p>We couldn't charge your card for ${payload.agencyName}'s subscription. Please update your payment method.</p>${footer}`
    case 'subscription_confirmed':
      return `${base}<h2>You're on the ${payload.plan} plan</h2><p>${payload.agencyName} is now fully active. Start generating unlimited listings.</p>${footer}`
    case 'contact_lead':
      return `${base}
    <div style="text-align:center;margin-bottom:24px;">
      <h2 style="color:#1E293B;margin:0;">New Agency Lead</h2>
      <p style="color:#64748B;font-size:14px;margin-top:4px;">${payload.agencyName}</p>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr style="border-bottom:1px solid #DDE3EC;">
        <td style="padding:12px 8px;color:#64748B;font-weight:600;width:140px;">Name</td>
        <td style="padding:12px 8px;color:#1E293B;">${payload.firstName} ${payload.lastName}</td>
      </tr>
      <tr style="border-bottom:1px solid #DDE3EC;">
        <td style="padding:12px 8px;color:#64748B;font-weight:600;">Email</td>
        <td style="padding:12px 8px;color:#1E293B;"><a href="mailto:${payload.email}" style="color:#1D4ED8;">${payload.email}</a></td>
      </tr>
      <tr style="border-bottom:1px solid #DDE3EC;">
        <td style="padding:12px 8px;color:#64748B;font-weight:600;">Phone</td>
        <td style="padding:12px 8px;color:#1E293B;"><a href="tel:${payload.phone}" style="color:#1D4ED8;">${payload.phone}</a></td>
      </tr>
      <tr style="border-bottom:1px solid #DDE3EC;">
        <td style="padding:12px 8px;color:#64748B;font-weight:600;">Agency</td>
        <td style="padding:12px 8px;color:#1E293B;">${payload.agencyName}</td>
      </tr>
      <tr style="border-bottom:1px solid #DDE3EC;">
        <td style="padding:12px 8px;color:#64748B;font-weight:600;">Employees</td>
        <td style="padding:12px 8px;color:#1E293B;">${payload.employeeCount}</td>
      </tr>
      <tr style="border-bottom:1px solid #DDE3EC;">
        <td style="padding:12px 8px;color:#64748B;font-weight:600;">Location</td>
        <td style="padding:12px 8px;color:#1E293B;">${payload.location}</td>
      </tr>
      <tr style="border-bottom:1px solid #DDE3EC;">
        <td style="padding:12px 8px;color:#64748B;font-weight:600;">Focus Area</td>
        <td style="padding:12px 8px;color:#1E293B;">${payload.focusArea.join(', ')}</td>
      </tr>
      ${payload.message ? `<tr><td style="padding:12px 8px;color:#64748B;font-weight:600;">Message</td><td style="padding:12px 8px;color:#1E293B;">${payload.message}</td></tr>` : ''}
    </table>
    <p style="color:#94A3B8;font-size:12px;margin-top:24px;">Submitted at ${new Date().toLocaleString('en-AE', { timeZone: 'Asia/Dubai' })}</p>
  ${footer}`
    default:
      return ''
  }
}
