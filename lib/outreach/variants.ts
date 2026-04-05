import { randomBytes } from 'crypto'

export type VariantId = 'A1' | 'A2' | 'B1' | 'B2'

export const VARIANTS: Record<VariantId, string> = {
  A1: `Hey [First Name], quick question — how long does it take you to write up a listing for Bayut or Property Finder? We built something that gets it done in under 4 minutes, bilingual EN/AR. Genuinely curious if that's a pain point. [link]

— Enlista | AI listing copy for Dubai agents | Reply STOP to opt out`,

  A2: `Hey [First Name], we've been working with a few Dubai agencies on AI-generated listing copy — English and Arabic. Some agents are saving 2+ hours per listing. Not sure if it's relevant to your workflow, but would love to know what you think. [link]

— Enlista | AI listing copy for Dubai agents | Reply STOP to opt out`,

  B1: `Hey [First Name], we're giving Dubai agents a free 7-day trial of Enlista — AI that writes your property listings in English and Arabic in under 4 minutes. 3 listings, no credit card needed. [link]

— Enlista | Reply STOP to opt out`,

  B2: `Hey [First Name], agents on Enlista publish listings 3x faster with AI-generated EN/AR copy ready for Bayut, Property Finder, and Dubizzle. Free 7-day trial, 3 listings, no card needed. [link]

— Enlista | Reply STOP to opt out`,
}

export function renderVariant(
  variant: VariantId,
  firstName: string,
  link: string
): string {
  return VARIANTS[variant]
    .replaceAll('[First Name]', firstName)
    .replaceAll('[link]', link)
}

export function generateToken(): string {
  return randomBytes(8).toString('hex')
}

export function pickVariant(index: number): VariantId {
  const variants: VariantId[] = ['A1', 'A2', 'B1', 'B2']
  return variants[index % 4]
}

export function randomVariant(): VariantId {
  const variants: VariantId[] = ['A1', 'A2', 'B1', 'B2']
  return variants[Math.floor(Math.random() * 4)]
}
