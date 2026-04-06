# WhatsApp Interactive Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build two shareable demo pages (`/demo/whatsapp` and `/demo/whatsapp-story`) where a prospect types replies into a realistic WhatsApp phone mockup and the bot qualifies them through 5 questions, then shows their lead score.

**Architecture:** Pure client-side React — no backend. A conversation state machine in `lib/demo/whatsapp-conversation.ts` drives the decision tree and scoring. A custom hook `lib/demo/use-whatsapp-demo.ts` manages message state. A shared `WhatsAppPhone` component renders the UI. Page A wraps the phone in a clean centred layout; Page C wraps it in a 3-act story arc.

**Tech Stack:** Next.js 14 App Router, TypeScript (strict), React useState/useCallback/useRef/useEffect, Vitest for tests, Plus Jakarta Sans font, inline styles (matching existing site patterns).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/demo/whatsapp-conversation.ts` | Create | Decision tree, answer matching, scoring, types |
| `lib/demo/__tests__/whatsapp-conversation.test.ts` | Create | Unit tests for conversation engine |
| `lib/demo/use-whatsapp-demo.ts` | Create | React hook — message state, typing delay, restart |
| `components/demo/WhatsAppPhone.tsx` | Create | Phone frame + bubbles + input bar |
| `app/(public)/demo/whatsapp/page.tsx` | Create | Page A — immersive phone demo |
| `app/(public)/demo/whatsapp-story/page.tsx` | Create | Page C — 3-act story arc |
| `.gitignore` | Modify | Add `.superpowers/` |

---

## Task 1: Conversation Engine

**Files:**
- Create: `lib/demo/whatsapp-conversation.ts`
- Create: `lib/demo/__tests__/whatsapp-conversation.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `lib/demo/__tests__/whatsapp-conversation.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  processAnswer,
  calculateScore,
  getScoreBand,
  getFirstMessage,
  formatTime,
} from '../whatsapp-conversation'

describe('getFirstMessage', () => {
  it('mentions Dubai Marina 2BR', () => {
    expect(getFirstMessage()).toContain('Dubai Marina')
  })
})

describe('processAnswer — budget', () => {
  it('gives 30 points for in-range reply "2"', () => {
    const r = processAnswer('budget', '2')
    expect(r.points).toBe(30)
    expect(r.nextStep).toBe('timeline')
  })
  it('gives 30 points for "range" keyword', () => {
    expect(processAnswer('budget', 'In range').points).toBe(30)
  })
  it('gives 10 points for below-range reply "1"', () => {
    expect(processAnswer('budget', '1').points).toBe(10)
  })
  it('gives 5 points for above-range reply "3"', () => {
    expect(processAnswer('budget', '3').points).toBe(5)
  })
  it('routes to timeline step', () => {
    expect(processAnswer('budget', '2').nextStep).toBe('timeline')
  })
})

describe('processAnswer — timeline', () => {
  it('gives 20 points for reply "1" (within 1 month)', () => {
    expect(processAnswer('timeline', '1').points).toBe(20)
  })
  it('gives 20 points for reply "2" (1–3 months)', () => {
    expect(processAnswer('timeline', '2').points).toBe(20)
  })
  it('gives 10 points for reply "3" (3–6 months)', () => {
    expect(processAnswer('timeline', '3').points).toBe(10)
  })
  it('gives 0 points for "just exploring"', () => {
    expect(processAnswer('timeline', 'just exploring').points).toBe(0)
  })
  it('routes to financing step', () => {
    expect(processAnswer('timeline', '1').nextStep).toBe('financing')
  })
})

describe('processAnswer — financing', () => {
  it('gives 20 points for cash buyer', () => {
    expect(processAnswer('financing', 'cash').points).toBe(20)
    expect(processAnswer('financing', 'Cash buyer').points).toBe(20)
  })
  it('gives 10 points for mortgage', () => {
    expect(processAnswer('financing', 'mortgage').points).toBe(10)
  })
  it('routes to intent step', () => {
    expect(processAnswer('financing', 'cash').nextStep).toBe('intent')
  })
})

describe('processAnswer — intent', () => {
  it('gives 15 points for any intent answer', () => {
    expect(processAnswer('intent', 'investment').points).toBe(15)
    expect(processAnswer('intent', 'personal use').points).toBe(15)
    expect(processAnswer('intent', 'holiday home').points).toBe(15)
  })
  it('routes to residency step', () => {
    expect(processAnswer('intent', 'investment').nextStep).toBe('residency')
  })
})

describe('processAnswer — residency', () => {
  it('gives 3 points for yes', () => {
    expect(processAnswer('residency', 'yes').points).toBe(3)
    expect(processAnswer('residency', 'yeah').points).toBe(3)
    expect(processAnswer('residency', 'y').points).toBe(3)
  })
  it('gives 0 points for no', () => {
    expect(processAnswer('residency', 'no').points).toBe(0)
  })
  it('routes to closing step', () => {
    expect(processAnswer('residency', 'yes').nextStep).toBe('closing')
  })
})

describe('processAnswer — closing', () => {
  it('routes to book_slots when user says BOOK', () => {
    expect(processAnswer('closing', 'BOOK').nextStep).toBe('book_slots')
  })
  it('routes to book_slots when user says yes', () => {
    expect(processAnswer('closing', 'yes').nextStep).toBe('book_slots')
  })
  it('routes to done when user declines', () => {
    expect(processAnswer('closing', 'no thanks').nextStep).toBe('done')
  })
})

describe('processAnswer — book_slots', () => {
  it('routes to done after picking a slot', () => {
    expect(processAnswer('book_slots', '1').nextStep).toBe('done')
    expect(processAnswer('book_slots', '2').nextStep).toBe('done')
    expect(processAnswer('book_slots', '3').nextStep).toBe('done')
  })
  it('confirmation message contains the slot time for slot 1', () => {
    expect(processAnswer('book_slots', '1').botText).toContain('10:00 AM')
  })
  it('confirmation message contains the slot time for slot 2', () => {
    expect(processAnswer('book_slots', '2').botText).toContain('3:00 PM')
  })
  it('confirmation message contains the slot time for slot 3', () => {
    expect(processAnswer('book_slots', '3').botText).toContain('11:00 AM')
  })
})

describe('calculateScore', () => {
  it('sums all answer points', () => {
    const answers = {
      budget:    { label: 'In range', points: 30 },
      timeline:  { label: '1–3 months', points: 20 },
      financing: { label: 'Cash buyer', points: 20 },
      intent:    { label: 'Investment', points: 15 },
      residency: { label: 'UAE Resident', points: 3 },
    }
    expect(calculateScore(answers)).toBe(88)
  })
  it('returns 0 for empty answers', () => {
    expect(calculateScore({})).toBe(0)
  })
})

describe('getScoreBand', () => {
  it('returns HOT for score >= 68', () => {
    expect(getScoreBand(88)).toBe('HOT')
    expect(getScoreBand(68)).toBe('HOT')
  })
  it('returns WARM for 40–67', () => {
    expect(getScoreBand(67)).toBe('WARM')
    expect(getScoreBand(40)).toBe('WARM')
  })
  it('returns COLD for < 40', () => {
    expect(getScoreBand(39)).toBe('COLD')
    expect(getScoreBand(0)).toBe('COLD')
  })
})

describe('formatTime', () => {
  it('returns a string matching H:MM AM/PM', () => {
    expect(formatTime()).toMatch(/^\d{1,2}:\d{2} (AM|PM)$/)
  })
})
```

