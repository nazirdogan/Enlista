'use client'

import { useState } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { WhatsAppPhone } from '@/components/demo/WhatsAppPhone'
import { useWhatsAppDemo } from '@/lib/demo/use-whatsapp-demo'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

type Act = 'intro' | 'chat' | 'reveal'

const wa = '#25D366'
const waDark = '#128C7E'
const darker = '#070D1A'

const BAND_CONFIG: Record<'HOT' | 'WARM' | 'COLD', { emoji: string; color: string; label: string; badge: string }> = {
  HOT:  { emoji: '🔥', color: '#22c55e', label: 'HOT Lead', badge: 'rgba(34,197,94,0.12)' },
  WARM: { emoji: '🌡️', color: '#f59e0b', label: 'WARM Lead', badge: 'rgba(245,158,11,0.12)' },
  COLD: { emoji: '❄️', color: '#60a5fa', label: 'COLD Lead', badge: 'rgba(96,165,250,0.12)' },
}

// ─── Act 1: Intro ──────────────────────────────────────────────────────────────
function ActIntro({ onStart }: { onStart: () => void }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${darker} 0%, #0d2040 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      gap: 32,
      textAlign: 'center',
    }}>
      {/* Property badge */}
      <div style={{
        background: 'rgba(37,211,102,0.12)',
        border: '1px solid rgba(37,211,102,0.2)',
        borderRadius: 12,
        padding: '14px 20px',
        maxWidth: 340,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: wa, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
          📲 New Enquiry
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
          2BR Apartment — Dubai Marina
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>AED 2,000,000 · Marina Heights</div>
      </div>

      {/* Headline */}
      <div>
        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 48px)',
          fontWeight: 800,
          color: '#fff',
          margin: '0 0 16px',
          lineHeight: 1.15,
          maxWidth: 560,
        }}>
          You just enquired about a property.
        </h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', maxWidth: 440, margin: '0 auto' }}>
          Normally, you&apos;d wait hours for a callback. With Enlista, the bot is already responding — in under 30 seconds.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onStart}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: wa, color: '#fff',
          padding: '16px 36px', borderRadius: 10,
          fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer',
          boxShadow: `0 6px 28px ${wa}44`,
          fontFamily: 'var(--font-jakarta), sans-serif',
        }}
      >
        See what happens next →
      </button>

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)' }}>
        No signup required · Takes 2 minutes
      </div>
    </div>
  )
}

