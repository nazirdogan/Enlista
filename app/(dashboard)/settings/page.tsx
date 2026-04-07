'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Agency } from '@/types/database'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { PageHeading, BentoCard } from '@/components/ui'

type Tab = 'profile' | 'subscription' | 'referrals'

const TONES = [
  { value: 'professional', label: 'Professional', desc: 'Clean, factual, broker-grade copy' },
  { value: 'luxury', label: 'Luxury', desc: 'Aspirational, lifestyle-led language' },
  { value: 'investment', label: 'Investment', desc: 'ROI-focused, yield-driven copy' },
]

const inputStyle = {
  width: '100%', padding: '11px 12px', borderRadius: 6,
  border: '1.5px solid #DDE3EC', outline: 'none',
  fontSize: 14, color: '#1E293B', background: '#FFFFFF',
  boxSizing: 'border-box' as const, fontFamily: 'inherit',
}

export default function SettingsPage() {
  const supabase = useMemo(() => createClient(), [])
  const [tab, setTab] = useState<Tab>('profile')
  const [agency, setAgency] = useState<Agency | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [listingsCount, setListingsCount] = useState(0)

  // Form state
  const [name, setName] = useState('')
  const [reraLicense, setReraLicense] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [defaultTone, setDefaultTone] = useState('professional')
  const [defaultDisclaimer, setDefaultDisclaimer] = useState('')

  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [referralStats, setReferralStats] = useState<{
    sent: number
    converted: number
    totalCreditsEarned: number
    currentBalance: number
  } | null>(null)
  const [referralCopied, setReferralCopied] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: ag } = await supabase
        .from('agencies')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (ag) {
        setAgency(ag as Agency)
        setName(ag.name ?? '')
        setReraLicense(ag.rera_license ?? '')
        setPhone(ag.phone ?? '')
        setEmail(ag.email ?? '')
        setDefaultTone(ag.default_tone ?? 'professional')
        setDefaultDisclaimer(ag.default_disclaimer ?? '')
      }

      const { count } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setListingsCount(count ?? 0)
    } catch (err) {
      console.error('Failed to load settings:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => { fetchData() }, [fetchData])

  const fetchReferralStats = useCallback(async () => {
    try {
      const res = await fetch('/api/referrals/stats')
      if (res.ok) {
        const data = await res.json()
        setReferralCode(data.referralCode)
        setReferralStats({
          sent: data.sent,
          converted: data.converted,
          totalCreditsEarned: data.totalCreditsEarned,
          currentBalance: data.currentBalance,
        })
      }
    } catch { /* non-critical */ }
  }, [])

  useEffect(() => {
    if (tab === 'referrals') {
      fetchReferralStats()
    }
  }, [tab, fetchReferralStats])

  const handleSave = async () => {
    if (!agency) return
    setSaving(true)
    const { error } = await supabase
      .from('agencies')
      .update({
        name,
        rera_license: reraLicense || null,
        phone: phone || null,
        email: email || null,
        default_tone: defaultTone,
        default_disclaimer: defaultDisclaimer || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agency.id)
    if (error) { toast.error(error.message) }
    else { toast.success('Agency profile saved.') }
    setSaving(false)
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 256 }}>
        <Loader2 style={{ width: 24, height: 24, color: '#1D4ED8', animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  const MONTHLY_LIMIT = 50
  const usagePct = Math.min((listingsCount / MONTHLY_LIMIT) * 100, 100)

  return (
    <div style={{ maxWidth: 640 }}>
      <PageHeading title="Settings" />

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #DDE3EC', marginBottom: 32 }}>
        {([
          { key: 'profile', label: 'Agency Profile' },
          { key: 'subscription', label: 'Subscription' },
          { key: 'referrals', label: 'Referrals' },
        ] as { key: Tab; label: string }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 20px', fontSize: 13, fontWeight: 500,
              color: tab === t.key ? '#1D4ED8' : '#64748B',
              background: 'none', border: 'none',
              borderBottom: tab === t.key ? '2px solid #1D4ED8' : '2px solid transparent',
              cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Agency Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                placeholder="Prestige Properties"
                onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>RERA License</label>
              <input
                value={reraLicense}
                onChange={(e) => setReraLicense(e.target.value)}
                style={inputStyle}
                placeholder="RERA-XXXX"
                onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Phone</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={inputStyle}
                placeholder="+971 50 XXX XXXX"
                onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                style={inputStyle}
                placeholder="listings@agency.ae"
                onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
                onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
              />
            </div>
          </div>

          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Default Listing Tone</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {TONES.map((tone) => (
                <button
                  key={tone.value}
                  type="button"
                  onClick={() => setDefaultTone(tone.value)}
                  style={{
                    padding: 14, borderRadius: 8, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
                    border: defaultTone === tone.value ? '1.5px solid #1D4ED8' : '1.5px solid #DDE3EC',
                    background: defaultTone === tone.value ? '#EFF6FF' : 'white',
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: 600, color: defaultTone === tone.value ? '#1D4ED8' : '#1E293B', margin: 0, marginBottom: 4 }}>
                    {tone.label}
                  </p>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{tone.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Default Disclaimer</label>
            <textarea
              value={defaultDisclaimer}
              onChange={(e) => setDefaultDisclaimer(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
              placeholder="e.g. All measurements are approximate. Subject to change without notice. RERA Permit: ..."
              onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
              onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
            />
          </div>

          <div>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: '#1D4ED8', color: 'white', padding: '10px 28px', borderRadius: 8,
                border: 'none', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
                display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
              }}
            >
              {saving ? <><Loader2 style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} /> Saving...</> : 'Save Profile'}
            </button>
          </div>
        </div>
      )}

      {tab === 'subscription' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <BentoCard>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Current Plan</p>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0F1829', margin: 0, marginBottom: 4 }}>Solo Agent</h2>
            <p style={{ fontSize: 14, color: '#64748B', margin: 0 }}>50 listings / month</p>
          </BentoCard>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Monthly Usage</p>
              <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{listingsCount} / {MONTHLY_LIMIT}</p>
            </div>
            <div style={{ height: 8, background: '#F1F5F9', borderRadius: 4 }}>
              <div
                style={{
                  height: 8, borderRadius: 4,
                  background: usagePct > 80 ? '#EF4444' : '#1D4ED8',
                  width: `${usagePct}%`, transition: 'width 0.3s',
                }}
              />
            </div>
            {usagePct > 80 && (
              <p style={{ fontSize: 12, color: '#DC2626', marginTop: 6 }}>You&apos;re approaching your monthly limit.</p>
            )}
          </div>

          <BentoCard style={{ border: '1.5px solid #1D4ED8' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#0F1829', margin: 0, marginBottom: 16 }}>Agency Plan</h3>
            <ul style={{ fontSize: 14, color: '#64748B', marginBottom: 20, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li>✦ Unlimited listings per month</li>
              <li>✦ Team members (up to 10 agents)</li>
              <li>✦ Priority AI generation</li>
              <li>✦ White-label exports</li>
              <li>✦ Dedicated support</li>
            </ul>
            <button style={{
              background: '#1D4ED8', color: 'white', padding: '10px 24px', borderRadius: 8,
              border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Upgrade to Agency Plan →
            </button>
          </BentoCard>
        </div>
      )}

      {tab === 'referrals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0F1829', marginBottom: 4 }}>Your Referral Link</h3>
            <p style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }}>
              Share this link. When someone signs up and activates a paid plan, you earn 10 listing credits.
            </p>
            {referralCode ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  readOnly
                  value={`https://enlista.io/auth?tab=signup&ref=${referralCode}`}
                  style={{ ...inputStyle, flex: 1, background: '#F8FAFC', color: '#475569', cursor: 'text' }}
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`https://enlista.io/auth?tab=signup&ref=${referralCode}`)
                    setReferralCopied(true)
                    setTimeout(() => setReferralCopied(false), 2000)
                  }}
                  style={{
                    padding: '11px 16px', borderRadius: 6, border: '1.5px solid #DDE3EC',
                    background: referralCopied ? '#F0FDF4' : '#FFFFFF', cursor: 'pointer',
                    fontSize: 13, fontWeight: 600, color: referralCopied ? '#16A34A' : '#0F1829',
                    fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.2s',
                  }}
                >
                  {referralCopied ? 'Copied!' : 'Copy link'}
                </button>
              </div>
            ) : (
              <p style={{ color: '#94A3B8', fontSize: 13 }}>Loading...</p>
            )}
          </div>

          {referralStats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {[
                { label: 'People referred', value: referralStats.sent },
                { label: 'Successful referrals', value: referralStats.converted },
                { label: 'Credits earned total', value: referralStats.totalCreditsEarned },
                { label: 'Current credit balance', value: referralStats.currentBalance },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  background: '#F8FAFC', borderRadius: 10, padding: '16px 20px',
                  border: '1px solid #DDE3EC',
                }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#0F1829' }}>{value}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: '#EFF6FF', borderRadius: 10, padding: '14px 16px', border: '1px solid #BFDBFE' }}>
            <p style={{ fontSize: 13, color: '#1E3A8A', margin: 0, lineHeight: 1.6 }}>
              <strong>How it works:</strong> When someone signs up via your link and activates a paid plan, you instantly receive 10 listing credits. Credits are used automatically before your monthly quota. They never expire.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
