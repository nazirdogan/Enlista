'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [agencyName, setAgencyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { agency_name: agencyName } },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (data.user) {
        // Create agency record
        const { error: agencyError } = await supabase.from('agencies').insert({
          user_id: data.user.id,
          name: agencyName,
          email,
        })
        if (agencyError && agencyError.code !== '23505') {
          console.error('Agency creation error:', agencyError)
        }
        toast.success('Account created! Welcome to ListingsLaunch.')
        router.push('/')
        router.refresh()
      }
    } catch {
      toast.error('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px' }}>
      <div style={{
        width: '100%', maxWidth: 448,
        background: '#FFFFFF', border: '1px solid #DDE3EC',
        borderRadius: 16, padding: 48,
      }}>
        {/* Wordmark */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontWeight: 800, fontSize: 24, color: '#0F1829', margin: 0 }}>
            Listings<span style={{ color: '#1D4ED8' }}>Launch</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: 14, marginTop: 8 }}>
            Join 500+ UAE agents saving hours daily
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Agency Name
            </label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px', borderRadius: 6,
                border: '1.5px solid #DDE3EC', outline: 'none',
                fontSize: 14, color: '#1E293B', background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
              placeholder="Prestige Properties Dubai"
              onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
              onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{
                width: '100%', padding: '12px', borderRadius: 6,
                border: '1.5px solid #DDE3EC', outline: 'none',
                fontSize: 14, color: '#1E293B', background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
              placeholder="agent@agency.ae"
              onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
              onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              style={{
                width: '100%', padding: '12px', borderRadius: 6,
                border: '1.5px solid #DDE3EC', outline: 'none',
                fontSize: 14, color: '#1E293B', background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
              placeholder="Min. 8 characters"
              onFocus={(e) => { e.target.style.borderColor = '#1D4ED8' }}
              onBlur={(e) => { e.target.style.borderColor = '#DDE3EC' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', background: '#1D4ED8', color: 'white',
              padding: '13px', borderRadius: 6, border: 'none',
              fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: 'inherit',
            }}
          >
            {loading ? (
              <>
                <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} />
                Creating Account...
              </>
            ) : (
              'Create Account →'
            )}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#64748B' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#1D4ED8', textDecoration: 'underline' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
