import { requireAdmin, AdminAuthError } from '@/lib/admin/auth'
import { getSubscriptions } from '@/lib/admin/queries'
import { KpiCard } from '@/components/admin/KpiCard'
import { ChartPlaceholder } from '@/components/admin/ChartPlaceholder'
import { ExportButton } from '@/components/admin/ExportButton'
import { redirect } from 'next/navigation'

export default async function AdminSubscriptionsPage() {
  try { await requireAdmin() } catch (e) { if (e instanceof AdminAuthError) redirect('/auth') }

  const all = await getSubscriptions('all')
  const active = all.filter(s => s.status === 'active')
  const mrr = active.reduce((sum, s) => sum + (s.plan_amount ?? 0), 0)
  const arr = mrr * 12
  const avgLtv = active.length > 0 ? Math.round(mrr * 6 / active.length) : 0
  const cancelled = all.filter(s => s.status === 'cancelled').length
  const churnRate = all.length > 0 ? ((cancelled / all.length) * 100).toFixed(1) : '0'

  const planBreakdown = ['solo', 'boutique', 'agency'].map(plan => ({
    plan,
    count: active.filter(s => s.plan === plan).length,
    mrr: active.filter(s => s.plan === plan).reduce((sum, s) => sum + (s.plan_amount ?? 0), 0),
  }))

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-emerald-100 text-emerald-700',
      trialing: 'bg-amber-100 text-amber-700',
      past_due: 'bg-red-100 text-red-600',
      cancelled: 'bg-gray-100 text-gray-500',
    }
    return map[status] ?? 'bg-gray-100 text-gray-500'
  }

  return (
    <div>
      <div className="bg-white px-6 py-3.5 border-b border-gray-200">
        <div className="text-[15px] font-bold text-gray-900">Subscriptions</div>
        <div className="text-[11px] text-gray-400">Synced from Stripe · live</div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-5 gap-3 mb-5">
          <KpiCard label="MRR" value={`AED ${mrr.toLocaleString()}`} deltaType="up" />
          <KpiCard label="ARR" value={`AED ${arr.toLocaleString()}`} deltaType="up" />
          <KpiCard label="Avg LTV" value={`AED ${avgLtv.toLocaleString()}`} deltaType="up" />
          <KpiCard label="Churn Rate" value={`${churnRate}%`} deltaType="down" />
          <KpiCard label="Active Paying" value={String(active.length)} deltaType="up" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs font-semibold text-gray-700 mb-3">MRR Growth</div>
            <ChartPlaceholder height={120} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs font-semibold text-gray-700 mb-3">Plan Breakdown</div>
            {planBreakdown.map(p => (
              <div key={p.plan} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="text-xs font-semibold capitalize text-gray-900">{p.plan}</div>
                  <div className="text-[9px] text-gray-400">{p.count} users</div>
                </div>
                <div className="text-xs font-bold text-indigo-600">AED {p.mrr.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <div className="text-xs font-semibold text-gray-700 flex-1">All Subscriptions</div>
            <ExportButton section="subscriptions" />
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {['Agency', 'Plan', 'Status', 'Started', 'Renewal', 'LTV'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] text-gray-400 uppercase tracking-wide border-b border-gray-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(all as Array<typeof all[0] & { agencies?: { name?: string } | null }>).map(sub => (
                <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-900">{sub.agencies?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-xs capitalize text-gray-600">{sub.plan}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusBadge(sub.status)}`}>{sub.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{sub.started_at ? new Date(sub.started_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {sub.current_period_end ? new Date(sub.current_period_end).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-indigo-600">
                    AED {((sub.plan_amount ?? 0) * Math.max(1, Math.floor((Date.now() - new Date(sub.started_at ?? '').getTime()) / 2592000000))).toLocaleString()}
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
