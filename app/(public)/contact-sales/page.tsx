'use client'

import { useState } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Link from 'next/link'
import { PublicNav } from '@/components/PublicNav'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

const c = {
  bg: '#F2F4F7',
  white: '#FFFFFF',
  dark: '#0F1829',
  blue: '#1D4ED8',
  text: '#1E293B',
  muted: '#64748B',
  border: '#DDE3EC',
  placeholder: '#94A3B8',
  bluePale: '#EFF6FF',
}

const LABEL: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: c.text,
  marginBottom: 6,
}

const INPUT: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: `1px solid ${c.border}`,
  fontSize: 14,
  color: c.text,
  background: c.white,
  boxSizing: 'border-box' as const,
  fontFamily: 'inherit',
  outline: 'none',
}

const FOCUS_HANDLERS = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = c.blue
    e.target.style.boxShadow = '0 0 0 3px rgba(29,78,216,0.08)'
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = c.border
    e.target.style.boxShadow = 'none'
  },
}

const EMPLOYEE_RANGES = ['1-5', '6-15', '16-50', '51-100', '100+'] as const
const FOCUS_OPTIONS = ['Leasing', 'Sales', 'Off-Plan', 'All of the Above'] as const

export default function ContactSalesPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [employeeCount, setEmployeeCount] = useState('')
  const [location, setLocation] = useState('')
  const [focusArea, setFocusArea] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const toggleFocus = (option: string) => {
    const value = option.toLowerCase()
    if (value === 'all of the above') {
      setFocusArea((prev) => prev.includes('all') ? [] : ['all'])
    } else {
      setFocusArea((prev) => {
        const without = prev.filter((f) => f !== 'all')
        return without.includes(value)
          ? without.filter((f) => f !== value)
          : [...without, value]
      })
    }
  }

  const isSelected = (option: string) => {
    const value = option.toLowerCase()
    if (value === 'all of the above') return focusArea.includes('all')
    return focusArea.includes(value)
  }

  const allFilled = Boolean(
    firstName && lastName && email && phone && agencyName && employeeCount && location && focusArea.length > 0
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/contact-sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          agencyName,
          employeeCount,
          location,
          focusArea,
          message: message || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={plusJakarta.variable}
      style={{
        fontFamily: 'var(--font-jakarta), sans-serif',
        minHeight: '100vh',
        background: c.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <PublicNav />

      {/* Card */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 560,
          background: c.white,
          border: `1px solid ${c.border}`,
          borderRadius: 12,
          padding: 'clamp(28px, 5vw, 40px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
            <h2 style={{ fontWeight: 700, fontSize: 22, color: c.dark, marginBottom: 8 }}>
              Thank you!
            </h2>
            <p style={{ color: c.muted, fontSize: 15, marginBottom: 24 }}>
              We&apos;ll be in touch within 24 hours.
            </p>
            <Link
              href="/"
              style={{
                color: c.blue,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              ← Back to Home
            </Link>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h1 style={{ fontWeight: 700, fontSize: 22, color: c.dark, margin: 0 }}>
                Get Enlista for Your Agency
              </h1>
              <p style={{ color: c.muted, fontSize: 14, marginTop: 6, marginBottom: 0 }}>
                Tell us about your agency and we&apos;ll be in touch within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* First + Last Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={LABEL}>First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    placeholder="John"
                    style={INPUT}
                    {...FOCUS_HANDLERS}
                  />
                </div>
                <div>
                  <label style={LABEL}>Last Name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    placeholder="Smith"
                    style={INPUT}
                    {...FOCUS_HANDLERS}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={LABEL}>Contact Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="john@agency.com"
                  style={INPUT}
                  {...FOCUS_HANDLERS}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={LABEL}>Contact Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+971 50 123 4567"
                  style={INPUT}
                  {...FOCUS_HANDLERS}
                />
              </div>

              {/* Agency Name */}
              <div>
                <label style={LABEL}>Agency Name *</label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  required
                  placeholder="Dubai Realty Group"
                  style={INPUT}
                  {...FOCUS_HANDLERS}
                />
              </div>

              {/* Employee Count + Location */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={LABEL}>Number of Employees *</label>
                  <select
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    required
                    style={{
                      ...INPUT,
                      height: 42,
                      color: employeeCount ? c.text : c.placeholder,
                      appearance: 'none' as const,
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 14px center',
                      paddingRight: 36,
                    }}
                    onFocus={(e) => { e.target.style.borderColor = c.blue; e.target.style.boxShadow = '0 0 0 3px rgba(29,78,216,0.08)' }}
                    onBlur={(e) => { e.target.style.borderColor = c.border; e.target.style.boxShadow = 'none' }}
                  >
                    <option value="" disabled>Select range</option>
                    {EMPLOYEE_RANGES.map((range) => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={LABEL}>Location *</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    placeholder="Dubai, UAE"
                    style={INPUT}
                    {...FOCUS_HANDLERS}
                  />
                </div>
              </div>

              {/* Focus Area */}
              <div>
                <label style={LABEL}>Focus Area *</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                  {FOCUS_OPTIONS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleFocus(option)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 20,
                        fontSize: 13,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        border: `2px solid ${isSelected(option) ? c.blue : c.border}`,
                        background: isSelected(option) ? c.bluePale : c.white,
                        color: isSelected(option) ? c.blue : c.muted,
                        transition: 'all 0.15s',
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label style={LABEL}>
                  Message <span style={{ color: c.placeholder, fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about your needs..."
                  style={{
                    ...INPUT,
                    height: 80,
                    resize: 'vertical' as const,
                  }}
                  onFocus={(e) => { e.target.style.borderColor = c.blue; e.target.style.boxShadow = '0 0 0 3px rgba(29,78,216,0.08)' }}
                  onBlur={(e) => { e.target.style.borderColor = c.border; e.target.style.boxShadow = 'none' }}
                />
              </div>

              {/* Error */}
              {error && (
                <p style={{ color: '#EF4444', fontSize: 13, margin: 0 }}>{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !allFilled}
                style={{
                  width: '100%',
                  background: c.blue,
                  color: 'white',
                  padding: 12,
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: loading || !allFilled ? 'not-allowed' : 'pointer',
                  opacity: loading || !allFilled ? 0.5 : 1,
                  fontFamily: 'inherit',
                  transition: 'opacity 0.15s',
                  marginTop: 4,
                }}
              >
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </>
        )}
      </div>

      {/* Footer link */}
      <p style={{ marginTop: 20, fontSize: 13, color: c.muted }}>
        Already have an account?{' '}
        <Link href="/auth" style={{ color: c.blue, fontWeight: 600, textDecoration: 'none' }}>
          Login
        </Link>
      </p>
      </div>
    </div>
  )
}
