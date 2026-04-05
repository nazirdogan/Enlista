import { describe, it, expect } from 'vitest'
import { normalizePhone } from '../normalize-phone'

describe('normalizePhone', () => {
  it('passes through valid E.164', () => {
    expect(normalizePhone('+971501234567')).toBe('+971501234567')
  })

  it('adds UAE country code to 10-digit local number', () => {
    expect(normalizePhone('0501234567')).toBe('+971501234567')
  })

  it('adds + prefix to number starting with 971', () => {
    expect(normalizePhone('971501234567')).toBe('+971501234567')
  })

  it('strips spaces and dashes', () => {
    expect(normalizePhone('+971 50 123 4567')).toBe('+971501234567')
    expect(normalizePhone('+971-50-123-4567')).toBe('+971501234567')
  })

  it('returns null for non-normalizable numbers', () => {
    expect(normalizePhone('abc')).toBeNull()
    expect(normalizePhone('123')).toBeNull()
    expect(normalizePhone('')).toBeNull()
  })
})