- [ ] **Step 2: Run tests to confirm they all fail**

```bash
npx vitest run lib/demo/__tests__/whatsapp-conversation.test.ts
```

Expected: Multiple FAIL — "Cannot find module '../whatsapp-conversation'"

- [ ] **Step 3: Create the conversation engine**

Create `lib/demo/whatsapp-conversation.ts`:

```typescript
// ─── Types ────────────────────────────────────────────────────────────────────

export type QuestionStep =
  | 'budget'
  | 'timeline'
  | 'financing'
  | 'intent'
  | 'residency'
  | 'closing'
  | 'book_slots'
  | 'done'

export type Sender = 'bot' | 'lead'

export interface DemoMessage {
  id: string
  sender: Sender
  text: string
  time: string
}

export interface AnswerEntry {
  label: string
  points: number
}

export type AnswerRecord = Partial<Record<QuestionStep, AnswerEntry>>

export interface ConversationResult {
  nextStep: QuestionStep
  botText: string
  points: number
  answerLabel: string
}

// ─── Static content ────────────────────────────────────────────────────────────

export function getFirstMessage(): string {
  return 'Hi! 👋 You just enquired about a *2BR in Dubai Marina*. I have a few quick questions to help match you with our agent.\n\nWhat\'s your budget?\n\n1️⃣ Below AED 1.9M\n2️⃣ AED 1.9M – 2.2M\n3️⃣ Above AED 2.2M'
}

export function formatTime(): string {
  const now = new Date()
  const h = now.getHours()
  const m = now.getMinutes().toString().padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m} ${ampm}`
}

