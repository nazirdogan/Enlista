'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Listing } from '@/types/database'
import { toast } from 'sonner'
import { Trash2, Loader2, Search } from 'lucide-react'
import { PageHeading, BentoCard, StatusBadge } from '@/components/ui'

type Filter = 'all' | 'draft' | 'published' | 'sale' | 'rent'

function formatPrice(price: number, type: string) {
  return `AED ${price.toLocaleString()}${type === 'rent' ? '/yr' : ''}`
}

function formatSpecs(listing: Listing) {
  const parts: string[] = []
  if (listing.bedrooms) parts.push(`${listing.bedrooms} Bed`)
  if (listing.bathrooms) parts.push(`${listing.bathrooms} Bath`)
  if (listing.size_sqft) parts.push(`${Number(listing.size_sqft).toLocaleString()} sqft`)
  if (listing.community) parts.push(listing.community.toUpperCase())
  return parts.join(' · ')
}

export default function ListingsPage() {
  const supabase = createClient() // used for delete
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const fetchListings = useCallback(async () => {
    const res = await fetch('/api/listings')
    const json = await res.json()
    if (!res.ok) { toast.error(json.error ?? 'Failed to load listings'); setLoading(false); return }
    setListings(json.listings as Listing[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchListings() }, [fetchListings])

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete: ' + error.message)
    } else {
      setListings((prev) => prev.filter((l) => l.id !== id))
      toast.success('Listing deleted.')
    }
    setDeleting(null)
    setConfirmDelete(null)
  }

  const filtered = listings.filter((l) => {
    const matchesSearch =
      !search ||
      l.community?.toLowerCase().includes(search.toLowerCase()) ||
      l.building_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.property_type?.toLowerCase().includes(search.toLowerCase())

    const matchesFilter =
      filter === 'all' ||
      (filter === 'draft' && l.status === 'draft') ||
      (filter === 'published' && l.status === 'published') ||
      (filter === 'sale' && l.listing_type === 'sale') ||
      (filter === 'rent' && l.listing_type === 'rent')

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 256 }}>
        <Loader2 style={{ width: 24, height: 24, color: '#1D4ED8', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <div>
      <PageHeading
        title="My Listings"
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

      {/* Search + Filter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#64748B' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by community, building, type..."
            style={{
              width: '100%', paddingLeft: 40, paddingRight: 16, paddingTop: 11, paddingBottom: 11,
              border: '1.5px solid #DDE3EC', borderRadius: 8, background: '#FFFFFF',
              fontSize: 14, color: '#1E293B', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['all', 'draft', 'published', 'sale', 'rent'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                border: filter === f ? '1.5px solid #1D4ED8' : '1.5px solid #DDE3EC',
                background: filter === f ? '#1D4ED8' : '#FFFFFF',
                color: filter === f ? 'white' : '#64748B',
                cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <BentoCard>
          <div style={{ border: '2px dashed #DDE3EC', borderRadius: 10, padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ color: '#64748B', fontSize: 16, marginBottom: 8 }}>
              {listings.length === 0 ? 'No listings yet' : 'No results found'}
            </p>
            {listings.length === 0 && (
              <Link href="/new" style={{
                display: 'inline-block', marginTop: 16, background: '#1D4ED8', color: 'white',
                padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600,
              }}>
                Create First Listing
              </Link>
            )}
          </div>
        </BentoCard>
      ) : (
        <BentoCard style={{ padding: 0 }}>
          {filtered.map((listing, idx) => (
            <div key={listing.id} style={{
              padding: '20px 24px',
              borderBottom: idx < filtered.length - 1 ? '1px solid #DDE3EC' : 'none',
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
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 6 }}>
                  {formatPrice(listing.price_aed, listing.listing_type)}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                <StatusBadge status={listing.status} />
                <Link href={`/listings/${listing.id}`} style={{ color: '#1D4ED8', textDecoration: 'none', fontSize: 12, fontWeight: 500 }}>
                  Edit →
                </Link>
                {confirmDelete === listing.id ? (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      disabled={deleting === listing.id}
                      style={{
                        fontSize: 12, color: '#DC2626', border: '1px solid #FCA5A5',
                        padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
                        background: 'white', fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                      }}
                    >
                      {deleting === listing.id ? <Loader2 style={{ width: 12, height: 12, animation: 'spin 1s linear infinite' }} /> : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      style={{
                        fontSize: 12, color: '#64748B', border: '1px solid #DDE3EC',
                        padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
                        background: 'white', fontFamily: 'inherit',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(listing.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 0 }}
                  >
                    <Trash2 style={{ width: 16, height: 16 }} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </BentoCard>
      )}
    </div>
  )
}
