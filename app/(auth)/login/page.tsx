'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast.error(error.message)
      } else {
        router.push('/dashboard')
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
            List it. In Arabic. In 30 seconds.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email
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
              autoComplete="current-password"
              style={{
                width: '100%', padding: '12px', borderRadius: 6,
                border: '1.5px solid #DDE3EC', outline: 'none',
                fontSize: 14, color: '#1E293B', background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
              placeholder="••••••••"
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
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#64748B' }}>
          New to ListingsLaunch?{' '}
          <Link href="/signup" style={{ color: '#1D4ED8', textDecoration: 'underline' }}>
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}
