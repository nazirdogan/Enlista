'use client'

import { useState } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

// ─── Design tokens (matches site exactly) ─────────────────────────────────────
const c = {
  bg: '#F2F4F7',
  white: '#FFFFFF',
  dark: '#0F1829',
  darker: '#0A1120',
  blue: '#1D4ED8',
  blueLight: '#3B82F6',
  bluePale: '#EFF6FF',
  text: '#1E293B',
  muted: '#64748B',
  border: '#DDE3EC',
  green: '#059669',
  greenPale: '#ECFDF5',
  amber: '#D97706',
  wa: '#25D366',       // WhatsApp brand green
  waDark: '#128C7E',   // WhatsApp dark green
  waPale: '#E8F8F0',   // WhatsApp pale
}

// ─── Shared micro-components ──────────────────────────────────────────────────

function Badge({ children, variant = 'blue', style: s }: {
  children: React.ReactNode; variant?: 'blue' | 'green' | 'wa' | 'amber'; style?: React.CSSProperties
}) {
  const map = {
    blue:  { background: c.bluePale,  color: c.blue  },
    green: { background: c.greenPale, color: c.green },
    wa:    { background: c.waPale,    color: c.waDark },
    amber: { background: '#FFFBEB',   color: c.amber },
  }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      ...map[variant], ...s }}>
      {children}
    </span>
  )
}

function SectionLabel({ children, color = c.blue }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em',
      textTransform: 'uppercase', color, display: 'block', marginBottom: 10 }}>
      {children}
    </span>
  )
}

function BentoCard({ children, style: s, className }: {
  children: React.ReactNode; style?: React.CSSProperties; className?: string
}) {
  return (
    <div className={className} style={{ background: c.white, border: `1px solid ${c.border}`,
      borderRadius: 12, padding: 24, transition: 'all 0.25s', ...s }}>
      {children}
    </div>
  )
}

