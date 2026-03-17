import React from "react"

// Badge
export function Badge({ children, variant = "blue", style: extra }: {
  children: React.ReactNode
  variant?: "blue" | "green" | "amber" | "grey"
  style?: React.CSSProperties
}) {
  const colors = {
    blue: { background: "#EFF6FF", color: "#1D4ED8" },
    green: { background: "#ECFDF5", color: "#059669" },
    amber: { background: "#FFFBEB", color: "#D97706" },
    grey: { background: "#F1F5F9", color: "#64748B" },
  }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      ...colors[variant], ...extra,
    }}>{children}</span>
  )
}

// StatusBadge
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "blue"|"green"|"amber"|"grey" }> = {
    published: { label: "● Published", variant: "green" },
    draft: { label: "● Draft", variant: "grey" },
    live: { label: "● Live", variant: "green" },
    connected: { label: "● Connected", variant: "green" },
    disconnected: { label: "● Disconnected", variant: "grey" },
    syncing: { label: "● Syncing", variant: "amber" },
  }
  const m = map[status] ?? { label: status, variant: "grey" as const }
  return <Badge variant={m.variant}>{m.label}</Badge>
}

// SectionLabel
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
      textTransform: "uppercase", color: "#1D4ED8", display: "block", marginBottom: 10,
    }}>{children}</span>
  )
}

// BentoCard
export function BentoCard({ children, style: extra, className }: {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}) {
  return (
    <div className={className} style={{
      background: "#FFFFFF", border: "1px solid #DDE3EC",
      borderRadius: 12, padding: 24, ...extra,
    }}>{children}</div>
  )
}

// PageHeading
export function PageHeading({ title, subtitle, action }: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
      <div>
        <h1 style={{ fontWeight: 800, fontSize: "clamp(22px, 5vw, 28px)", color: "#0F1829", margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ color: "#64748B", fontSize: 14, marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}
