import { createClient } from '@/lib/supabase/server'
import { Listing } from '@/types/database'
import { PageHeading, BentoCard } from '@/components/ui'

function monthLabel(date: Date) {
  return date.toLocaleString('en-AE', { month: 'short', year: '2-digit' })
}

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: rawListings } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .order('created_at', { ascending: false })

  const listings = (rawListings as Listing[]) ?? []
  const total = listings.length

  // By type
  const typeCounts: Record<string, number> = {}
  listings.forEach((l) => {
    typeCounts[l.property_type] = (typeCounts[l.property_type] ?? 0) + 1
  })
  const maxTypeCount = Math.max(...Object.values(typeCounts), 1)

  // Most used community
  const communityCounts: Record<string, number> = {}
  listings.forEach((l) => {
    if (l.community) communityCounts[l.community] = (communityCounts[l.community] ?? 0) + 1
  })
  const topCommunity = Object.entries(communityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'

  // Last 6 months
  const months: { label: string; count: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const label = monthLabel(d)
    const count = listings.filter((l) => {
      const ld = new Date(l.created_at)
      return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear()
    }).length
    months.push({ label, count })
  }
  const maxMonthCount = Math.max(...months.map((m) => m.count), 1)

  // Time saved
  const hoursSaved = Math.round((total * 40) / 60)

  return (
    <div>
      <PageHeading
        title="Analytics"
        subtitle="Real data from your Enlista account."
      />

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }} className="md:grid-cols-4">
        {[
          { label: 'Total Listings', value: total },
          { label: 'Published', value: listings.filter((l) => l.status === 'published').length },
          { label: 'Top Community', value: topCommunity },
          { label: 'Hours Saved', value: `~${hoursSaved}h` },
        ].map((stat) => (
          <BentoCard key={stat.label}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#0F1829', fontFamily: '"JetBrains Mono", monospace', lineHeight: 1, marginBottom: 8 }}>
              {stat.value}
            </div>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{stat.label}</p>
          </BentoCard>
        ))}
      </div>

      {/* Listings by month */}
      <BentoCard style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: '#0F1829', margin: '0 0 20px 0' }}>
          Listings per Month
        </h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100 }}>
          {months.map((m) => (
            <div key={m.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
              <span style={{ fontSize: 11, color: '#64748B' }}>{m.count}</span>
              <div
                style={{
                  width: '100%', background: '#1D4ED8', borderRadius: 4,
                  height: `${(m.count / maxMonthCount) * 64 + 4}px`, minHeight: 4,
                }}
              />
              <span style={{ fontSize: 11, color: '#64748B' }}>{m.label}</span>
            </div>
          ))}
        </div>
      </BentoCard>

      {/* Property type breakdown */}
      <BentoCard style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 700, fontSize: 16, color: '#0F1829', margin: 0, marginBottom: 20 }}>
          By Property Type
        </h2>
        {Object.entries(typeCounts).length === 0 ? (
          <p style={{ fontSize: 14, color: '#64748B' }}>No data yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Object.entries(typeCounts)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#64748B', width: 80, flexShrink: 0, textTransform: 'capitalize' }}>
                    {type}
                  </span>
                  <div style={{ flex: 1, background: '#F1F5F9', borderRadius: 4, height: 8 }}>
                    <div
                      style={{ background: '#1D4ED8', borderRadius: 4, height: 8, width: `${(count / maxTypeCount) * 100}%` }}
                    />
                  </div>
                  <span style={{ fontSize: 12, color: '#64748B', width: 20, textAlign: 'right' }}>{count}</span>
                </div>
              ))}
          </div>
        )}
      </BentoCard>

      {/* Time saved */}
      <BentoCard style={{ background: '#0F1829', textAlign: 'center', padding: 40 }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Estimated Time Saved</p>
        <span style={{ fontSize: 64, fontWeight: 800, color: '#3B82F6', fontFamily: '"JetBrains Mono", monospace', lineHeight: 1 }}>
          ~{hoursSaved}h
        </span>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>
          Based on {total} listing{total !== 1 ? 's' : ''} × 40 minutes saved per listing
        </p>
      </BentoCard>
    </div>
  )
}