// WhatsApp icon SVG
function WaIcon({ size = 20, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

// ─── Flow diagram node ─────────────────────────────────────────────────────────
function FlowNode({ icon, title, sub, accent = c.blue, step }: {
  icon: string; title: string; sub: string; accent?: string; step: number
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: 1, minWidth: 120 }}>
      <div style={{ position: 'relative' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: accent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, boxShadow: `0 4px 16px ${accent}44` }}>
          {icon}
        </div>
        <div style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20,
          borderRadius: '50%', background: c.dark, color: c.white,
          fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${c.darker}` }}>
          {step}
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: c.white, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{sub}</div>
      </div>
    </div>
  )
}

function FlowArrow() {
  return (
    <div className="flow-arrow" style={{ display: 'flex', alignItems: 'center', paddingBottom: 28, flexShrink: 0 }}>
      <svg width="32" height="16" viewBox="0 0 32 16">
        <line x1="0" y1="8" x2="24" y2="8" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="4 3"/>
        <polygon points="24,4 32,8 24,12" fill="rgba(255,255,255,0.25)"/>
      </svg>
    </div>
  )
}

// ─── Chat bubble ──────────────────────────────────────────────────────────────
function ChatBubble({ text, sender, time }: { text: string; sender: 'bot' | 'lead'; time: string }) {
  const isBot = sender === 'bot'
  return (
    <div style={{ display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end', marginBottom: 8 }}>
      <div style={{
        maxWidth: '85%',
        background: isBot ? c.white : '#DCF8C6',
        borderRadius: isBot ? '2px 12px 12px 12px' : '12px 2px 12px 12px',
        padding: '8px 12px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
      }}>
        <div style={{ fontSize: 12, color: '#1a1a1a', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{text}</div>
        <div style={{ fontSize: 10, color: '#999', textAlign: 'right', marginTop: 2 }}>{time} ✓✓</div>
      </div>
    </div>
  )
}

// ─── Step card for flow detail ─────────────────────────────────────────────────
function StepCard({ n, role, message, roleColor }: { n: string; role: string; message: string; roleColor: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
        background: roleColor, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', marginTop: 2 }}>
        {n}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: roleColor, textTransform: 'uppercase',
          letterSpacing: '0.1em', marginBottom: 4 }}>{role}</div>
        <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8,
          padding: '10px 14px', fontSize: 13, color: c.text, lineHeight: 1.6 }}>
          {message}
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function WhatsAppAutomationPage() {
  const [activeFlow, setActiveFlow] = useState<'qualify' | 'book'>('qualify')

  return (
    <div className={plusJakarta.variable} style={{
      fontFamily: 'var(--font-jakarta), sans-serif',
      fontWeight: 300,
      fontSize: 14,
      lineHeight: 1.75,
      background: c.bg,
      color: c.text,
    }}>

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav style={{
        background: c.white,
        borderBottom: `1px solid ${c.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        padding: '12px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <a href="/home" style={{ fontWeight: 800, fontSize: 17, color: c.dark, textDecoration: 'none' }}>
            Enlist<span style={{ color: c.blue }}>a</span>
          </a>
          <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
            {[['Platform', '/home#features'], ['Pricing', '/pricing'], ['WhatsApp', '#how-it-works']].map(([label, href]) => (
              <a key={label} href={href} style={{ color: label === 'WhatsApp' ? c.wa : c.muted,
                padding: '6px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: label === 'WhatsApp' ? 600 : 400 }}>
                {label}
              </a>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/auth" style={{ display: 'inline-block', border: `1.5px solid ${c.border}`,
            color: c.text, padding: '10px 24px', fontWeight: 500, fontSize: 13,
            borderRadius: 6, textDecoration: 'none' }}>
            Login
          </a>
          <a href="/contact-sales" style={{ display: 'inline-block', background: c.blue,
            color: 'white', padding: '10px 24px', fontWeight: 600, fontSize: 13,
            borderRadius: 6, textDecoration: 'none' }}>
            Contact Sales
          </a>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section style={{ padding: '64px 24px 48px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 56, alignItems: 'center' }}>

          {/* Left */}
          <div>
            <Badge variant="wa" style={{ marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.wa, display: 'inline-block' }} />
              New Feature — WhatsApp Automation
            </Badge>

            <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1,
              color: c.dark, margin: '0 0 20px' }}>
              Your listings,{' '}
              <span style={{ color: c.wa }}>followed up</span>{' '}
              instantly.
            </h1>

            <p style={{ fontSize: 16, color: c.muted, lineHeight: 1.8, margin: '0 0 32px', maxWidth: 480 }}>
              Enlista now automatically qualifies every lead and books viewings over WhatsApp — the moment someone enquires about your listing. No manual chasing. No missed deals.
            </p>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 32, marginBottom: 36, flexWrap: 'wrap' }}>
              {[
                ['< 30 sec', 'first reply time'],
                ['5 questions', 'to qualify a lead'],
                ['24 / 7', 'automated follow-up'],
              ].map(([num, label]) => (
                <div key={num}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: c.dark }}>{num}</div>
                  <div style={{ fontSize: 12, color: c.muted }}>{label}</div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a href="/contact-sales" style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
                background: c.wa, color: 'white', padding: '13px 28px',
                fontWeight: 600, fontSize: 14, borderRadius: 8, textDecoration: 'none',
                boxShadow: `0 4px 16px ${c.wa}44` }}>
                <WaIcon size={16} />
                Book a Demo
              </a>
              <a href="#how-it-works" style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
                border: `1.5px solid ${c.border}`, color: c.text, padding: '13px 28px',
                fontWeight: 500, fontSize: 14, borderRadius: 8, textDecoration: 'none' }}>
                See How It Works ↓
              </a>
            </div>
          </div>

          {/* Right — phone mockup with WhatsApp chat */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 300, background: '#1a1a2e', borderRadius: 28,
              padding: '12px 12px 20px', boxShadow: '0 32px 64px rgba(0,0,0,0.35)',
              border: '3px solid #2a2a3e' }}>
              {/* Phone top notch */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                <div style={{ width: 80, height: 6, borderRadius: 4, background: '#2a2a3e' }} />
              </div>
              {/* WhatsApp header */}
              <div style={{ background: c.waDark, borderRadius: '12px 12px 0 0',
                padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: c.wa,
                  display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <WaIcon size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Enlista Bot</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>● online</div>
                </div>
              </div>
              {/* Chat area */}
              <div style={{ background: '#ECE5DD', padding: '12px 10px', minHeight: 380,
                borderRadius: '0 0 12px 12px', overflowY: 'auto' }}>
                <ChatBubble sender="bot" time="9:01 AM"
                  text={"Hi! I'm the virtual assistant for Ahmed Al Mansoori 🏙️\n\nI saw you enquired about the 2BR in Dubai Marina. Quick question — what's your budget range?\n\n1. Below AED 1.9M\n2. AED 1.9M–2.2M\n3. Above AED 2.2M\n\nReply with 1, 2 or 3."} />
                <ChatBubble sender="lead" time="9:03 AM" text="2" />
                <ChatBubble sender="bot" time="9:03 AM"
                  text={"Perfect match! 🎯 Are you a cash buyer or planning a mortgage?"} />
                <ChatBubble sender="lead" time="9:04 AM" text="Cash buyer" />
                <ChatBubble sender="bot" time="9:04 AM"
                  text={"Great! Ahmed will be in touch within 30 mins.\n\nWould you like to book a viewing now?\n\nReply BOOK to choose a slot 📅"} />
                <ChatBubble sender="lead" time="9:05 AM" text="BOOK" />
                <ChatBubble sender="bot" time="9:05 AM"
                  text={"Available this week:\n\n1. Mon 7 Apr — 10:00 AM\n2. Mon 7 Apr — 3:00 PM\n3. Tue 8 Apr — 11:00 AM\n\nReply with your preferred slot."} />
              </div>
              {/* Lead score pill */}
              <div style={{ margin: '10px 4px 0', background: '#1E293B', borderRadius: 10, padding: '8px 14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Lead score</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#22c55e',
                  background: 'rgba(34,197,94,0.12)', padding: '2px 10px', borderRadius: 12 }}>
                  🔥 HOT — 92/100
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works (flowchart) ─────────────────────────────────────────── */}
      <section id="how-it-works" style={{ background: c.dark, padding: '72px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <SectionLabel color={c.wa}>End-to-End Automation</SectionLabel>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#fff', margin: '0 0 14px' }}>
              How It Works
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', maxWidth: 560, margin: '0 auto' }}>
              From the moment a lead touches your listing to a confirmed viewing — fully automated.
            </p>
          </div>

          {/* Flow diagram */}
          <div className="how-it-works-steps" style={{ display: 'flex', alignItems: 'flex-start',
            justifyContent: 'center', gap: 0, flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: 8 }}>

            <FlowNode step={1} icon="📲" accent={c.blueLight}
              title="Enquiry Received"
              sub={"Lead contacts via\nBayut / PF / WA link"} />
            <FlowArrow />
            <FlowNode step={2} icon="🤖" accent={c.wa}
              title="Bot Greets Lead"
              sub={"Auto-reply within\n30 seconds"} />
            <FlowArrow />
            <FlowNode step={3} icon="❓" accent={c.wa}
              title="5 Quick Questions"
              sub={"Budget, timeline,\nfinancing, intent"} />
            <FlowArrow />
            <FlowNode step={4} icon="⚡" accent="#8B5CF6"
              title="AI Scores Lead"
              sub={"Hot / Warm / Cold\nranking"} />
            <FlowArrow />
            <FlowNode step={5} icon="🔔" accent={c.amber}
              title="Agent Notified"
              sub={"Score summary sent\nto agent's WhatsApp"} />
            <FlowArrow />
            <FlowNode step={6} icon="📅" accent={c.green}
              title="Viewing Booked"
              sub={"Lead picks a slot,\ngets confirmation"} />
            <FlowArrow />
            <FlowNode step={7} icon="✅" accent={c.green}
              title="Reminders Sent"
              sub={"Auto 24h + 2h\nbefore viewing"} />
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
            {[
              ['🤖', c.wa, 'Bot action'],
              ['👤', c.blueLight, 'Lead action'],
              ['⚡', '#8B5CF6', 'AI processing'],
              ['🔔', c.amber, 'Agent alert'],
              ['✅', c.green, 'Completed'],
            ].map(([, color, label]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color as string }} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Two Flows (tabbed) ───────────────────────────────────────────── */}
      <section style={{ padding: '72px 24px', background: c.bg }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <SectionLabel>Automation Flows</SectionLabel>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: c.dark, margin: '0 0 14px' }}>
              Two bots. Zero manual effort.
            </h2>
            <p style={{ fontSize: 15, color: c.muted, maxWidth: 520, margin: '0 auto' }}>
              Choose which flow runs — or enable both. Each can be customised per listing.
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 36 }}>
            {([
              ['qualify', '🎯 Lead Qualification', 'Vet every enquiry automatically'],
              ['book',    '📅 Viewing Booking',    'Schedule viewings on autopilot'],
            ] as const).map(([key, label, sub]) => (
              <button key={key} onClick={() => setActiveFlow(key)}
                style={{ padding: '12px 24px', borderRadius: 10, cursor: 'pointer',
                  background: activeFlow === key ? c.wa : c.white,
                  color: activeFlow === key ? '#fff' : c.muted,
                  fontWeight: 600, fontSize: 13,
                  border: activeFlow === key ? 'none' : `1px solid ${c.border}`,
                  boxShadow: activeFlow === key ? `0 4px 20px ${c.wa}44` : `0 1px 4px rgba(0,0,0,0.06)`,
                  transition: 'all 0.2s', fontFamily: 'var(--font-jakarta), sans-serif' }}>
                {label}
                <div style={{ fontSize: 11, fontWeight: 400, opacity: 0.7, marginTop: 2 }}>{sub}</div>
              </button>
            ))}
          </div>

          {/* Flow content */}
          {activeFlow === 'qualify' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {/* Steps */}
              <BentoCard>
                <div style={{ fontWeight: 700, fontSize: 16, color: c.dark, marginBottom: 20 }}>
                  🎯 Qualification Flow
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <StepCard n="1" roleColor={c.wa} role="Bot"
                    message="Hello! I'm the virtual assistant for [Agent Name]. You enquired about the [Property] in [Area]. May I ask a few quick questions? Reply YES to continue." />
                  <StepCard n="2" roleColor={c.wa} role="Bot"
                    message="What's your approximate budget? 1. Below AED [price] · 2. In range · 3. Above range · 4. Discuss further" />
                  <StepCard n="3" roleColor={c.wa} role="Bot"
                    message="When are you looking to complete? 1. Within 1 month · 2. 1–3 months · 3. 3–6 months · 4. Just exploring" />
                  <StepCard n="4" roleColor={c.wa} role="Bot"
                    message="Are you a cash buyer or planning a mortgage?" />
                  <StepCard n="5" roleColor={c.wa} role="Bot"
                    message="Is this for personal use, investment, or a holiday home?" />
                  <StepCard n="6" roleColor="#8B5CF6" role="AI Scoring"
                    message="Lead scored. Score = 88/100 → HOT. Agent notified via WhatsApp with full summary." />
                </div>
              </BentoCard>

              {/* Score breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <BentoCard>
                  <div style={{ fontWeight: 700, fontSize: 15, color: c.dark, marginBottom: 16 }}>
                    ⚡ Lead Scoring Engine
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      ['Budget', 'Matches listing range', 30, c.green],
                      ['Timeline', 'Within 3 months', 20, c.green],
                      ['Financing', 'Cash buyer', 20, c.green],
                      ['Intent', 'Investment', 15, c.amber],
                      ['Eligibility', 'UAE Resident', 3, c.amber],
                    ].map(([label, , pts, col]) => (
                      <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: 12, color: c.muted, width: 80, flexShrink: 0 }}>{label}</div>
                        <div style={{ flex: 1, height: 6, background: c.border, borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${(pts as number) / 30 * 100}%`,
                            background: col as string, borderRadius: 3 }} />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: col as string, width: 36, textAlign: 'right' }}>
                          +{pts}
                        </div>
                      </div>
                    ))}
                    <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 10, marginTop: 4,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>Total Score</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: c.green }}>88/100</div>
                    </div>
                  </div>
                </BentoCard>

                <BentoCard>
                  <div style={{ fontWeight: 700, fontSize: 15, color: c.dark, marginBottom: 12 }}>
                    🔔 Agent Gets This Notification
                  </div>
                  <div style={{ background: c.dark, borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: c.wa, marginBottom: 8, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      🔥 HOT Lead — Enlista
                    </div>
                    {[
                      ['Property', 'Marina Heights 2BR'],
                      ['Lead', 'Mohammed Al Rashidi'],
                      ['Budget', '✅ In range (AED 2M)'],
                      ['Timeline', '✅ 1–3 months'],
                      ['Financing', '✅ Cash buyer'],
                      ['Score', '88/100 — HOT'],
                    ].map(([k, v]) => (
                      <div key={k as string} style={{ display: 'flex', gap: 8, fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: 'rgba(255,255,255,0.4)', width: 70, flexShrink: 0 }}>{k}</span>
                        <span style={{ color: '#fff', fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 10, padding: '8px 14px', background: c.wa,
                      borderRadius: 6, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#fff' }}>
                      Open in Enlista Dashboard →
                    </div>
                  </div>
                </BentoCard>
              </div>
            </div>
          )}

          {activeFlow === 'book' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              {/* Steps */}
              <BentoCard>
                <div style={{ fontWeight: 700, fontSize: 16, color: c.dark, marginBottom: 20 }}>
                  📅 Booking Flow
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <StepCard n="1" roleColor={c.wa} role="Bot"
                    message="Great! Let's book your viewing of [Property Address]. [Agent Name] has these slots available this week — reply with your preferred number." />
                  <StepCard n="2" roleColor={c.wa} role="Bot"
                    message="1. Mon 7 Apr — 10:00 AM · 2. Mon 7 Apr — 3:00 PM · 3. Tue 8 Apr — 11:00 AM · 4. Wed 9 Apr — 2:00 PM · 5. More options" />
                  <StepCard n="3" roleColor={c.blueLight} role="Lead"
                    message={"\"2\""} />
                  <StepCard n="4" roleColor={c.wa} role="Bot"
                    message="Confirming: 📍 [Address] · 📅 Mon 7 Apr · ⏰ 3:00 PM · 🧑‍💼 [Agent Name]. Reply CONFIRM or CHANGE." />
                  <StepCard n="5" roleColor={c.green} role="Confirmed"
                    message="✅ Booked! Calendar invite sent. Reminders will be sent 24h and 2h before your viewing." />
                  <StepCard n="6" roleColor={c.green} role="Post-Viewing"
                    message="Hope the viewing went well! Would you like to: 1. Book a second viewing · 2. Get pricing support · 3. Not interested" />
                </div>
              </BentoCard>

              {/* Calendar + reminders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <BentoCard>
                  <div style={{ fontWeight: 700, fontSize: 15, color: c.dark, marginBottom: 16 }}>
                    📆 Calendar Integrations
                  </div>
                  {[
                    ['🔵', 'Google Calendar', 'Real-time sync, auto-invite sent to lead'],
                    ['🟦', 'Microsoft Outlook', 'Full 365 / corporate calendar support'],
                    ['⚙️', 'Manual Availability', 'Set weekly slots directly in Enlista'],
                    ['📩', 'iCal (.ics)', 'Lead gets calendar file on confirmation'],
                  ].map(([icon, name, desc]) => (
                    <div key={name as string} style={{ display: 'flex', gap: 12, alignItems: 'flex-start',
                      padding: '10px 0', borderBottom: `1px solid ${c.border}` }}>
                      <div style={{ fontSize: 18, flexShrink: 0 }}>{icon}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: c.dark }}>{name}</div>
                        <div style={{ fontSize: 12, color: c.muted }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </BentoCard>

                <BentoCard style={{ background: c.dark }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', marginBottom: 14 }}>
                    ⏰ Automated Reminders
                  </div>
                  {[
                    ['At booking', 'Confirmation + calendar invite', c.wa],
                    ['T – 24 hours', '"Viewing tomorrow at 3:00 PM — reply CONFIRM or RESCHEDULE"', c.blueLight],
                    ['T – 2 hours', '"Your viewing is in 2 hours at [address]"', c.blueLight],
                    ['T + 2 hours', 'Post-viewing follow-up with next steps', c.green],
                  ].map(([time, msg, col]) => (
                    <div key={time as string} style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: col as string,
                        flexShrink: 0, marginTop: 5 }} />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: col as string }}>{time}</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{msg}</div>
                      </div>
                    </div>
                  ))}
                </BentoCard>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── What's Included (bento features) ───────────────────────────────────── */}
      <section style={{ padding: '72px 24px', background: c.white, borderTop: `1px solid ${c.border}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <SectionLabel>Everything You Get</SectionLabel>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: c.dark, margin: 0 }}>
              Built for Dubai agents.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {[
              {
                icon: '⚡',
                title: '< 30-second first reply',
                desc: 'Leads get an instant response the moment they enquire — before any competitor agent can call back.',
                accent: c.wa,
              },
              {
                icon: '🌍',
                title: 'English + Arabic',
                desc: 'Bot detects the lead\'s language and mirrors it. All messages are bilingual-ready, consistent with your listings.',
                accent: c.blue,
              },
              {
                icon: '🎯',
                title: 'Smart lead scoring',
                desc: 'Each lead is automatically scored Hot, Warm, or Cold based on budget fit, timeline, financing, and intent.',
                accent: '#8B5CF6',
              },
              {
                icon: '📅',
                title: 'Automated viewing booking',
                desc: 'Leads pick a slot from your real availability. Confirmation and reminders are sent automatically.',
                accent: c.green,
              },
              {
                icon: '🔔',
                title: 'Instant agent alerts',
                desc: 'Hot leads trigger an immediate push notification and WhatsApp summary card to the agent — score, answers, property.',
                accent: c.amber,
              },
              {
                icon: '💬',
                title: 'Manual takeover anytime',
                desc: 'Agent clicks "Take Over" in the Enlista dashboard and steps into any conversation in real time.',
                accent: c.blueLight,
              },
              {
                icon: '📊',
                title: 'Leads inbox + analytics',
                desc: 'All conversations, lead scores, and booking status in one place. Filter, search, and export.',
                accent: c.blue,
              },
              {
                icon: '⚙️',
                title: 'Per-listing customisation',
                desc: 'Enable or disable the bot, edit qualification questions, and configure available slots — per property.',
                accent: c.muted,
              },
            ].map(({ icon, title, desc, accent }) => (
              <BentoCard key={title} className="bento-hover" style={{ cursor: 'default' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.dark, marginBottom: 6 }}>{title}</div>
                <div style={{ fontSize: 13, color: c.muted, lineHeight: 1.7 }}>{desc}</div>
                <div style={{ marginTop: 14, height: 2, width: 32, borderRadius: 2, background: accent }} />
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────────────── */}
      <section id="pricing" style={{ padding: '72px 24px', background: c.bg }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <SectionLabel>Pricing</SectionLabel>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: c.dark, margin: '0 0 14px' }}>
              Add automation to your Enlista plan
            </h2>
            <p style={{ fontSize: 15, color: c.muted, maxWidth: 480, margin: '0 auto' }}>
              WhatsApp Automation is available as a Pro-tier add-on. Start with unlimited listing generation, then upgrade to add 24/7 automated follow-up.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {/* Pro Plan */}
            <div style={{ background: c.white, border: `1.5px solid ${c.border}`,
              borderRadius: 20, padding: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
                textTransform: 'uppercase', color: c.muted, marginBottom: 8 }}>Enlista Pro</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: c.dark, lineHeight: 1 }}>
                $99<span style={{ fontSize: 16, fontWeight: 400, color: c.muted }}>/mo</span>
              </div>
              <div style={{ fontSize: 13, color: c.muted, marginBottom: 24, marginTop: 6 }}>
                Unlimited listings + everything you need to publish
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Unlimited listing credits', 'EN + AR bilingual output', 'RERA compliance check',
                  'WhatsApp & Instagram copy', 'Priority support'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: 10, fontSize: 13, color: c.text }}>
                    <span style={{ color: c.green, fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <a href="/pricing" style={{ display: 'block', marginTop: 24, padding: '12px 20px',
                textAlign: 'center', border: `1.5px solid ${c.border}`, borderRadius: 10,
                color: c.text, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                View Pro Plan
              </a>
            </div>

            {/* Pro + WhatsApp — highlighted */}
            <div style={{ background: `linear-gradient(145deg, ${c.dark} 0%, #1a2f4e 100%)`,
              border: `1.5px solid ${c.wa}33`, borderRadius: 20, padding: 32,
              boxShadow: `0 16px 48px rgba(37,211,102,0.2)`, position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
                <Badge variant="wa">⭐ Most Popular</Badge>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
                textTransform: 'uppercase', color: c.wa, marginBottom: 8 }}>Pro + WhatsApp</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
                $199<span style={{ fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.45)' }}>/mo</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24, marginTop: 6 }}>
                Everything in Pro + full WhatsApp automation
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Everything in Pro', 'Lead qualification bot', 'Automated viewing booking',
                  'Smart lead scoring (Hot/Warm/Cold)', 'Leads inbox + analytics dashboard',
                  'EN + AR bot messages', 'Up to 1,000 automated conversations/mo'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: 10, fontSize: 13,
                    color: f === 'Everything in Pro' ? 'rgba(255,255,255,0.5)' : '#fff' }}>
                    <span style={{ color: c.wa, fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <a href="/contact-sales" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, marginTop: 24, padding: '12px 20px', background: c.wa,
                borderRadius: 10, color: '#fff', fontWeight: 600, fontSize: 13,
                textDecoration: 'none', boxShadow: `0 4px 16px ${c.wa}44` }}>
                <WaIcon size={14} />
                Contact Sales
              </a>
            </div>

            {/* Agency / Enterprise */}
            <div style={{ background: c.white, border: `1.5px solid ${c.border}`,
              borderRadius: 20, padding: 32 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
                textTransform: 'uppercase', color: c.muted, marginBottom: 8 }}>Agency / Enterprise</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: c.dark, lineHeight: 1 }}>
                Custom
              </div>
              <div style={{ fontSize: 13, color: c.muted, marginBottom: 24, marginTop: 6 }}>
                For brokerages with 10+ agents
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['Multi-agent team seats', 'White-label branded bot', 'Agency-level reporting',
                  'Unlimited conversations', 'Dedicated account manager', 'Custom qualification flows'].map(f => (
                  <div key={f} style={{ display: 'flex', gap: 10, fontSize: 13, color: c.text }}>
                    <span style={{ color: c.blue, fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <a href="/contact-sales" style={{ display: 'block', marginTop: 24, padding: '12px 20px',
                textAlign: 'center', background: c.bluePale, borderRadius: 10,
                color: c.blue, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                Talk to Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────────────── */}
      <section style={{ background: c.dark, padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>
            <WaIcon size={48} color={c.wa} />
          </div>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, color: '#fff',
            lineHeight: 1.1, margin: '0 0 20px' }}>
            Stop losing leads to slow response times.
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8,
            margin: '0 0 36px' }}>
            Every hour your listing sits without an instant reply is a deal going to another agent. Enlista&apos;s WhatsApp automation replies in 30 seconds — while you sleep.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/contact-sales" style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
              background: c.wa, color: '#fff', padding: '15px 32px',
              fontWeight: 600, fontSize: 15, borderRadius: 10, textDecoration: 'none',
              boxShadow: `0 8px 24px ${c.wa}55` }}>
              <WaIcon size={18} />
              Book a Demo with Sales
            </a>
            <a href="/pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1.5px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)',
              padding: '15px 32px', fontWeight: 500, fontSize: 15, borderRadius: 10,
              textDecoration: 'none' }}>
              View All Plans →
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────────── */}
      <footer style={{ background: c.darker, padding: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: '#fff' }}>
          Enlist<span style={{ color: c.blue }}>a</span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          © 2026 Enlista. Built for Dubai&apos;s real estate agents.
        </div>
        <div style={{ display: 'flex', gap: 20, fontSize: 12 }}>
          {[['Home', '/home'], ['Pricing', '/pricing'], ['Contact Sales', '/contact-sales']].map(([label, href]) => (
            <a key={label} href={href} style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
      </footer>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          .flow-arrow { display: none !important; }
          .how-it-works-steps { flex-direction: column !important; align-items: center !important; gap: 16px !important; }
        }
      `}</style>
    </div>
  )
}
