import { requireAdmin, AdminAuthError } from '@/lib/admin/auth'
import { getEmailStats } from '@/lib/admin/queries'
import { KpiCard } from '@/components/admin/KpiCard'
import { ExportButton } from '@/components/admin/ExportButton'
import { redirect } from 'next/navigation'

const EMAIL_TYPES = ['welcome', 'trial_expiry', 'payment_failed', 'subscription_confirmed'] as const

type EmailEvent = {
  id: string
  email_type: string
  recipient: string
  status: string
  sent_at: string
  agencies?: { name?: string } | null
}

export default async function AdminEmailsPage() {
  try { await requireAdmin() } catch (e) { if (e instanceof AdminAuthError) redirect('/auth') }

  const events = await getEmailStats() as EmailEvent[]

  const resendConnected = !!process.env.RESEND_API_KEY
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const recent = events.filter(e => new Date(e.sent_at) > thirtyDaysAgo)
  const delivered = recent.filter(e => e.status === 'delivered').length
  const bounced = recent.filter(e => e.status === 'bounced').length
  const complained = recent.filter(e => e.status === 'complained').length
  const deliveryRate = recent.length > 0 ? ((delivered / recent.length) * 100).toFixed(1) : '100'

  const byType = EMAIL_TYPES.map(type => {
    const typeEvents = events.filter(e => e.email_type === type)
    const typeDelivered = typeEvents.filter(e => e.status === 'delivered').length
    const typeBounced = typeEvents.filter(e => e.status === 'bounced').length
    return { type, total: typeEvents.length, delivered: typeDelivered, bounced: typeBounced }
  })

  const typeLabels: Record<string, string> = {
    welcome: 'Welcome Email',
    trial_expiry: 'Trial Expiry Warning',
    payment_failed: 'Payment Failed',
    subscription_confirmed: 'Subscription Confirmed',
  }

  const statusBadge = (status: string) => {
    if (status === 'delivered') return 'bg-emerald-100 text-emerald-700'
    if (status === 'bounced') return 'bg-red-100 text-red-600'
    if (status === 'complained') return 'bg-orange-100 text-orange-600'
    return 'bg-gray-100 text-gray-500'
  }

  return (
    <div>
      <div className="bg-white px-6 py-3.5 border-b border-gray-200">
        <div className="text-[15px] font-bold text-gray-900">Emails</div>
        <div className="text-[11px] text-gray-400">Transactional email delivery via Resend</div>
      </div>

      <div className="p-6">
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl mb-5 text-xs font-medium ${resendConnected ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          <span>{resendConnected ? '🟢' : '🔴'}</span>
          <span>{resendConnected ? 'Resend connected · API key active' : 'Resend not connected — set RESEND_API_KEY'}</span>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
          <KpiCard label="Emails Sent (30d)" value={recent.length.toString()} deltaType="neutral" />
          <KpiCard label="Delivery Rate" value={`${deliveryRate}%`} deltaType="up" />
          <KpiCard label="Bounced" value={String(bounced)} delta={bounced > 0 ? 'Check these' : 'Clean'} deltaType={bounced > 0 ? 'down' : 'up'} />
          <KpiCard label="Spam Complaints" value={String(complained)} deltaType={complained > 0 ? 'down' : 'up'} />
        </div>

        <div className="grid grid-cols-4 gap-4 mb-5">
          {byType.map(t => (
            <div key={t.type} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="text-xs font-bold text-gray-900">{typeLabels[t.type]}</div>
                <div className="text-[10px] text-gray-400">{t.total} sent</div>
              </div>
              {[
                { label: 'Delivered', value: `${t.delivered} (${t.total > 0 ? Math.round(t.delivered / t.total * 100) : 100}%)`, ok: true },
                { label: 'Bounced', value: t.bounced, ok: t.bounced === 0 },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0 text-xs">
                  <span className="text-gray-500">{row.label}</span>
                  <span className={`font-bold ${row.ok ? 'text-emerald-600' : 'text-red-500'}`}>{row.value}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <div className="text-xs font-semibold text-gray-700 flex-1">Email Log</div>
            <ExportButton section="emails" />
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {['Recipient', 'Type', 'Status', 'Sent'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] text-gray-400 uppercase tracking-wide border-b border-gray-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.slice(0, 50).map(e => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold text-gray-900">{e.agencies?.name ?? '—'}</div>
                    <div className="text-[10px] text-indigo-500">{e.recipient}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 capitalize">{e.email_type?.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusBadge(e.status)}`}>{e.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(e.sent_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
