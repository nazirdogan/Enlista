import type { SupabaseClient } from '@supabase/supabase-js'

interface VariantStats {
  variant: string
  sent: number
  replies: number
  clicks: number
  signups: number
  replyRate: string
  clickRate: string
  signupRate: string
}

export async function runAnalysis(supabase: SupabaseClient): Promise<void> {
  // Fetch all data
  const { data: sends } = await supabase.from('outreach_sends').select('id, variant, tracking_token, phone')
  const { data: clicks } = await supabase.from('outreach_clicks').select('tracking_token')
  const { data: replies } = await supabase.from('outreach_replies').select('send_id')
  const { data: signups } = await supabase.from('outreach_signups').select('tracking_token')

  if (!sends || sends.length === 0) {
    console.log('No sends yet.')
    return
  }

  const clickSet = new Set((clicks ?? []).map((c: { tracking_token: string }) => c.tracking_token))
  const replySet = new Set(
    (replies ?? [])
      .filter((r: { send_id: string | null }) => r.send_id)
      .map((r: { send_id: string }) => r.send_id)
  )
  const signupSet = new Set((signups ?? []).map((s: { tracking_token: string }) => s.tracking_token))

  const stats: Record<string, { sent: number; replies: number; clicks: number; signups: number }> = {
    A1: { sent: 0, replies: 0, clicks: 0, signups: 0 },
    A2: { sent: 0, replies: 0, clicks: 0, signups: 0 },
    B1: { sent: 0, replies: 0, clicks: 0, signups: 0 },
    B2: { sent: 0, replies: 0, clicks: 0, signups: 0 },
  }

  for (const send of sends) {
    const s = stats[send.variant]
    if (!s) continue
    s.sent++
    if (clickSet.has(send.tracking_token)) s.clicks++
    if (replySet.has(send.id)) s.replies++
    if (signupSet.has(send.tracking_token)) s.signups++
  }

  // Sort by signup rate desc — sort on raw numbers before formatting
  const rawSignupRate = (s: { sent: number; signups: number }) =>
    s.sent > 0 ? s.signups / s.sent : 0

  const variantOrder = Object.entries(stats)
    .sort(([, a], [, b]) => rawSignupRate(b) - rawSignupRate(a))
    .map(([v]) => v)

  const rows: VariantStats[] = Object.entries(stats).map(([variant, s]) => ({
    variant,
    ...s,
    replyRate: s.sent > 0 ? `${((s.replies / s.sent) * 100).toFixed(1)}%` : '—',
    clickRate: s.sent > 0 ? `${((s.clicks / s.sent) * 100).toFixed(1)}%` : '—',
    signupRate: s.sent > 0 ? `${((s.signups / s.sent) * 100).toFixed(1)}%` : '—',
  }))

  rows.sort((a, b) => variantOrder.indexOf(a.variant) - variantOrder.indexOf(b.variant))

  const total = sends.length
  const cohort = Math.floor(total / 100)

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`  ENLISTA OUTREACH ANALYSIS — Cohort ${cohort} (${total} total sends)`)
  console.log(`${'─'.repeat(60)}`)
  console.log(`  ${'Variant'.padEnd(8)} ${'Sent'.padEnd(6)} ${'Replies'.padEnd(9)} ${'Clicks'.padEnd(8)} ${'Signups'.padEnd(9)} Reply%  Click%  Signup%`)
  console.log(`  ${'─'.repeat(58)}`)

  for (const r of rows) {
    console.log(
      `  ${r.variant.padEnd(8)} ${String(r.sent).padEnd(6)} ${String(r.replies).padEnd(9)} ${String(r.clicks).padEnd(8)} ${String(r.signups).padEnd(9)} ${r.replyRate.padEnd(8)} ${r.clickRate.padEnd(8)} ${r.signupRate}`
    )
  }

  console.log(`${'─'.repeat(60)}`)

  const winner = rows[0]
  const loser = rows[rows.length - 1]

  console.log(`\n  🏆 Leader: ${winner.variant} (${winner.signupRate} signup rate)`)

  if (total >= 200) {
    const winnerPct = parseFloat(winner.signupRate)
    const loserPct = parseFloat(loser.signupRate)
    if (winnerPct > 0 && loserPct < winnerPct / 2) {
      console.log(`  ⚠️  Consider pausing ${loser.variant} — signup rate is less than half of leader`)
    }
  } else {
    console.log(`  ℹ️  Directional data only — need ${200 - total} more sends for reliable comparison`)
  }

  console.log()

  // Save report
  const { writeFileSync, mkdirSync } = await import('fs')
  const { join } = await import('path')
  const date = new Date().toISOString().slice(0, 10)
  const dir = join(process.cwd(), 'docs/outreach/reports')
  mkdirSync(dir, { recursive: true })
  const reportPath = join(dir, `${date}-cohort-${cohort}.md`)
  const report = [
    `# Outreach Analysis — Cohort ${cohort}`,
    `**Date:** ${date}`,
    `**Total sends:** ${total}`,
    '',
    '| Variant | Sent | Replies | Clicks | Signups | Reply% | Click% | Signup% |',
    '|---|---|---|---|---|---|---|---|',
    ...rows.map(r => `| ${r.variant} | ${r.sent} | ${r.replies} | ${r.clicks} | ${r.signups} | ${r.replyRate} | ${r.clickRate} | ${r.signupRate} |`),
    '',
    `**Leader:** ${winner.variant} — ${winner.signupRate} signup rate`,
  ].join('\n')
  writeFileSync(reportPath, report)
  console.log(`  Report saved to ${reportPath}\n`)
}
