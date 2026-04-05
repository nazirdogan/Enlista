const BASE = 'https://graph.facebook.com/v19.0'
const PHONE_ID = process.env.META_WA_PHONE_NUMBER_ID!
const TOKEN = process.env.META_WA_ACCESS_TOKEN!

export interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send a free-form text message via WhatsApp Business API.
 * Note: Only works within a 24h customer service window.
 * For cold outreach, use sendTemplate instead.
 */
export async function sendMessage(
  toPhone: string,
  body: string
): Promise<SendResult> {
  const res = await fetch(`${BASE}/${PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: toPhone.replace('+', ''),
      type: 'text',
      text: { body },
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    return { success: false, error: data?.error?.message ?? 'Unknown error' }
  }

  return { success: true, messageId: data?.messages?.[0]?.id }
}

/**
 * Send using an approved Marketing template.
 * templateName must match the approved name in Meta Business Manager.
 * bodyParams are the variable substitutions for {{1}}, {{2}}, etc.
 */
export async function sendTemplate(
  toPhone: string,
  templateName: string,
  bodyParams: string[]
): Promise<SendResult> {
  const components = bodyParams.length > 0
    ? [{
        type: 'body',
        parameters: bodyParams.map(text => ({ type: 'text', text })),
      }]
    : []

  const res = await fetch(`${BASE}/${PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: toPhone.replace('+', ''),
      type: 'template',
      template: {
        name: templateName,
        language: { code: 'en' },
        components,
      },
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    return { success: false, error: data?.error?.message ?? 'Unknown error' }
  }
  return { success: true, messageId: data?.messages?.[0]?.id }
}

/**
 * Check if a phone number has an active WhatsApp account.
 * Returns true if the number is on WhatsApp.
 */
export async function isWhatsAppNumber(phone: string): Promise<boolean> {
  const res = await fetch(`${BASE}/${PHONE_ID}/contacts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      blocking: 'wait',
      contacts: [phone.replace('+', '')],
      force_check: false,
    }),
  })

  if (!res.ok) return false
  const data = await res.json()
  return data?.contacts?.[0]?.status === 'valid'
}
