import { readFileSync } from 'fs'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'
import { normalizePhone } from '../../lib/outreach/normalize-phone'
import { randomVariant, renderVariant, generateToken } from '../../lib/outreach/variants'
import { sendTemplate, isWhatsAppNumber } from '../../lib/outreach/meta-api'

// Load env manually for script context
import 'dotenv/config'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://enlista.ai'
const BATCH_SIZE = parseInt(process.env.OUTREACH_BATCH_SIZE ?? '100')

// Dubai business hours: 9am–6pm GST (UTC+4)
// UAE weekend is Fri-Sat (day 5 and 6). Sunday (day 0) IS a work day.
function isWithinSendWindow(): boolean {
  const now = new Date()
  const gst = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dubai' }))
  const hour = gst.getHours()
  const day = gst.getDay() // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  if (day === 5 || day === 6) return false // Fri-Sat = UAE weekend
  return hour >= 9 && hour < 18
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function randomDelay(): number {
  // 30–90 seconds between sends
  return (30 + Math.floor(Math.random() * 60)) * 1000
}

async function getOptouts(): Promise<Set<string>> {
  const { data } = await supabase.from('outreach_optouts').select('phone')
  return new Set((data ?? []).map((r: { phone: string }) => r.phone))
}

async function getSentPhones(): Promise<Set<string>> {
  const { data } = await supabase.from('outreach_sends').select('phone')
  return new Set((data ?? []).map((r: { phone: string }) => r.phone))
}

async function checkAndRunAnalysis(): Promise<void> {
  try {
    // Use Function constructor to defer module resolution — analysis.ts is Task 11 (not yet created).
    // This prevents a compile-time TS2307 error while still running at runtime when the file exists.
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const mod = await (new Function('p', 'return import(p)'))('../../lib/outreach/analysis') as { runAnalysis: (db: typeof supabase) => Promise<void> }
    const { runAnalysis } = mod
    // Use count: 'exact' + head: true — result is on the `count` property, not `data`
    const { count: currentCount } = await supabase
      .from('outreach_sends')
      .select('*', { count: 'exact', head: true })

    const { data: metaData } = await supabase
      .from('outreach_meta')
      .select('value')
      .eq('key', 'last_analysis_count')
      .single()

    const lastCount = parseInt(metaData?.value ?? '0')
    const total = currentCount ?? 0

    if (Math.floor(total / 100) > Math.floor(lastCount / 100)) {
      console.log(`\n📊 ${total} sends reached — running analysis...\n`)
      await runAnalysis(supabase)
      await supabase
        .from('outreach_meta')
        .update({ value: String(total) })
        .eq('key', 'last_analysis_count')
    }
  } catch (err) {
    console.warn('Analysis not available yet:', err)
  }
}

async function shouldSkipWaValidation(samplePhones: string[]): Promise<boolean> {
  // Test 5 numbers to see if the /contacts endpoint is working
  const sample = samplePhones.slice(0, 5)
  let validCount = 0
  for (const phone of sample) {
    const isWA = await isWhatsAppNumber(phone)
    if (isWA) validCount++
  }
  // If none of the sample are valid, the endpoint is likely broken
  if (validCount === 0 && sample.length > 0) {
    console.warn('⚠️  WA validation returned no valid numbers for sample — disabling validation (sending to all)')
    return true
  }
  return false
}

async function main() {
  if (!isWithinSendWindow()) {
    console.log('Outside Dubai business hours (9am–6pm GST, Mon–Fri). Exiting.')
    process.exit(0)
  }

  const agentsPath = join(process.cwd(), 'scripts/outreach/agents.json')
  const agents: Array<{ name: string; firstName: string; agency: string; whatsapp: string }> =
    JSON.parse(readFileSync(agentsPath, 'utf-8'))

  const optouts = await getOptouts()
  const alreadySent = await getSentPhones()

  const eligible = agents.filter(a => {
    const phone = normalizePhone(`+${a.whatsapp}`)
    if (!phone) return false
    if (optouts.has(phone)) return false
    if (alreadySent.has(phone)) return false
    return true
  })

  console.log(`${eligible.length} eligible agents. Sending up to ${BATCH_SIZE}.`)

  // Determine if WA validation is working
  const samplePhones = eligible.slice(0, 5).map(a => normalizePhone(`+${a.whatsapp}`)!)
  const skipWaValidation = await shouldSkipWaValidation(samplePhones)

  let sent = 0
  let blocked = 0
  const BLOCK_RATE_THRESHOLD = 0.02 // 2%

  for (const agent of eligible.slice(0, BATCH_SIZE)) {
    const phone = normalizePhone(`+${agent.whatsapp}`)!
    const token = generateToken()
    const variant = randomVariant()
    const link = `${BASE_URL}/api/go?t=${token}`

    // Pre-validate: confirm number is on WhatsApp before spending quota
    if (!skipWaValidation) {
      const isWA = await isWhatsAppNumber(phone)
      if (!isWA) {
        console.warn(`[SKIP] ${phone} — not a WhatsApp number`)
        continue
      }
    }

    // Write to DB before sending
    const { error: dbError } = await supabase.from('outreach_sends').insert({
      agent_name: agent.name,
      agency: agent.agency,
      phone,
      variant,
      tracking_token: token,
    })

    if (dbError) {
      console.warn(`DB error for ${phone}: ${dbError.message}`)
      continue
    }

    // Send via approved Marketing Template
    // Template names must match approved names in Meta Business Manager.
    // Each variant maps to its own approved template.
    const templateMap: Record<string, string> = {
      A1: 'enlista_outreach_a1',
      A2: 'enlista_outreach_a2',
      B1: 'enlista_outreach_b1',
      B2: 'enlista_outreach_b2',
    }
    const result = await sendTemplate(phone, templateMap[variant], [agent.firstName, link])

    if (result.success) {
      sent++
      console.log(`[${sent}/${BATCH_SIZE}] ✓ ${agent.firstName} (${variant}) — ${phone}`)
    } else {
      blocked++
      console.warn(`[FAIL] ${phone}: ${result.error}`)
    }

    // Anti-flagging: check block rate after every 10 sends
    if ((sent + blocked) % 10 === 0 && sent + blocked > 0) {
      const blockRate = blocked / (sent + blocked)
      if (blockRate > BLOCK_RATE_THRESHOLD) {
        console.error(`\n🛑 Block rate ${(blockRate * 100).toFixed(1)}% exceeds 2% threshold. Pausing campaign.`)
        process.exit(1)
      }
    }

    // Anti-flagging: randomized delay between sends
    if (sent < BATCH_SIZE) await sleep(randomDelay())
  }

  console.log(`\nDone. Sent: ${sent}, Failed: ${blocked}`)

  await checkAndRunAnalysis()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})

// Suppress unused-import warning — renderVariant is imported for completeness
// but the script uses templateMap + sendTemplate instead of rendering locally.
void renderVariant
