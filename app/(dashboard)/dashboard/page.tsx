import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Listing } from '@/types/database'
import { BentoCard, PageHeading, StatusBadge, Badge } from '@/components/ui'

function formatPrice(price: number) {
  return `AED ${price.toLocaleString()}`
}

function formatSpecs(listing: Listing) {
  const parts: string[] = []
  if (listing.bedrooms) parts.push(`${listing.bedrooms} Bed`)
  if (listing.bathrooms) parts.push(`${listing.bathrooms} Bath`)
  if (listing.size_sqft) parts.push(`${listing.size_sqft.toLocaleString()} sqft`)
  if (listing.community) parts.push(listing.community)
  return parts.join(' · ')
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('user_id', user?.id ?? '')
    .order('created_at', { ascending: false })
    .limit(10)

  const { count: totalCount } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user?.id ?? '')

  const allListings = listings as Listing[] | null

  const publishedCount = allListings?.filter(l => l.status === 'published').length ?? 0

  const isEmpty = !allListings || allListings.length === 0

  // Real monthly listing counts — last 7 months
  const months: { label: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const label = d.toLocaleString('en-AE', { month: 'short' })
    const count = (allListings ?? []).filter((l) => {
      const ld = new Date(l.created_at)
      return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear()
    }).length
    months.push({ label, count })
  }
  const maxMonthCount = Math.max(...months.map((m) => m.count), 1)

  return (
    <div>
      <PageHeading
        title="Dashboard"
        subtitle="Your listing activity at a glance"
        action={
          <Link href="/new" style={{
            background: '#1D4ED8', color: 'white', padding: '10px 20px',
            borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            + New Listing
          </Link>
        }
      />

      {/* Stat row */}
      <div style={{ display: 'grid', gap: 16, marginBottom: 24 }} className="grid-cols-1 sm:grid-cols-2">
        {/* Total Listings */}
        <BentoCard>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Total Listings</p>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <span style={{ fontSize: 40, fontWeight: 800, color: '#0F1829', lineHeight: 1, fontFamily: '"JetBrains Mono", monospace' }}>{totalCount ?? 0}</span>
            <Badge variant="green" style={{ marginBottom: 4 }}>+18%</Badge>
          </div>
        </BentoCard>

        {/* Published */}
        <BentoCard>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Published</p>
          <span style={{ fontSize: 40, fontWeight: 800, color: '#0F1829', lineHeight: 1, fontFamily: '"JetBrains Mono", monospace' }}>{publishedCount}</span>
        </BentoCard>
      </div>

      {/* Chart card */}
      <BentoCard style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, color: '#0F1829', margin: 0 }}>Listing Activity</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
          {months.map((m, i) => (
            <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: '100%',
                height: `${(m.count / maxMonthCount) * 64 + 4}px`,
                background: i === months.length - 1 ? '#1D4ED8' : 'rgba(59,130,246,0.3)',
                borderRadius: 4,
                minHeight: 4,
              }} />
              <span style={{ fontSize: 10, color: '#94A3B8' }}>{m.label}</span>
            </div>
          ))}
        </div>
      </BentoCard>

      {/* Recent listings */}
      <BentoCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, color: '#0F1829', margin: 0 }}>Recent Listings</h2>
          <Link href="/listings" style={{ color: '#1D4ED8', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
            View All →
          </Link>
        </div>

        {isEmpty ? (
          <div style={{
            border: '2px dashed #DDE3EC', borderRadius: 10, padding: '48px 24px',
            textAlign: 'center',
          }}>
            <p style={{ color: '#64748B', fontSize: 16, marginBottom: 8 }}>No listings yet</p>
            <p style={{ color: '#94A3B8', fontSize: 14, marginBottom: 20 }}>Create your first bilingual property listing in 30 seconds.</p>
            <Link href="/new" style={{
              background: '#1D4ED8', color: 'white', padding: '10px 24px',
              borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600,
            }}>
              Create First Listing
            </Link>
          </div>
        ) : (
          <div>
            {allListings.map((listing, idx) => (
              <div key={listing.id} style={{
                padding: '16px 0',
                borderTop: idx === 0 ? 'none' : '1px solid #DDE3EC',
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link href={`/listings/${listing.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontWeight: 600, fontSize: 15, color: '#0F1829', margin: 0, marginBottom: 4 }}>
                      {listing.building_name
                        ? `${listing.building_name}, ${listing.community || ''}`
                        : listing.community || listing.property_type}
                    </h3>
                  </Link>
                  <p style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                    {formatSpecs(listing)}
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>
                    {formatPrice(listing.price_aed)}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <StatusBadge status={listing.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </BentoCard>
    </div>
  )
}
