import { describe, it, expect } from 'vitest'
import { renderVariant, generateToken, VARIANTS } from '../variants'

describe('VARIANTS', () => {
  it('has exactly 4 variants', () => {
    expect(Object.keys(VARIANTS)).toHaveLength(4)
    expect(Object.keys(VARIANTS)).toEqual(['A1', 'A2', 'B1', 'B2'])
  })
})

describe('renderVariant', () => {
  it('interpolates first name and link', () => {
    const msg = renderVariant('B1', 'Ahmed', 'https://enlista.io/go?t=abc123')
    expect(msg).toContain('Ahmed')
    expect(msg).toContain('https://enlista.io/go?t=abc123')
    expect(msg).not.toContain('[First Name]')
    expect(msg).not.toContain('[link]')
  })

  it('renders all 4 variants without placeholders', () => {
    for (const variant of ['A1','A2','B1','B2'] as const) {
      const msg = renderVariant(variant, 'Sara', 'https://enlista.io/go?t=xyz')
      expect(msg).not.toContain('[')
      expect(msg).not.toContain(']')
    }
  })
})

describe('generateToken', () => {
  it('generates a 16-char hex string', () => {
    const token = generateToken()
    expect(token).toMatch(/^[a-f0-9]{16}$/)
  })

  it('generates unique tokens', () => {
    const tokens = new Set(Array.from({ length: 100 }, generateToken))
    expect(tokens.size).toBe(100)
  })
})
