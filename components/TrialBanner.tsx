// components/TrialBanner.tsx
'use client'

import Link from 'next/link'

interface Props {
  daysRemaining: number
}

export default function TrialBanner({ daysRemaining }: Props) {
  const isUrgent = daysRemaining <= 5
  const bg = isUrgent ? '#FEF2F2' : '#EFF6FF'
  const border = isUrgent ? '#FECACA' : '#BFDBFE'
  const text = isUrgent ? '#991B1B' : '#1E3A8A'
  const btnBg = isUrgent ? '#EF4444' : '#1D4ED8'

  const message = daysRemaining === 0
    ? 'Your free trial ends today'
    : daysRemaining === 1
    ? '1 day left in your free trial'
    : `${daysRemaining} days left in your free trial`

  return (
    <div style={{
      background: bg,
      border: `1px solid ${border}`,
      borderRadius: 8,
      padding: '10px 16px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: 13, color: text, fontWeight: 500 }}>
        {message} — upgrade to keep full access.
      </span>
      <Link
        href="/onboarding"
        style={{
          background: btnBg,
          color: 'white',
          padding: '6px 14px',
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 600,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        Upgrade now →
      </Link>
    </div>
  )
}
