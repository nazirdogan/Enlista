'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Menu, X, LayoutDashboard, Plus, List, BarChart2, Settings } from 'lucide-react'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/new', label: 'New Listing', icon: Plus },
  { href: '/listings', label: 'My Listings', icon: List },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) => pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

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
            {/* Grid mark — 3×3 cells forming "E" */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 10px)', gridTemplateRows: 'repeat(3, 10px)', gap: 3 }}>
              {/* Row 1: top bar (all on) */}
              <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
              <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
              <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
              {/* Row 2: mid bar (2 on) */}
              <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
              <div style={{ borderRadius: 2, background: '#5DA3FF' }} />
              <div style={{ borderRadius: 2, background: 'rgba(93,163,255,0.18)' }} />
              {/* Row 3: bottom bar (all on) */}
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

        {/* Bottom */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            agent@agency.ae
          </p>
          <button onClick={handleSignOut} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: 'rgba(255,255,255,0.4)', padding: 0,
            fontFamily: 'inherit',
          }}>
            Sign out →
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 48,
        background: '#0F1829', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 16px', zIndex: 50,
      }} className="md:hidden flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
        </div>
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
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <button onClick={handleSignOut} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.4)', fontFamily: 'inherit' }}>
                Sign out →
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <main style={{ flex: 1, background: '#F2F4F7', minHeight: '100vh', paddingTop: 48 }} className="md:ml-[240px] md:pt-0">
        <div style={{ maxWidth: 1280, margin: '0 auto' }} className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
