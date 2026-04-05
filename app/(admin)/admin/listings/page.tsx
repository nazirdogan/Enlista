import { requireAdmin, AdminAuthError } from '@/lib/admin/auth'
import { getListingsStats } from '@/lib/admin/queries'
import { KpiCard } from '@/components/admin/KpiCard'
import { ChartPlaceholder } from '@/components/admin/ChartPlaceholder'
import { ExportButton } from '@/components/admin/ExportButton'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export default async function AdminListingsPage() {
  try { await requireAdmin() } catch (e) { if (e instanceof AdminAuthError) redirect('/auth') }

  const stats = await getListingsStats()
  const db = createAdminClient()

  const { data: topAgencies } = await db
    .from('agencies')
    .select('id, name, listings(id, created_at)')
    .order('created_at', { ascending: false })

  const ranked = (topAgencies ?? [])
    .map(a => ({ ...a, count: (a.listings as unknown[] | null)?.length ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const publishRate = stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0
  const hoursSaved = Math.round(stats.total * (40 / 60))

  const topCommunity = Object.entries(
    (stats.listings as Array<{ community?: string | null }>).reduce((acc: Record<string, number>, l) => {
      if (l.community) acc[l.community] = (acc[l.community] ?? 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  const avgPerUser = ranked.length > 0 ? (stats.total / ranked.length).toFixed(1) : '0'

  return (
    <div>
      <div className="bg-white px-6 py-3.5 border-b border-gray-200 flex items-center justify-between">
        <div>
          <div className="text-[15px] font-bold text-gray-900">Listings</div>
          <div className="text-[11px] text-gray-400">All AI-generated listings across every agency</div>
        </div>
        <ExportButton section="listings" />
      </div>

      <div className="p-6">
        <div className="grid grid-cols-5 gap-3 mb-5">
          <KpiCard label="Total Generated" value={stats.total.toLocaleString()} deltaType="up" />
          <KpiCard label="Avg per User" value={avgPerUser} deltaType="up" />
          <KpiCard label="Publish Rate" value={`${publishRate}%`} deltaType="neutral" />
          <KpiCard label="Hours Saved" value={`${hoursSaved}h`} deltaType="neutral" />
          <KpiCard label="Top Community" value={topCommunity} deltaType="neutral" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs font-semibold text-gray-700 mb-3">By Property Type</div>
            {Object.entries(stats.byType).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([type, count]) => (
              <div key={type} className="flex items-center gap-2 mb-2">
                <div className="text-xs text-gray-600 w-24 capitalize">{type}</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-indigo-500 rounded-full" style={{ width: `${stats.total > 0 ? Math.round((count as number) / stats.total * 100) : 0}%` }} />
                </div>
                <div className="text-xs text-gray-500 w-8 text-right">{count as number}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs font-semibold text-gray-700 mb-3">By Tone</div>
            {Object.entries(stats.byTone).map(([tone, count]) => (
              <div key={tone} className="flex items-center gap-2 mb-2">
                <div className="text-xs text-gray-600 w-24 capitalize">{tone}</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full">
                  <div className="h-2 bg-violet-500 rounded-full" style={{ width: `${stats.total > 0 ? Math.round((count as number) / stats.total * 100) : 0}%` }} />
                </div>
                <div className="text-xs text-gray-500 w-8 text-right">{count as number}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-xs font-semibold text-gray-700 mb-3">Monthly Trend</div>
            <ChartPlaceholder height={120} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 text-xs font-semibold text-gray-700">Top Agencies by Listings</div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {['#', 'Agency', 'Listings', 'Last Generated'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] text-gray-400 uppercase tracking-wide border-b border-gray-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ranked.map((a, i) => (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs font-bold text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-gray-900">{a.name}</td>
                  <td className="px-4 py-3 text-xs font-bold text-gray-900">{a.count}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {(a.listings as Array<{ created_at: string }> | null)?.[0]
                      ? new Date(Math.max(...(a.listings as Array<{ created_at: string }>).map(l => new Date(l.created_at).getTime()))).toLocaleDateString()
                      : '—'}
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
