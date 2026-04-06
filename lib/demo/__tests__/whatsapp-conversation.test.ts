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