// ─── Act 2: Chat ───────────────────────────────────────────────────────────────
function ActChat({
  messages,
  isTyping,
  isDone,
  onSend,
  onReveal,
}: {
  messages: ReturnType<typeof useWhatsAppDemo>['messages']
  isTyping: boolean
  isDone: boolean
  onSend: (t: string) => void
  onReveal: () => void
}) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d1418',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      gap: 24,
    }}>
      {/* Keyframe at component root — not inside conditional — consistent with WhatsAppPhone pattern */}
      <style>{`
        @keyframes pulse-in {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: wa, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
          Act 2 — Live Chat
        </div>
        <h2 style={{ fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
          The bot is qualifying you in real time.
        </h2>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
          Type your replies — just like you would on WhatsApp.
        </p>
      </div>

      <WhatsAppPhone
        messages={messages}
        isTyping={isTyping}
        onSend={onSend}
        disabled={isDone}
      />

      {isDone && (
        <button
          onClick={onReveal}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#8b5cf6', color: '#fff',
            padding: '14px 32px', borderRadius: 10,
            fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
            boxShadow: '0 6px 24px rgba(139,92,246,0.4)',
            fontFamily: 'var(--font-jakarta), sans-serif',
            animation: 'pulse-in 0.4s ease-out',
          }}
        >
          See what Ahmed just received 🔥
        </button>
      )}
    </div>
  )
}

// ─── Act 3: Reveal ─────────────────────────────────────────────────────────────
function ActReveal({
  score,
  band,
  answers,
  onRestart,
}: {
  score: number
  band: 'HOT' | 'WARM' | 'COLD'
  answers: ReturnType<typeof useWhatsAppDemo>['answers']
  onRestart: () => void
}) {
  const conf = BAND_CONFIG[band]

  const rows: [string, string][] = [
    ['Property',  'Marina Heights 2BR, Dubai Marina'],
    ['Lead',      'You (Demo)'],
    ['Budget',    (answers.budget?.label    ?? '—')],
    ['Timeline',  (answers.timeline?.label  ?? '—')],
    ['Financing', (answers.financing?.label ?? '—')],
    ['Intent',    (answers.intent?.label    ?? '—')],
    ['Score',     `${score}/88 — ${conf.label}`],
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(160deg, ${darker} 0%, #0d1a30 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      gap: 28,
      textAlign: 'center',
    }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>
          Act 3 — The Reveal
        </div>
        <h2 style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
          Here&apos;s what Ahmed just received.
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', margin: 0 }}>
          Instantly. While you were still typing.
        </p>
      </div>

      {/* Agent notification card */}
      <div style={{
        background: '#0f1829',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '20px 24px',
        width: '100%',
        maxWidth: 380,
        textAlign: 'left',
      }}>
        <div style={{
          fontSize: 12, fontWeight: 700, color: wa,
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14,
        }}>
          {conf.emoji} {conf.label} — Enlista
        </div>

        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: 10, fontSize: 13, marginBottom: 8, alignItems: 'flex-start' }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', width: 80, flexShrink: 0, fontSize: 12 }}>{k}</span>
            <span style={{ color: '#fff', fontWeight: 500, flex: 1 }}>{v}</span>
          </div>
        ))}

        {/* Score bar */}
        <div style={{ marginTop: 14, padding: '12px 14px', background: conf.badge, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Lead Score</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: conf.color }}>{score}/88</div>
        </div>

        {/* Booking card */}
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(37,211,102,0.08)', borderRadius: 10, border: '1px solid rgba(37,211,102,0.15)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: wa, marginBottom: 4 }}>📅 Viewing Booked</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Mon 7 Apr — 10:00 AM · Marina Heights</div>
        </div>

        <a
          href="/dashboard"
          style={{ display: 'block', marginTop: 14, padding: '9px 14px', background: waDark, borderRadius: 8, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#fff', textDecoration: 'none' }}
        >
          Open in Enlista Dashboard →
        </a>
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <a
          href="/contact-sales"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: wa, color: '#fff',
            padding: '14px 32px', borderRadius: 10,
            fontSize: 14, fontWeight: 700, textDecoration: 'none',
            boxShadow: `0 6px 24px ${wa}44`,
          }}
        >
          Want this for your agency? →
        </a>
        <button
          onClick={onRestart}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'underline',
            fontFamily: 'var(--font-jakarta), sans-serif',
          }}
        >
          Restart from beginning
        </button>
      </div>

      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
        Powered by <strong style={{ color: 'rgba(255,255,255,0.35)' }}>Enlista</strong> · WhatsApp Automation
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function WhatsAppStoryPage() {
  const [act, setAct] = useState<Act>('intro')
  const demo = useWhatsAppDemo()

  const handleRestart = () => {
    demo.restart()
    setAct('intro')
  }

  return (
    <div className={plusJakarta.variable} style={{ fontFamily: 'var(--font-jakarta), sans-serif' }}>
      {act === 'intro' && <ActIntro onStart={() => setAct('chat')} />}
      {act === 'chat' && (
        <ActChat
          messages={demo.messages}
          isTyping={demo.isTyping}
          isDone={demo.isDone}
          onSend={demo.sendMessage}
          onReveal={() => setAct('reveal')}
        />
      )}
      {act === 'reveal' && (
        <ActReveal
          score={demo.score}
          band={demo.band}
          answers={demo.answers}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}
