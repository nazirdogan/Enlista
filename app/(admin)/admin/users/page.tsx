import { requireAdmin, AdminAuthError } from '@/lib/admin/auth'
import { getAllUsers } from '@/lib/admin/queries'
import { ExportButton } from '@/components/admin/ExportButton'
import Link from 'next/link'
import { redirect } from 'next/navigation'

function lastActiveBadge(listings: Array<{ created_at: string }>) {
  if (!listings?.length) return { label: 'Never', color: 'text-red-500' }
  const last = new Date(Math.max(...listings.map(l => new Date(l.created_at).getTime())))
  const days = Math.floor((Date.now() - last.getTime()) / 86400000)
  if (days < 3) return { label: days === 0 ? 'Today' : `${days}d ago`, color: 'text-emerald-600' }
  if (days < 14) return { label: `${days}d ago`, color: 'text-amber-500' }
  return { label: `${days}d ago`, color: 'text-red-500' }
}

export default async function AdminUsersPage() {
  try { await requireAdmin() } catch (e) { if (e instanceof AdminAuthError) redirect('/auth') }

  const users = await getAllUsers()
  const total = users.length

  return (
    <div>
      <div className="bg-white px-6 py-3.5 border-b border-gray-200">
        <div className="text-[15px] font-bold text-gray-900">Users</div>
        <div className="text-[11px] text-gray-400">{total} total</div>
      </div>

      <div className="p-6">
        <div className="flex gap-3.5 mb-4 flex-wrap items-center">
          {[
            { label: 'Total Signups', value: total },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <div className="text-lg font-bold text-gray-900">{s.value}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide">{s.label}</div>
            </div>
          ))}
          <ExportButton section="users" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                {['Agency', 'Location', 'Signed Up', 'Listings', 'Last Active'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[10px] text-gray-400 uppercase tracking-wide border-b border-gray-100">{h}</th>
                ))}
                <th className="px-4 py-2.5 border-b border-gray-100" />
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const la = lastActiveBadge((user.listings as Array<{ created_at: string }> | null) ?? [])
                return (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 text-xs">{user.name}</div>
                      <div className="text-[10px] text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{user.city ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-700">
                      {(user.listings as Array<unknown> | null)?.length ?? 0}
                    </td>
                    <td className={`px-4 py-3 text-xs font-medium ${la.color}`}>{la.label}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${user.id}`} className="text-[10px] border border-gray-200 rounded-md px-2 py-1 text-gray-500 hover:bg-gray-50">
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
