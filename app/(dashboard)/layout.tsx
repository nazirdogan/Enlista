'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, LayoutDashboard, Plus, List, BarChart2, Settings, Zap, ShoppingBag } from 'lucide-react'
import OutOfCreditsModal from '@/components/OutOfCreditsModal'
import TrialBanner from '@/components/TrialBanner'
import TrialExpiredModal from '@/components/TrialExpiredModal'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/new', label: 'New Listing', icon: Plus },
  { href: '/listings', label: 'My Listings', icon: List },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface CreditInfo {
  plan: string
  creditsRemaining: number
  extraCredits: number
  listingCredits: number
  totalCredits: number
  creditLimit: number
  nextReset: string
  accountStatus: string
  trialEndsAt: string | null
  daysRemaining: number | null
}

function PlanLabel({ plan }: { plan: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    free:       { bg: 'rgba(255,255,255,0.08)', text: 'rgba(255,255,255,0.4)' },
    plus:       { bg: 'rgba(93,163,255,0.15)',  text: '#5DA3FF' },
    pro:        { bg: 'rgba(168,85,247,0.2)',   text: '#c084fc' },
    enterprise: { bg: 'rgba(251,191,36,0.15)',  text: '#fbbf24' },
  }
  const c = colors[plan] ?? colors.free
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      background: c.bg, color: c.text, padding: '2px 7px', borderRadius: 100,
    }}>
      {plan}
    </span>
  )
}