// ─── Decision tree ─────────────────────────────────────────────────────────────

export function processAnswer(step: QuestionStep, input: string): ConversationResult {
  const raw = input.trim().toLowerCase()

  switch (step) {
    case 'budget': {
      const inRange = raw === '2' || raw.includes('range') || raw.includes('1.9') || raw.includes('2m') || raw.includes('2.2')
      const below = raw === '1' || raw.includes('below') || raw.includes('under') || raw.includes('less')
      const points = inRange ? 30 : below ? 10 : 5
      const prefix = inRange ? 'Perfect match! 🎯' : below ? 'Got it.' : 'Noted!'
      const label = inRange ? 'In range (AED 1.9–2.2M)' : below ? 'Below AED 1.9M' : 'Above AED 2.2M'
      return {
        nextStep: 'timeline',
        botText: `${prefix} When are you looking to complete?\n\n1️⃣ Within 1 month\n2️⃣ 1–3 months\n3️⃣ 3–6 months\n4️⃣ Just exploring`,
        points,
        answerLabel: label,
      }
    }

    case 'timeline': {
      const fast = raw === '1' || raw.includes('1 month') || raw.includes('one month') || raw.includes('asap') || raw.includes('urgent')
      const medium = raw === '2' || raw.includes('1–3') || raw.includes('1-3') || raw.includes('three') || raw.includes('quarter')
      const slow = raw === '3' || raw.includes('3–6') || raw.includes('3-6') || raw.includes('six') || raw.includes('half')
      const exploring = raw === '4' || raw.includes('explor') || raw.includes('just look') || raw.includes('brows')
      const points = exploring ? 0 : slow ? 10 : 20
      const label = fast ? 'Within 1 month' : medium ? '1–3 months' : slow ? '3–6 months' : 'Just exploring'
      return {
        nextStep: 'financing',
        botText: 'Thanks! Are you a cash buyer or planning a mortgage?',
        points,
        answerLabel: label,
      }
    }

    case 'financing': {
      const cash = raw.includes('cash')
      return {
        nextStep: 'intent',
        botText: 'Great! Is this for personal use, investment, or a holiday home?',
        points: cash ? 20 : 10,
        answerLabel: cash ? 'Cash buyer' : 'Mortgage',
      }
    }

    case 'intent': {
      const invest = raw.includes('invest')
      const holiday = raw.includes('holiday') || raw.includes('vacation') || raw.includes('leisure')
      const label = invest ? 'Investment' : holiday ? 'Holiday home' : 'Personal use'
      return {
        nextStep: 'residency',
        botText: 'Almost done! Are you a UAE resident? (Yes / No)',
        points: 15,
        answerLabel: label,
      }
    }

    case 'residency': {
      const yes = raw === 'y' || raw.startsWith('yes') || raw.includes('yeah') || raw.includes('yep') || raw.includes('resident')
      return {
        nextStep: 'closing',
        botText: 'Thanks! 🎯 Based on your answers, you look like a great fit for this property. Ahmed will be in touch within 30 minutes.\n\nWould you like to book a viewing now? Reply *BOOK* to pick a slot 📅',
        points: yes ? 3 : 0,
        answerLabel: yes ? 'UAE Resident' : 'Non-resident',
      }
    }

    case 'closing': {
      const wantsBook = raw.includes('book') || raw === 'yes' || raw === 'y' || raw === '1'
      if (wantsBook) {
        return {
          nextStep: 'book_slots',
          botText: 'Available this week:\n\n1️⃣ Mon 7 Apr — 10:00 AM\n2️⃣ Mon 7 Apr — 3:00 PM\n3️⃣ Tue 8 Apr — 11:00 AM\n\nReply with your preferred slot number.',
          points: 0,
          answerLabel: 'BOOK',
        }
      }
      return {
        nextStep: 'done',
        botText: 'No problem! Ahmed will be in touch soon. 👋',
        points: 0,
        answerLabel: input,
      }
    }

    case 'book_slots': {
      const slot2 = raw === '2' || (raw.includes('3') && raw.includes('pm')) || raw.includes('afternoon')
      const slot3 = raw === '3' || raw.includes('tue') || (raw.includes('11') && !raw.includes('10'))
      const slotLabel = slot3
        ? 'Tue 8 Apr — 11:00 AM'
        : slot2
        ? 'Mon 7 Apr — 3:00 PM'
        : 'Mon 7 Apr — 10:00 AM'
      return {
        nextStep: 'done',
        botText: `✅ Viewing confirmed!\n\n📍 Marina Heights, Dubai Marina\n📅 ${slotLabel}\n🧑‍💼 Agent: Ahmed Al Mansouri\n\nYou'll receive a reminder 24h before. See you there! 🏡`,
        points: 0,
        answerLabel: slotLabel,
      }
    }

    default:
      return { nextStep: 'done', botText: '', points: 0, answerLabel: '' }
  }
}

