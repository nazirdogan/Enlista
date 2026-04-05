'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Listing } from '@/types/database'
import { toast } from 'sonner'
import { Copy, Check, Loader2, ArrowLeft } from 'lucide-react'
import { BentoCard, SectionLabel, Badge } from '@/components/ui'

type OutputTab = 'compact' | 'highlight' | 'headline' | 'whatsapp' | 'instagram'

function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy to clipboard.')
    }
  }
  return (
    <button
      onClick={handleCopy}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 14px', border: '1.5px solid #1D4ED8', borderRadius: 6,
        color: '#1D4ED8', background: 'white', fontSize: 12, fontWeight: 500,
        cursor: 'pointer', fontFamily: 'inherit',
      }}
    >
      {copied ? <Check style={{ width: 12, height: 12 }} /> : <Copy style={{ width: 12, height: 12 }} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}

function WordCount({ text }: { text: string }) {
  const count = text ? text.trim().split(/\s+/).filter(Boolean).length : 0
  return <span style={{ fontSize: 12, color: '#64748B' }}>{count} words</span>
}

function formatPrice(price: number, type: string) {
  return `AED ${price.toLocaleString()}${type === 'rent' ? '/yr' : ''}`
}

function propertyBadge(listing: Listing) {
  const parts = [
    listing.property_type,
    listing.listing_type === 'rent' ? 'For Rent' : 'For Sale',
  ]
  return parts.join(' · ').toUpperCase()
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<OutputTab>('compact')
  const [userPlan, setUserPlan] = useState<string>('free')

  const [enText, setEnText] = useState('')
  const [arText, setArText] = useState('')

  const fetchListing = useCallback(async () => {
    if (id === 'preview') {
      const raw = sessionStorage.getItem('preview_listing')
      if (!raw) {
        toast.error('Listing not found.')
        router.push('/new')
        return
      }
      const data = JSON.parse(raw) as Listing
      setListing(data)
      setEnText(data.en_listing ?? '')
      setArText(data.ar_listing ?? '')
      setLoading(false)
      return
    }
    const res = await fetch(`/api/listings?id=${id}`)
    const json = await res.json()
    if (!res.ok || !json.listing) {
      toast.error('Listing not found.')
      router.push('/listings')
      return
    }
    const data = json.listing as Listing
    setListing(data)
    setEnText(data.en_listing ?? '')
    setArText(data.ar_listing ?? '')
    setLoading(false)
  }, [id, router])

  useEffect(() => {
    fetchListing()
  }, [fetchListing])

  useEffect(() => {
    async function fetchPlan() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: agency } = await supabase
        .from('agencies')
        .select('plan')
        .eq('user_id', user.id)
        .single()
      if (agency?.plan) setUserPlan(agency.plan)
    }
    fetchPlan()
  }, [supabase])

  const handleSave = async () => {
    if (!listing) return
    setSaving(true)
    if (id === 'preview') {
      // First save — insert via server API route (handles auth/RLS server-side)
      const payload = { ...listing, en_listing: enText, ar_listing: arText, status: 'draft' }
      const res = await fetch('/api/save-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.id) {
        toast.error(data.error || 'Failed to save listing.')
        setSaving(false)
        return
      }
      sessionStorage.removeItem('preview_listing')
      toast.success('Listing saved to My Listings!')
      router.push(`/listings/${data.id}`)
      return
    }
    const { error } = await supabase
      .from('listings')
      .update({ en_listing: enText, ar_listing: arText, updated_at: new Date().toISOString() })
      .eq('id', listing.id)
    if (error) {
      toast.error('Failed to save: ' + error.message)
    } else {
      toast.success('Changes saved.')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 256 }}>
        <Loader2 style={{ width: 24, height: 24, color: '#1D4ED8', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (!listing) return null

  const hashtags = listing.instagram_caption
    ? listing.instagram_caption.match(/#\w+/g)?.join(' ') ?? ''
    : ''
  const captionWithoutHashtags = listing.instagram_caption
    ? listing.instagram_caption.replace(/#\w+/g, '').trim()
    : ''

  return (
    <div style={{ paddingBottom: 96 }}>
      {/* Property Summary Bar */}
      <div
        className="sticky-summary-bar"
        style={{
          position: 'sticky', top: 48, zIndex: 40,
          background: '#FFFFFF', borderBottom: '1px solid #DDE3EC',
          padding: '12px 0', marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
            <Badge variant="blue">{propertyBadge(listing)}</Badge>
            {listing.bedrooms && (
              <span style={{ fontSize: 13, color: '#64748B' }}>
                {listing.bedrooms} Bed · {listing.bathrooms} Bath
              </span>
            )}
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0F1829' }}>
              {formatPrice(listing.price_aed, listing.listing_type)}
            </span>
            {listing.community && (
              <span style={{ fontSize: 13, color: '#64748B' }}>{listing.community}</span>
            )}
          </div>
          <Link href="/listings" style={{ color: '#64748B', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft style={{ width: 14, height: 14 }} />
            All Listings
          </Link>
        </div>
      </div>

      {/* EN + AR panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 20, marginBottom: 32 }} className="md:grid-cols-2">
        {/* English Panel */}
        <BentoCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SectionLabel>AI Copy — EN</SectionLabel>
              <Badge variant="green" style={{ marginBottom: 10 }}>Generated</Badge>
            </div>
            <CopyButton text={enText} />
          </div>
          <textarea
            value={enText}
            onChange={(e) => setEnText(e.target.value)}
            rows={12}
            style={{
              width: '100%', border: '1.5px solid #DDE3EC', borderRadius: 6, padding: 12,
              fontSize: 13, color: '#1E293B', lineHeight: 1.6, resize: 'none', outline: 'none',
              fontFamily: '"JetBrains Mono", monospace', background: '#FAFAFA', boxSizing: 'border-box',
            }}
            placeholder="English listing will appear here..."
            onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
            onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
          />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
            <WordCount text={enText} />
          </div>
        </BentoCard>

        {/* Arabic Panel */}
        <BentoCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SectionLabel>AI Copy — AR</SectionLabel>
              <Badge variant="green" style={{ marginBottom: 10 }}>Generated</Badge>
            </div>
            <CopyButton text={arText} />
          </div>
          <textarea
            value={arText}
            onChange={(e) => setArText(e.target.value)}
            rows={12}
            dir="rtl"
            lang="ar"
            style={{
              width: '100%', border: '1.5px solid #DDE3EC', borderRadius: 6, padding: 12,
              fontSize: 13, color: '#1E293B', lineHeight: 1.6, resize: 'none', outline: 'none',
              fontFamily: '"JetBrains Mono", monospace', background: '#FAFAFA', textAlign: 'right',
              boxSizing: 'border-box',
            }}
            placeholder="سيظهر الإعلان العربي هنا..."
            onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
            onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
          />
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-start' }}>
            <WordCount text={arText} />
          </div>
        </BentoCard>
      </div>

      {/* Output Variants */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #DDE3EC', marginBottom: 20, gap: 0 }}>
          {(
            [
              { key: 'compact', label: 'Compact' },
              { key: 'highlight', label: 'Highlights' },
              { key: 'headline', label: 'Headline' },
              { key: 'whatsapp', label: 'WhatsApp' },
              { key: 'instagram', label: 'Instagram' },
            ] as { key: OutputTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 18px', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap',
                color: activeTab === tab.key ? '#1D4ED8' : '#64748B',
                background: 'none', border: 'none', borderBottom: activeTab === tab.key ? '2px solid #1D4ED8' : '2px solid transparent',
                cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1, flexShrink: 0,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'compact' && (
          <BentoCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Compact Listing</p>
                <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0 0' }}>Portal-ready · 80–110 words</p>
              </div>
              <CopyButton text={listing.compact_listing ?? ''} />
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: '#1E293B', whiteSpace: 'pre-wrap', margin: 0 }}>
              {listing.compact_listing ?? 'No compact listing generated.'}
            </p>
          </BentoCard>
        )}

        {activeTab === 'highlight' && (
          <BentoCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Key Highlights</p>
                <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0 0' }}>Bullet format · Bayut / Property Finder features section</p>
              </div>
              <CopyButton text={listing.highlight_bullets ?? ''} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {listing.highlight_bullets
                ? listing.highlight_bullets
                    .split('\n')
                    .filter((line) => line.trim())
                    .map((line, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <span style={{ color: '#1D4ED8', flexShrink: 0, marginTop: 2 }}>•</span>
                        <span style={{ fontSize: 14, color: '#1E293B', lineHeight: 1.6 }}>
                          {line.replace(/^[•\-]\s*/, '')}
                        </span>
                      </div>
                    ))
                : <p style={{ fontSize: 14, color: '#64748B' }}>No highlights generated.</p>
              }
            </div>
          </BentoCard>
        )}

        {activeTab === 'headline' && (
          <BentoCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Listing Headline</p>
                <p style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 0 0' }}>Pipe-separated title · Use as listing title on Bayut / Property Finder</p>
              </div>
              <CopyButton text={listing.headline_title ?? ''} />
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#0F1829', lineHeight: 1.5, margin: 0, letterSpacing: '0.01em' }}>
              {listing.headline_title ?? 'No headline generated.'}
            </p>
          </BentoCard>
        )}

        {activeTab === 'whatsapp' && (
          userPlan === 'pro' || userPlan === 'enterprise' ? (
            <div style={{ background: '#EFF6FF', border: '1.5px solid #1D4ED8', borderRadius: 10, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>WhatsApp Message</p>
                  <p style={{ fontSize: 11, color: '#6B90D4', margin: '2px 0 0 0' }}>Ready to send · Max 150 words</p>
                </div>
                <CopyButton text={listing.whatsapp_text ?? ''} label="Copy for WhatsApp" />
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#1E293B', margin: 0 }}>
                {listing.whatsapp_text ?? 'No WhatsApp message generated.'}
              </p>
            </div>
          ) : (
            <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: 32, textAlign: 'center' }}>
              <p style={{ fontSize: 22, margin: '0 0 8px' }}>💬</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>WhatsApp copy is a Pro feature</p>
              <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 20px', maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
                Upgrade to Pro to get a ready-to-send WhatsApp message generated with every listing.
              </p>
              <a href="/pricing" style={{ display: 'inline-block', padding: '10px 24px', background: '#1D4ED8', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                Upgrade to Pro
              </a>
            </div>
          )
        )}

        {activeTab === 'instagram' && (
          userPlan === 'pro' || userPlan === 'enterprise' ? (
            <div style={{ background: 'linear-gradient(135deg, #f3e7ff 0%, #fde8f0 100%)', border: '1px solid #e9d5ff', borderRadius: 10, padding: 20 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Caption</p>
                  <CopyButton text={captionWithoutHashtags} label="Copy Caption" />
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', color: '#1E293B', margin: 0 }}>
                  {captionWithoutHashtags || 'No caption generated.'}
                </p>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Hashtags</p>
                  <CopyButton text={hashtags} label="Copy Hashtags" />
                </div>
                <p style={{ fontSize: 13, color: '#7C3AED', lineHeight: 1.8, margin: 0 }}>{hashtags || 'No hashtags generated.'}</p>
              </div>
            </div>
          ) : (
            <div style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: 32, textAlign: 'center' }}>
              <p style={{ fontSize: 22, margin: '0 0 8px' }}>📸</p>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', margin: '0 0 6px' }}>Instagram copy is a Pro feature</p>
              <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 20px', maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
                Upgrade to Pro to get an Instagram caption and hashtag set generated with every listing.
              </p>
              <a href="/pricing" style={{ display: 'inline-block', padding: '10px 24px', background: '#1D4ED8', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                Upgrade to Pro
              </a>
            </div>
          )
        )}
      </div>

      {/* Fixed bottom action bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#FFFFFF', borderTop: '1px solid #DDE3EC', zIndex: 50,
      }} className="md:left-[240px]">
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }} className="px-4 py-3 md:px-8">
          <Link href="/listings" style={{ color: '#64748B', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Back to Listings
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              background: '#1D4ED8', color: 'white', padding: '10px 28px', borderRadius: 8,
              border: 'none', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : 1,
              display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
            }}
          >
            {saving ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Saving...</> : id === 'preview' ? 'Save to My Listings' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
