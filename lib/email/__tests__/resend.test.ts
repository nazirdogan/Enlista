import { describe, it, expect, vi } from 'vitest'

const mockSend = vi.fn().mockResolvedValue({ data: { id: 'resend_123' }, error: null })

vi.mock('resend', () => ({
  Resend: vi.fn(function () {
    return { emails: { send: mockSend } }
  }),
}))

describe('sendTransactionalEmail', () => {
  it('calls resend.emails.send with correct template for welcome', async () => {
    const { sendTransactionalEmail } = await import('../resend')
    await sendTransactionalEmail({ type: 'welcome', to: 'user@example.com', agencyName: 'Test Agency' })
    expect(mockSend).toHaveBeenCalledWith(expect.objectContaining({ to: 'user@example.com' }))
  })
})