// ─── Scoring ───────────────────────────────────────────────────────────────────

export function calculateScore(answers: AnswerRecord): number {
  return Object.values(answers).reduce((sum, a) => sum + (a?.points ?? 0), 0)
}

export function getScoreBand(score: number): 'HOT' | 'WARM' | 'COLD' {
  if (score >= 68) return 'HOT'
  if (score >= 40) return 'WARM'
  return 'COLD'
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
npx vitest run lib/demo/__tests__/whatsapp-conversation.test.ts
```

Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add lib/demo/whatsapp-conversation.ts lib/demo/__tests__/whatsapp-conversation.test.ts
git commit -m "feat: add WhatsApp demo conversation engine with scoring"
```

---

## Task 2: useWhatsAppDemo Hook

**Files:**
- Create: `lib/demo/use-whatsapp-demo.ts`

- [ ] **Step 1: Create the hook**

Create `lib/demo/use-whatsapp-demo.ts`:

```typescript
'use client'

import { useState, useCallback } from 'react'
import {
  DemoMessage,
  QuestionStep,
  AnswerRecord,
  getFirstMessage,
  processAnswer,
  calculateScore,
  getScoreBand,
  formatTime,
} from './whatsapp-conversation'

export interface WhatsAppDemoState {
  messages: DemoMessage[]
  step: QuestionStep
  isTyping: boolean
  isDone: boolean
  score: number
  band: 'HOT' | 'WARM' | 'COLD'
  answers: AnswerRecord
  sendMessage: (text: string) => void
  restart: () => void
}

function makeInitialMessages(): DemoMessage[] {
  return [{ id: '0', sender: 'bot', text: getFirstMessage(), time: formatTime() }]
}

export function useWhatsAppDemo(): WhatsAppDemoState {
  const [messages, setMessages] = useState<DemoMessage[]>(makeInitialMessages)
  const [step, setStep] = useState<QuestionStep>('budget')
  const [answers, setAnswers] = useState<AnswerRecord>({})
  const [isTyping, setIsTyping] = useState(false)
  const [isDone, setIsDone] = useState(false)

  const sendMessage = useCallback(
    (input: string) => {
      if (!input.trim() || isTyping || isDone) return

      const leadMsg: DemoMessage = {
        id: `lead-${Date.now()}`,
        sender: 'lead',
        text: input.trim(),
        time: formatTime(),
      }

      setMessages(prev => [...prev, leadMsg])
      setIsTyping(true)

      const result = processAnswer(step, input)

      setTimeout(() => {
        if (result.botText) {
          const botMsg: DemoMessage = {
            id: `bot-${Date.now()}`,
            sender: 'bot',
            text: result.botText,
            time: formatTime(),
          }
          setMessages(prev => [...prev, botMsg])
        }

        setAnswers(prev => ({
          ...prev,
          [step]: { label: result.answerLabel, points: result.points },
        }))

        setIsTyping(false)
        setStep(result.nextStep)
        if (result.nextStep === 'done') setIsDone(true)
      }, 1500)
    },
    [step, isTyping, isDone],
  )

  const restart = useCallback(() => {
    setMessages(makeInitialMessages())
    setStep('budget')
    setAnswers({})
    setIsTyping(false)
    setIsDone(false)
  }, [])

  const score = calculateScore(answers)
  const band = getScoreBand(score)

  return { messages, step, isTyping, isDone, score, band, answers, sendMessage, restart }
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/demo/use-whatsapp-demo.ts
git commit -m "feat: add useWhatsAppDemo hook"
```

---

## Task 3: WhatsApp Phone Component

**Files:**
- Create: `components/demo/WhatsAppPhone.tsx`

- [ ] **Step 1: Create the component**

Create `components/demo/WhatsAppPhone.tsx`:

```typescript
'use client'

import { useRef, useEffect, useState, KeyboardEvent } from 'react'
import { DemoMessage } from '@/lib/demo/whatsapp-conversation'

interface WhatsAppPhoneProps {
  messages: DemoMessage[]
  isTyping: boolean
  onSend: (text: string) => void
  disabled?: boolean
}

const wa = '#25D366'
const waDark = '#128C7E'

function WaIcon({ size = 18, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function TypingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 8px' }}>
      {[0, 1, 2].map(i => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#999',
            animation: 'wa-bounce 1.2s infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes wa-bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
          40% { transform: scale(1.1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

function Bubble({ msg }: { msg: DemoMessage }) {
  const isBot = msg.sender === 'bot'
  // Render *bold* markdown as <strong>
  const parts = msg.text.split(/(\*[^*]+\*)/)
  return (
    <div style={{ display: 'flex', justifyContent: isBot ? 'flex-start' : 'flex-end', marginBottom: 6 }}>
      <div style={{
        maxWidth: '88%',
        background: isBot ? '#fff' : '#DCF8C6',
        borderRadius: isBot ? '2px 10px 10px 10px' : '10px 2px 10px 10px',
        padding: '7px 10px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      }}>
        <div style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
          {parts.map((p, i) =>
            p.startsWith('*') && p.endsWith('*')
              ? <strong key={i}>{p.slice(1, -1)}</strong>
              : p
          )}
        </div>
        <div style={{ fontSize: 10, color: '#999', textAlign: 'right', marginTop: 2 }}>
          {msg.time} ✓✓
        </div>
      </div>
    </div>
  )
}

export function WhatsAppPhone({ messages, isTyping, onSend, disabled }: WhatsAppPhoneProps) {
  const [input, setInput] = useState('')
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const handleSend = () => {
    if (!input.trim() || disabled) return
    onSend(input)
    setInput('')
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div style={{
      width: 300,
      background: '#1a1a2e',
      borderRadius: 32,
      padding: '12px 12px 16px',
      boxShadow: '0 32px 72px rgba(0,0,0,0.35)',
      border: '3px solid #2a2a3e',
    }}>
      {/* Notch */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
        <div style={{ width: 70, height: 5, borderRadius: 3, background: '#2a2a3e' }} />
      </div>

      {/* WA Header */}
      <div style={{
        background: waDark,
        borderRadius: '14px 14px 0 0',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: '50%', background: wa,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <WaIcon size={18} />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Enlista Bot</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)' }}>
            {isTyping ? '● typing...' : '● online'}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div
        ref={chatRef}
        style={{
          background: '#ECE5DD',
          padding: '10px 8px',
          height: 320,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          scrollBehavior: 'smooth',
        }}
      >
        {messages.map(msg => <Bubble key={msg.id} msg={msg} />)}
        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 6 }}>
            <div style={{
              background: '#fff',
              borderRadius: '2px 10px 10px 10px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}>
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div style={{
        background: '#f0f0f0',
        borderRadius: '0 0 14px 14px',
        padding: '8px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled || isTyping}
          placeholder={disabled ? 'Conversation ended' : 'Type a message...'}
          style={{
            flex: 1,
            background: '#fff',
            border: 'none',
            borderRadius: 20,
            padding: '7px 14px',
            fontSize: 12,
            color: '#1a1a1a',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled || isTyping}
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: !input.trim() || disabled || isTyping ? '#ccc' : wa,
            border: 'none',
            cursor: !input.trim() || disabled || isTyping ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
            <path d="M2 21L23 12 2 3v7l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/demo/WhatsAppPhone.tsx
git commit -m "feat: add WhatsAppPhone UI component"
```

---

## Task 4: Page A — /demo/whatsapp

**Files:**
- Create: `app/(public)/demo/whatsapp/page.tsx`

- [ ] **Step 1: Create the page**

Create `app/(public)/demo/whatsapp/page.tsx`:

```typescript
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
            This is the score Ahmed's dashboard just received for your enquiry.
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
```

- [ ] **Step 2: Visit http://localhost:3000/demo/whatsapp and verify**

Check:
- Phone renders correctly
- First bot message appears on load
- Typing a reply shows the lead bubble then a typing indicator then the bot reply
- Progress dots advance after each answer
- After Q5 the score card appears
- "Want this for your agency?" links to /contact-sales
- "Restart demo" resets the conversation

- [ ] **Step 3: Commit**

```bash
git add app/\(public\)/demo/whatsapp/page.tsx
git commit -m "feat: add Page A immersive WhatsApp demo"
```

---

## Task 5: Page C — /demo/whatsapp-story

**Files:**
- Create: `app/(public)/demo/whatsapp-story/page.tsx`

- [ ] **Step 1: Create the page**

Create `app/(public)/demo/whatsapp-story/page.tsx`:

```typescript
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
const dark = '#0F1829'
const darker = '#070D1A'
const muted = '#64748B'

const BAND_CONFIG = {
  HOT:  { emoji: '🔥', color: '#22c55e', label: 'HOT Lead', badge: 'rgba(34,197,94,0.12)' },
  WARM: { emoji: '🌡️', color: '#f59e0b', label: 'WARM Lead', badge: 'rgba(245,158,11,0.12)' },
  COLD: { emoji: '❄️', color: '#60a5fa', label: 'COLD Lead', badge: 'rgba(96,165,250,0.12)' },
}

const AGENT_ROWS = (score: number, band: string, answers: Record<string, { label: string }>) => [
  ['Property',   'Marina Heights 2BR, Dubai Marina'],
  ['Lead',       'You (Demo)'],
  ['Budget',     answers.budget?.label   ?? '—'],
  ['Timeline',   answers.timeline?.label ?? '—'],
  ['Financing',  answers.financing?.label ?? '—'],
  ['Intent',     answers.intent?.label   ?? '—'],
  ['Score',      `${score}/88 — ${band}`],
]

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
          Normally, you'd wait hours for a callback. With Enlista, the bot is already responding — in under 30 seconds.
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
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

      <style>{`
        @keyframes pulse-in {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
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
  const rows = AGENT_ROWS(score, band, answers as Record<string, { label: string }>)

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
          Here's what Ahmed just received.
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

        <div style={{ marginTop: 14, padding: '9px 14px', background: waDark, borderRadius: 8, textAlign: 'center', fontSize: 12, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
          Open in Enlista Dashboard →
        </div>
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
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'underline', fontFamily: 'var(--font-jakarta), sans-serif' }}
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
```

- [ ] **Step 2: Visit http://localhost:3000/demo/whatsapp-story and verify**

Check:
- Act 1 (Intro) renders with dark background, property badge, "See what happens next" button
- Clicking the button transitions to Act 2 (Chat)
- Chat works identically to Page A
- After Q5 is answered, "See what Ahmed just received" button appears
- Clicking it transitions to Act 3 (Reveal)
- Reveal shows the agent card with the actual answers collected during chat
- Score and band (HOT/WARM/COLD) match what was answered
- "Want this for your agency?" links to /contact-sales
- "Restart from beginning" resets act to 'intro' and resets the conversation

- [ ] **Step 3: Commit**

```bash
git add app/\(public\)/demo/whatsapp-story/page.tsx
git commit -m "feat: add Page C WhatsApp story-arc demo"
```

---

## Task 6: Housekeeping + Verification

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add .superpowers/ to .gitignore**

Open `.gitignore` and add this line (after the existing Next.js entries):

```
# Superpowers brainstorm sessions
.superpowers/
```

- [ ] **Step 2: Run full test suite**

```bash
npm run test
```

Expected: All tests pass (including the new whatsapp-conversation tests)

- [ ] **Step 3: Run typecheck and lint**

```bash
npm run typecheck && npm run lint
```

Expected: No errors, no warnings

- [ ] **Step 4: Final commit**

```bash
git add .gitignore
git commit -m "chore: add .superpowers/ to gitignore"
```
