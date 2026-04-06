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
