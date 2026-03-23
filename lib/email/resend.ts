import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Enlista <hello@enlista.ai>'

type EmailPayload =
  | { type: 'welcome'; to: string; agencyName: string }
  | { type: 'trial_expiry'; to: string; agencyName: string; expiresAt: string }
  | { type: 'payment_failed'; to: string; agencyName: string }
  | { type: 'subscription_confirmed'; to: string; agencyName: string; plan: string }

export async function sendTransactionalEmail(payload: EmailPayload) {
  const agencyName = 'agencyName' in payload ? payload.agencyName : ''
  const plan = 'plan' in payload ? payload.plan : ''
  const subjects: Record<string, string> = {
    welcome: `Welcome to Enlista, ${agencyName}!`,
    trial_expiry: `Your Enlista trial expires soon`,
    payment_failed: `Action required: Payment failed for your Enlista subscription`,
    subscription_confirmed: `You're now on the ${plan} plan — welcome aboard`,
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
      return `${base}<h2>Welcome, ${payload.agencyName}!</h2><p>Your 7-day free trial is now active. Generate your first listing at <a href="https://enlista.ai/new">enlista.ai/new</a>.</p>${footer}`
    case 'trial_expiry':
      return `${base}<h2>Your trial expires on ${payload.expiresAt}</h2><p>Upgrade now to keep generating listings for ${payload.agencyName}.</p>${footer}`
    case 'payment_failed':
      return `${base}<h2>Payment failed</h2><p>We couldn't charge your card for ${payload.agencyName}'s subscription. Please update your payment method.</p>${footer}`
    case 'subscription_confirmed':
      return `${base}<h2>You're on the ${payload.plan} plan</h2><p>${payload.agencyName} is now fully active. Start generating unlimited listings.</p>${footer}`
    default:
      return ''
  }
}
