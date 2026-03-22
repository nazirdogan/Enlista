/**
 * Normalizes a phone number to E.164 format for UAE numbers.
 * Returns null if the number cannot be normalized.
 */
export function normalizePhone(raw: string): string | null {
  if (!raw) return null

  // Strip whitespace, dashes, parentheses
  const cleaned = raw.replace(/[\s\-().]/g, '')

  // Already valid E.164
  if (/^\+971\d{9}$/.test(cleaned)) return cleaned

  // Starts with 971 (missing +)
  if (/^971\d{9}$/.test(cleaned)) return `+${cleaned}`

  // Local UAE number starting with 0 (e.g. 0501234567)
  if (/^0\d{9}$/.test(cleaned)) return `+971${cleaned.slice(1)}`

  // 9-digit local (e.g. 501234567)
  if (/^[5-9]\d{8}$/.test(cleaned)) return `+971${cleaned}`

  return null
}
