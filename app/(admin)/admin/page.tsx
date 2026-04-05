import { requireAdmin, AdminAuthError } from '@/lib/admin/auth'
import { getOverviewKpis, getSignupTrend } from '@/lib/admin/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { KpiCard } from '@/components/admin/KpiCard'
import { BarChart } from '@/components/admin/BarChart'
import { DonutChart } from '@/components/admin/DonutChart'
import { ChartModal } from '@/components/admin/ChartModal'
import { redirect } from 'next/navigation'

export default async function AdminOverviewPage() {
  try {
    await requireAdmin()
  } catch (e) {
    if (e instanceof AdminAuthError) redirect('/auth')
  }

  const [kpis, trend] = await Promise.all([getOverviewKpis(), getSignupTrend(6)])

  const db = createAdminClient()
  const { data: subData } = await db.from('subscriptions').select('plan').eq('status', 'active')
  const planCounts = (subData ?? []).reduce((acc: Record<string, number>, s) => {
    acc[s.plan] = (acc[s.plan] ?? 0) + 1
    return acc
  }, {})

  return (
    <div>
      <div className="bg-white px-6 py-3.5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <div className="text-[15px] font-bold text-gray-900">Overview</div>
          <div className="text-[11px] text-gray-400">Last updated: just now</div>
        </div>
        <div className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2.5 py-1 rounded-full">🟢 All systems live</div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-4 gap-3.5 mb-5">
          <KpiCard label="Total Signups" value={String(kpis.totalSignups)} delta="Active now" deltaType="up" />
          <KpiCard label="MRR" value={`AED ${kpis.mrr.toLocaleString()}`} deltaType="up" />
          <KpiCard label="Trial → Paid" value={`${kpis.conversionRate}%`} deltaType="neutral" />
          <KpiCard label="Active Trials" value={String(kpis.activeTrials)} delta={`${kpis.trialsExpiringIn3Days} expiring soon`} deltaType="neutral" />
          <KpiCard label="Listings Generated" value={kpis.totalListings.toLocaleString()} deltaType="up" />
          <KpiCard label="Avg LTV" value={`AED ${kpis.avgLtv.toLocaleString()}`} deltaType="up" />
        </div>

        <div className="grid grid-cols-3 gap-3.5 mb-5">
          <div className="col-span-2 bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xs font-semibold text-gray-700 mb-3">Signups — Last 6 Months</div>
            <ChartModal title="Signups — Last 6 Months" expandedContent={<BarChart data={trend} xKey="month" yKey="signups" height={300} />}>
              <BarChart data={trend} xKey="month" yKey="signups" height={120} />
            </ChartModal>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-xs font-semibold text-gray-700 mb-3">Plan Distribution</div>
            <ChartModal title="Plan Distribution">
              <DonutChart data={[
                { name: 'Agency', value: planCounts.agency ?? 0 },
                { name: 'Boutique', value: planCounts.boutique ?? 0 },
                { name: 'Solo', value: planCounts.solo ?? 0 },
                { name: 'Trial', value: kpis.activeTrials },
              ]} height={120} />
            </ChartModal>
          </div>
        </div>

        {kpis.trialsExpiringIn3Days > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="text-sm font-semibold text-amber-900">
              ⚠️ {kpis.trialsExpiringIn3Days} trial{kpis.trialsExpiringIn3Days > 1 ? 's' : ''} expiring in the next 3 days
            </div>
            <div className="text-xs text-amber-700 mt-1">Visit Users page to see who needs a nudge.</div>
          </div>
        )}
      </div>
    </div>
  )
}
