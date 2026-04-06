'use client'

import { Plus_Jakarta_Sans } from 'next/font/google'
import { WhatsAppPhone } from '@/components/demo/WhatsAppPhone'
import { useWhatsAppDemo } from '@/lib/demo/use-whatsapp-demo'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

const wa = '#25D366'
const dark = '#0F1829'
const muted = '#64748B'

const STEPS: Array<{ step: string; label: string }> = [
  { step: 'budget',    label: 'Budget' },
  { step: 'timeline',  label: 'Timeline' },
  { step: 'financing', label: 'Financing' },
  { step: 'intent',    label: 'Intent' },
  { step: 'residency', label: 'Residency' },
]

const BAND_CONFIG = {
  HOT:  { emoji: '🔥', color: '#16a34a', bg: '#f0fdf4', label: 'HOT Lead' },
  WARM: { emoji: '🌡️', color: '#d97706', bg: '#fffbeb', label: 'WARM Lead' },
  COLD: { emoji: '❄️', color: '#2563eb', bg: '#eff6ff', label: 'COLD Lead' },
}

export default function WhatsAppDemoPage() {
  const { messages, step, isTyping, isDone, score, band, sendMessage, restart } = useWhatsAppDemo()

  const currentStepIndex = STEPS.findIndex(s => s.step === step)
  const progressIndex = isDone ? STEPS.length : Math.max(currentStepIndex, 0)
  const bandConf = BAND_CONFIG[band]

  return (
    <div
      className={plusJakarta.variable}
      style={{
        fontFamily: 'var(--font-jakarta), sans-serif',
        minHeight: '100vh',
        background: '#F2F4F7',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        gap: 28,
      }}
    >
      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: '#E8F8F0', color: '#128C7E',
        padding: '6px 14px', borderRadius: 20,
        fontSize: 12, fontWeight: 700,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: wa, display: 'inline-block' }} />
        Live Demo — WhatsApp Automation
      </div>

      {/* Heading */}
      <div style={{ textAlign: 'center', maxWidth: 500 }}>
        <h1 style={{ fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, color: dark, margin: '0 0 8px' }}>
          You just enquired about a 2BR in Dubai Marina.
        </h1>
        <p style={{ fontSize: 14, color: muted, margin: 0 }}>
          The bot is already responding. Type your answers below.
        </p>
      </div>

      {/* Phone */}
      <WhatsAppPhone
        messages={messages}
        isTyping={isTyping}
        onSend={sendMessage}
        disabled={isDone}
      />

      {/* Progress dots */}
      {!isDone && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {STEPS.map((s, i) => (
              <div
                key={s.step}
                title={s.label}
                style={{
                  width: i < progressIndex ? 20 : 8,
                  height: 6,
                  borderRadius: 3,
                  background: i < progressIndex ? wa : '#DDE3EC',
                  transition: 'all 0.3s',
                }}
              />
            ))}
          </div>
          {currentStepIndex >= 0 && (
            <div style={{ fontSize: 11, color: muted }}>
              Question {Math.min(progressIndex + 1, STEPS.length)} of {STEPS.length}
            </div>
          )}
        </div>
      )}

      {/* Score reveal when done */}
      {isDone && score > 0 && (
        <div style={{
          background: bandConf.bg,
          border: `1.5px solid ${bandConf.color}22`,
          borderRadius: 16,
          padding: '20px 28px',
          textAlign: 'center',
          maxWidth: 300,
          width: '100%',
        }}>
          <div style={{ fontSize: 28, marginBottom: 6 }}>{bandConf.emoji}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: bandConf.color }}>{score}/88</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: bandConf.color, marginBottom: 12 }}>
            {bandConf.label}
          </div>
          <p style={{ fontSize: 12, color: muted, margin: '0 0 16px' }}>
            This is the score Ahmed&apos;s dashboard just received for your enquiry.
          </p>
          <a
            href="/contact-sales"
            style={{
              display: 'block', background: wa, color: '#fff',
              padding: '10px 20px', borderRadius: 8, textDecoration: 'none',
              fontSize: 13, fontWeight: 700, marginBottom: 10,
            }}
          >
            Want this for your agency? →
          </a>
          <button
            onClick={restart}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: muted, textDecoration: 'underline',
              fontFamily: 'var(--font-jakarta), sans-serif',
            }}
          >
            Restart demo
          </button>
        </div>
      )}

      {/* Powered by */}
      <div style={{ fontSize: 11, color: '#94A3B8' }}>
        Powered by <strong style={{ color: muted }}>Enlista</strong> · WhatsApp Automation
      </div>
    </div>
  )
}
