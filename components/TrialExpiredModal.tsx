// components/TrialExpiredModal.tsx
'use client'

import Link from 'next/link'

export default function TrialExpiredModal() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: 16,
        padding: '48px 40px',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: '#FEF2F2', margin: '0 auto 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0F1829', margin: '0 0 10px' }}>
          Your free trial has ended
        </h2>
        <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.6, margin: '0 0 28px' }}>
          Your 30-day free trial has expired. Choose a plan to keep generating bilingual listings, WhatsApp copy, and more.
        </p>
        <p style={{ color: '#94A3B8', fontSize: 12, margin: '0 0 28px' }}>
          Your saved listings are safe and waiting for you.
        </p>

        <Link
          href="/onboarding"
          style={{
            display: 'block',
            background: '#1D4ED8',
            color: 'white',
            padding: '14px 24px',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Choose a plan →
        </Link>

        <p style={{ marginTop: 16, fontSize: 12, color: '#94A3B8' }}>
          From AED 92/month · Cancel anytime
        </p>
      </div>
    </div>
  )
}
