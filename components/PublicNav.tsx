'use client'

import { useState } from 'react'
import Link from 'next/link'

const blue = '#1D4ED8'
const dark = '#0F1829'
const muted = '#64748B'
const border = '#DDE3EC'
const text = '#1E293B'

const NAV_LINKS = [
  { label: 'Platform', href: '/#features' },
  { label: 'Clients', href: '/#testimonials' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Automations', href: '/whatsapp-automation' },
]

export function PublicNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav
      style={{
        background: '#fff',
        borderBottom: `1px solid ${border}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        padding: '12px 24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 10px)', gridTemplateRows: 'repeat(3, 10px)', gap: 3 }}>
            {[1,1,1,1,1,0,1,1,1].map((on, i) => (
              <div key={i} style={{ borderRadius: 2, background: on ? blue : 'rgba(29,78,216,0.14)' }} />
            ))}
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: dark, letterSpacing: '-0.04em' }}>
            Enlist<span style={{ color: blue }}>a</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex" style={{ gap: 4, fontSize: 13 }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{ color: muted, padding: '6px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 400 }}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden md:flex" style={{ alignItems: 'center', gap: 10 }}>
          <a
            href="/auth"
            style={{
              display: 'inline-block',
              border: `1.5px solid ${border}`,
              color: text,
              padding: '10px 24px',
              fontWeight: 500,
              fontSize: 13,
              borderRadius: 6,
              textDecoration: 'none',
            }}
          >
            Login
          </a>
          <a
            href="/auth?tab=signup"
            style={{
              display: 'inline-block',
              background: blue,
              color: '#fff',
              padding: '10px 24px',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 6,
              textDecoration: 'none',
            }}
          >
            Start free trial
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: dark }}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden" style={{ paddingTop: 16, paddingBottom: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                color: muted,
                padding: '10px 12px',
                borderRadius: 6,
                textDecoration: 'none',
                fontWeight: 400,
                fontSize: 15,
                display: 'block',
              }}
            >
              {label}
            </a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 8 }}>
            <a
              href="/auth"
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                textAlign: 'center',
                border: `1.5px solid ${border}`,
                color: text,
                padding: '11px 24px',
                fontWeight: 500,
                fontSize: 14,
                borderRadius: 6,
                textDecoration: 'none',
              }}
            >
              Login
            </a>
            <a
              href="/auth?tab=signup"
              onClick={() => setOpen(false)}
              style={{
                display: 'block',
                textAlign: 'center',
                background: blue,
                color: '#fff',
                padding: '11px 24px',
                fontWeight: 600,
                fontSize: 14,
                borderRadius: 6,
                textDecoration: 'none',
              }}
            >
              Start free trial
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
