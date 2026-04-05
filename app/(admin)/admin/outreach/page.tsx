import { requireAdmin, AdminAuthError } from '@/lib/admin/auth'
import { getOutreachStats } from '@/lib/admin/queries'
import { getMetaAdsSpend } from '@/lib/admin/meta-ads'
import { KpiCard } from '@/components/admin/KpiCard'
import { ExportButton } from '@/components/admin/ExportButton'
import { redirect } from 'next/navigation'

const VARIANTS = ['A1', 'A2', 'B1', 'B2'] as const
const VARIANT_ANGLES: Record<string, string> = { A1: 'Pain point', A2: 'Social proof', B1: 'Direct offer', B2: 'Speed/efficiency' }

type Send = { id: string; variant: string; sent_at: string; agent_name: string; agency: string; phone: string; tracking_token: string }
type Click = { id: string; tracking_token: string; clicked_at: string }
type Reply = { id: string; send_id: string; replied_at: string }
type Signup = { id: string; tracking_token: string; signed_up_at: string }

export default async function AdminOutreachPage() {
  try { await requireAdmin() } catch (e) { if (e instanceof AdminAuthError) redirect('/auth') }

  const month = new Date().toISOString().slice(0, 7)
  const [outreach, spend] = await Promise.all([getOutreachStats(), getMetaAdsSpend(month)])

  const sends = outreach.sends as Send[]
  const clicks = outreach.clicks as Click[]
  const replies = outreach.replies as Reply[]
  const signups = outreach.signups as Signup[]

  const clickRate = sends.length > 0 ? ((clicks.length / sends.length) * 100).toFixed(1) : '0'
  const replyRate = sends.length > 0 ? ((replies.length / sends.length) * 100).toFixed(1) : '0'
  const signupRate = sends.length > 0 ? ((signups.length / sends.length) * 100).toFixed(1) : '0'
  const costPerSignup = signups.length > 0 ? (spend.total / signups.length).toFixed(2) : '0'
  const costPerClick = clicks.length > 0 ? (spend.total / clicks.length).toFixed(2) : '0'

  const variantStats = VARIANTS.map(v => {
    const vSends = sends.filter(s => s.variant === v)
    const vTokens = new Set(vSends.map(s => s.tracking_token))
    const vClicks = clicks.filter(c => vTokens.has(c.tracking_token))
    const vSignups = signups.filter(s => vTokens.has(s.tracking_token))
    const vReplies = replies.filter(r => vSends.some(s => s.id === r.send_id))
    return {
      variant: v,
      sent: vSends.length,
      clicks: vClicks.length,
      replies: vReplies.length,
      signups: vSignups.length,
      signupRate: vSends.length > 0 ? ((vSignups.length / vSends.length) * 100).toFixed(1) : '0',
    }
  })

  const winner = [...variantStats].sort((a, b) => parseFloat(b.signupRate) - parseFloat(a.signupRate))[0]

  const attributedMrr = Math.round(signups.length * 0.18 * 399)
  const roas = spend.total > 0 ? (attributedMrr / spend.total).toFixed(1) : '0'

  const contacts = sends.slice(0, 50).map(s => {
    const clicked = clicks.some(c => c.tracking_token === s.tracking_token)
    const replied = replies.some(r => r.send_id === s.id)
    const signedup = signups.some(sg => sg.tracking_token === s.tracking_token)
    const status = signedup ? 'signed-up' : replied ? 'replied' : clicked ? 'clicked' : 'sent'
    return { ...s, status }
  })

  const statusBadge: Record<string, string> = {
    'signed-up': 'bg-purple-100 text-purple-700',
    replied: 'bg-emerald-100 text-emerald-700',
    clicked: 'bg-blue-100 text-blue-700',
    sent: 'bg-gray-100 text-gray-500',
  }

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 8) return phone
    return phone.slice(0, 6) + ' ••• ••' + phone.slice(-2)
  }

  return (
    <div>
      <div className="bg-white px-6 py-3.5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <div className="text-[15px] font-bold text-gray-900">Outreach</div>
          <div className="text-[11px] text-gray-400">WhatsApp campaign · Meta Ads API synced</div>
        </div>
        <div className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-semibold">🟢 Meta synced</div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-6 gap-3 mb-5">
          <KpiCard label="Total Sent" value={sends.length.toLocaleString()} deltaType="up" />
          <KpiCard label="Clicks" value={clicks.length.toString()} delta={`${clickRate}% rate`} deltaType="up" />
          <KpiCard label="Replies" value={replies.length.toString()} delta={`${replyRate}% rate`} deltaType="up" />
          <KpiCard label="Signups" value={signups.length.toString()} delta={`${signupRate}% rate`} deltaType="up" />
          <KpiCard label="Ad Spend" value={`AED ${spend.total.toLocaleString()}`} deltaType="neutral" />
          <KpiCard label="ROAS" value={`${roas}×`} deltaType="up" />
        </div>

        <div className="text-xs font-semibold text-gray-700 mb-3">A/B Variant Performance</div>
        <div className="grid grid-cols-4 gap-3 mb-5">
          {variantStats.map(v => (
            <div key={v.variant} className={`bg-white rounded-xl p-4 border-2 ${v.variant === winner?.variant ? 'border-indigo-400' : 'border-gray-200'} relative`}>
              {v.variant === winner?.variant && (
                <div className="absolute top-0 right-3 bg-indigo-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-b-md">🏆 WINNER</div>
              )}
              <div className="text-sm font-black text-gray-900 mb-0.5">{v.variant}</div>
              <div className="text-[10px] text-gray-400 mb-3">{VARIANT_ANGLES[v.variant]}</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Sent', value: v.sent },
                  { label: 'Signups', value: `${v.signups} (${v.signupRate}%)` },
                  { label: 'Clicks', value: v.clicks },
                  { label: 'Replies', value: v.replies },
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="text-[9px] text-gray-400 uppercase">{stat.label}</div>
                    <div className="text-sm font-bold text-gray-900">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs font-semibold text-gray-700 mb-3">Ad Spend Breakdown <span className="text-gray-400 font-normal">· Meta Ads API</span></div>
            {[
              { label: 'WhatsApp template costs', value: `AED ${spend.templateCost.toLocaleString()}` },
              { label: 'Meta Ads campaign spend', value: `AED ${spend.campaignSpend.toLocaleString()}` },
              { label: 'Total spend', value: `AED ${spend.total.toLocaleString()}` },
              { label: 'Cost per click', value: `AED ${costPerClick}` },
              { label: 'Cost per signup', value: `AED ${costPerSignup}` },
              { label: 'Attributed MRR', value: `AED ${attributedMrr.toLocaleString()}`, highlight: true },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-xs">
                <span className="text-gray-500">{row.label}</span>
                <span className={`font-bold ${row.highlight ? 'text-indigo-600' : 'text-gray-900'}`}>{row.value}</span>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs font-semibold text-gray-700 mb-2">ROAS</div>
            <div className="text-5xl font-black text-indigo-600 leading-none mb-1">{roas}×</div>
            <div className="text-xs text-gray-400 mb-4">For every AED 1 spent, AED {roas} in subscription revenue</div>
            {[
              { label: 'Signups attributed', value: signups.length },
              { label: 'Converted to paid (est.)', value: Math.round(signups.length * 0.18) },
              { label: 'Total outreach MRR', value: `AED ${attributedMrr.toLocaleString()}` },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-gray-400">{row.label}</span>
                <span className="font-semibold text-gray-900">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <div className="text-xs font-semibold text-gray-700 flex-1">Contacts</div>
            <ExportButton section="outreach" />
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {['Contact', 'Phone', 'Variant', 'Sent', 'Status'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] text-gray-400 uppercase tracking-wide border-b border-gray-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contacts.map(c => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold text-gray-900">{c.agent_name}</div>
                    <div className="text-[10px] text-gray-400">{c.agency}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{maskPhone(c.phone)}</td>
                  <td className="px-4 py-3">
                    <span className="text-[9px] font-black bg-[#1a1a2e] text-white px-1.5 py-0.5 rounded">{c.variant}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(c.sent_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusBadge[c.status] ?? 'bg-gray-100 text-gray-500'}`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