function CreditsBar({ total, limit }: { total: number; limit: number }) {
  if (limit >= 9999) return null // enterprise — no bar
  const pct = Math.min((total / limit) * 100, 100)
  const color = pct > 40 ? '#4ADE80' : pct > 15 ? '#FBBF24' : '#F87171'
  return (
    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 2, transition: 'width 0.4s' }} />
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)
  const [credits, setCredits] = useState<CreditInfo | null>(null)
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [accountStatus, setAccountStatus] = useState<string | null>(null)
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)

  const fetchCredits = useCallback(async () => {
    try {
      const res = await fetch('/api/credits')
      if (res.ok) {
        const data = await res.json()
        setCredits(data)
        setAccountStatus(data.accountStatus ?? null)
        setDaysRemaining(data.daysRemaining ?? null)
      }
    } catch {
      // non-critical — credits will be null (hidden)
    }
  }, [])

  useEffect(() => {
    fetchCredits()
    // Refresh credits every 60 seconds
    const interval = setInterval(fetchCredits, 60_000)
    return () => clearInterval(interval)
  }, [fetchCredits])

  // Refresh when returning from a Stripe success redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('credits') === 'purchased' || params.get('checkout') === 'success') {
      fetchCredits()
    }
  }, [fetchCredits])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setUserEmail(user.email)
    })
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  const SidebarBottom = () => (
    <div style={{ padding: '12px 12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Credits widget */}
      {credits && (
        <div style={{
          background: 'rgba(255,255,255,0.04)', borderRadius: 10,
          padding: '10px 12px', marginBottom: 10, border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={12} color="#5DA3FF" />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Credits</span>
            </div>
            <PlanLabel plan={credits.plan} />
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: credits.totalCredits === 0 ? '#F87171' : '#fff', lineHeight: 1 }}>
              {credits.plan === 'enterprise' ? '∞' : credits.totalCredits}
            </span>
            {credits.plan !== 'enterprise' && (
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                / {credits.creditLimit} this month
              </span>
            )}
          </div>

          <CreditsBar total={credits.totalCredits} limit={credits.creditLimit} />

          {credits.extraCredits > 0 && (
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: '5px 0 0' }}>
              +{credits.extraCredits} bonus credits
            </p>
          )}

          <button
            onClick={() => setBuyModalOpen(true)}
            style={{
              marginTop: 10, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 6, padding: '7px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: credits.totalCredits === 0 ? '#1D4ED8' : 'rgba(255,255,255,0.06)',
              color: credits.totalCredits === 0 ? '#fff' : 'rgba(255,255,255,0.5)',
              fontSize: 11, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s',
            }}
          >
            <ShoppingBag size={12} />
            {credits.totalCredits === 0 ? 'Top up now' : 'Buy more credits'}
          </button>
        </div>
      )}

      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {userEmail || 'agent@agency.ae'}
      </p>
      <button onClick={handleSignOut} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: 12, color: 'rgba(255,255,255,0.4)', padding: 0,
        fontFamily: 'inherit',
      }}>
        Sign out →
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar — desktop */}
      <aside style={{
        width: 240, background: '#0F1829', position: 'fixed', top: 0, left: 0,
        height: '100vh', flexDirection: 'column', zIndex: 40,
      }} className="hidden md:flex">
        {/* Wordmark */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 10px)', gridTemplateRows: 'repeat(3, 10px)', gap: 3 }}>
              <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
              <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
              <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
              <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
              <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
              <div style={{ borderRadius: 2, background: 'rgba(93,163,255,0.18)' }} />
              <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
              <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
              <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 18, color: 'white', letterSpacing: '-0.04em' }}>
              Enlist<span style={{ color: '#5DA3FF' }}>a</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: active ? 600 : 400,
                background: active ? '#1D4ED8' : 'transparent',
                color: active ? 'white' : 'rgba(255,255,255,0.5)',
                transition: 'all 0.15s',
              }}>
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>

        <SidebarBottom />
      </aside>

      {/* Mobile top bar */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 48,
        background: '#0F1829', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 16px', zIndex: 50,
      }} className="md:hidden flex">
        <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 8px)', gridTemplateRows: 'repeat(3, 8px)', gap: 2 }}>
            <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
            <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
            <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
            <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
            <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
            <div style={{ borderRadius: 2, background: 'rgba(93,163,255,0.18)' }} />
            <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
            <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
            <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 16, color: 'white', letterSpacing: '-0.04em' }}>
            Enlist<span style={{ color: '#5DA3FF' }}>a</span>
          </span>
        </Link>

        {/* Mobile credit chip */}
        {credits && credits.plan !== 'enterprise' && (
          <button
            onClick={() => setBuyModalOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
              background: credits.totalCredits === 0 ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
              border: credits.totalCredits === 0 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: 100, cursor: 'pointer',
              color: credits.totalCredits === 0 ? '#F87171' : 'rgba(255,255,255,0.6)',
              fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            }}
          >
            <Zap size={11} color={credits.totalCredits === 0 ? '#F87171' : '#5DA3FF'} />
            {credits.totalCredits} credit{credits.totalCredits !== 1 ? 's' : ''}
          </button>
        )}

        <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile overlay sidebar */}
      {menuOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 45 }} className="md:hidden">
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setMenuOpen(false)} />
          <aside style={{
            position: 'absolute', top: 48, left: 0, bottom: 0, width: 240,
            background: '#0F1829', display: 'flex', flexDirection: 'column',
          }}>
            <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {navLinks.map(({ href, label, icon: Icon }) => {
                const active = isActive(href)
                return (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                    borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: active ? 600 : 400,
                    background: active ? '#1D4ED8' : 'transparent',
                    color: active ? 'white' : 'rgba(255,255,255,0.5)',
                  }}>
                    <Icon size={16} />
                    {label}
                  </Link>
                )
              })}
            </nav>
            <SidebarBottom />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main style={{ flex: 1, background: '#F2F4F7', minHeight: '100vh', paddingTop: 48 }} className="md:ml-[240px] md:pt-0">
        <div style={{ maxWidth: 1280, margin: '0 auto' }} className="p-4 md:p-8">
          {accountStatus === 'trial' && daysRemaining !== null && (
            <TrialBanner daysRemaining={daysRemaining} />
          )}
          {children}
        </div>
      </main>

      {/* Out-of-credits modal */}
      {credits && (
        <OutOfCreditsModal
          isOpen={buyModalOpen}
          onClose={() => setBuyModalOpen(false)}
          currentPlan={credits.plan}
          creditsRemaining={credits.creditsRemaining}
          extraCredits={credits.extraCredits}
        />
      )}

      {accountStatus === 'trial_expired' && <TrialExpiredModal />}
    </div>
  )
}
