import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

interface Agent {
  name: string
  firstName: string
  agency: string
  phone: string | null
  whatsapp: string | null
  instagram: string | null
}

function normalizePhone(raw: string): string | null {
  if (!raw || raw.trim() === '') return null
  // Strip non-digit characters except leading +
  const cleaned = raw.replace(/[^\d+]/g, '')
  return cleaned || null
}

function extractWhatsapp(raw: string): string | null {
  if (!raw || raw.trim() === '') return null
  // Strip everything except digits
  const digits = raw.replace(/\D/g, '')
  return digits || null
}

function parseAgentsHtml(htmlPath: string): Agent[] {
  const html = readFileSync(htmlPath, 'utf-8')

  // The data lives in a JS array: const AGENTS = [ ... ];
  // Each entry is: ["name", "agency", "phone", "whatsapp_number", "instagram_handle"]
  const agentsBlockMatch = html.match(/const AGENTS\s*=\s*\[([\s\S]*?)\];/)
  if (!agentsBlockMatch) {
    throw new Error('Could not find AGENTS array in HTML file')
  }

  const block = agentsBlockMatch[1]

  // Match each array row: ["...", "...", "...", "...", "..."]
  const rowRegex = /\[([^\]]*)\]/g
  const agents: Agent[] = []
  let match

  while ((match = rowRegex.exec(block)) !== null) {
    const inner = match[1]

    // Parse the 5 CSV-like fields (values are double-quoted strings)
    const fields: string[] = []
    const fieldRegex = /"((?:[^"\\]|\\.)*)"/g
    let fMatch
    while ((fMatch = fieldRegex.exec(inner)) !== null) {
      fields.push(fMatch[1])
    }

    if (fields.length < 2) continue

    const fullName = fields[0]?.trim() ?? ''
    if (!fullName) continue

    const agency = fields[1]?.trim() ?? ''
    const phone = normalizePhone(fields[2] ?? '')
    const whatsapp = extractWhatsapp(fields[3] ?? '')
    const igRaw = fields[4]?.trim() ?? ''
    const instagram = igRaw ? igRaw.replace('@', '') : null

    const firstName = fullName.split(/\s+/)[0]

    agents.push({ name: fullName, firstName, agency, phone, whatsapp, instagram })
  }

  return agents
}

// Run
const htmlPath = join(process.cwd(), 'dubai_agents.html')
const agents = parseAgentsHtml(htmlPath)
const withWhatsapp = agents.filter(a => a.whatsapp)

console.log(`Parsed ${agents.length} agents, ${withWhatsapp.length} with WhatsApp`)

const outPath = join(process.cwd(), 'scripts/outreach/agents.json')
writeFileSync(outPath, JSON.stringify(withWhatsapp, null, 2))
console.log(`Written to ${outPath}`)
