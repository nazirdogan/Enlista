import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-jakarta",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

const c = {
  bg: "#F2F4F7",
  white: "#FFFFFF",
  dark: "#0F1829",
  blue: "#1D4ED8",
  blueLight: "#3B82F6",
  bluePale: "#EFF6FF",
  text: "#1E293B",
  muted: "#64748B",
  border: "#DDE3EC",
  green: "#059669",
  amber: "#D97706",
};

function Badge({
  children,
  variant = "blue",
  style: extraStyle,
}: {
  children: React.ReactNode;
  variant?: "blue" | "green" | "amber";
  style?: React.CSSProperties;
}) {
  const colors = {
    blue: { background: c.bluePale, color: c.blue },
    green: { background: "#ECFDF5", color: c.green },
    amber: { background: "#FFFBEB", color: c.amber },
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        ...colors[variant],
        ...extraStyle,
      }}
    >
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: c.blue,
        display: "block",
        marginBottom: 10,
      }}
    >
      {children}
    </span>
  );
}

function BentoCard({
  children,
  style: extraStyle,
  className,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: c.white,
        border: `1px solid ${c.border}`,
        borderRadius: 12,
        padding: 24,
        transition: "all 0.25s",
        ...extraStyle,
      }}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  return (
    <div
      className={`${plusJakarta.variable} ${jetbrainsMono.variable}`}
      style={{
        fontFamily: "var(--font-jakarta), sans-serif",
        fontWeight: 300,
        fontSize: 14,
        lineHeight: 1.75,
        background: c.bg,
        color: c.text,
      }}
    >
      {/* Nav */}
      <nav
        style={{
          background: c.white,
          borderBottom: `1px solid ${c.border}`,
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          padding: "12px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: c.dark }}>
            Listings<span style={{ color: c.blue }}>Launch</span>
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              fontSize: 13,
            }}
          >
            {["Platform", "Clients", "Pricing"].map((label, i) => {
              const hrefs = ["#features", "#testimonials", "#pricing"];
              return (
                <a
                  key={label}
                  href={hrefs[i]}
                  style={{
                    color: c.muted,
                    padding: "6px 12px",
                    borderRadius: 6,
                    textDecoration: "none",
                    fontWeight: 400,
                  }}
                >
                  {label}
                </a>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a
            href="#cta"
            style={{
              display: "inline-block",
              border: `1.5px solid ${c.border}`,
              color: c.text,
              padding: "10px 24px",
              fontWeight: 500,
              fontSize: 13,
              borderRadius: 6,
              textDecoration: "none",
            }}
          >
            Sign in
          </a>
          <a
            href="#cta"
            style={{
              display: "inline-block",
              background: c.blue,
              color: "white",
              padding: "10px 24px",
              fontFamily: "var(--font-jakarta), sans-serif",
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 6,
              textDecoration: "none",
            }}
          >
            Get Started Free
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{ padding: "64px 24px 48px", maxWidth: 1280, margin: "0 auto" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 48,
            alignItems: "center",
          }}
        >
          {/* Left */}
          <div>
            <Badge variant="green" style={{ marginBottom: 20 }}>
              <span
                style={{
                  width: 6,
                  height: 6,
                  background: c.green,
                  borderRadius: "50%",
                  display: "inline-block",
                }}
              />
              Live — 840 active agencies
            </Badge>
            <h1
              style={{
                fontWeight: 800,
                fontSize: "clamp(36px, 5vw, 60px)",
                lineHeight: 1.08,
                color: c.dark,
                marginBottom: 20,
              }}
            >
              Listing management
              <br />
              that actually
              <br />
              <span style={{ color: c.blue }}>moves the needle.</span>
            </h1>
            <p
              style={{
                color: c.muted,
                fontSize: 16,
                lineHeight: 1.8,
                maxWidth: 440,
                marginBottom: 36,
              }}
            >
              AI-powered listing copy, lead scoring and RERA compliance for UAE
              real estate agencies — in one clean dashboard.
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 40,
              }}
            >
              <a
                href="#cta"
                style={{
                  display: "inline-block",
                  background: c.blue,
                  color: "white",
                  padding: "10px 24px",
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: 6,
                  textDecoration: "none",
                }}
              >
                Start Free — 7 days
              </a>
              <a
                href="#features"
                style={{
                  display: "inline-block",
                  border: `1.5px solid ${c.border}`,
                  color: c.text,
                  padding: "10px 24px",
                  fontWeight: 500,
                  fontSize: 13,
                  borderRadius: 6,
                  textDecoration: "none",
                }}
              >
                See the platform
              </a>
            </div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {[
                { num: "124K", label: "listings managed" },
                { num: "<4 min", label: "avg. publish time" },
                { num: "99.9%", label: "portal uptime" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p
                    style={{
                      fontWeight: 800,
                      fontSize: 24,
                      color: c.dark,
                    }}
                  >
                    {stat.num}
                  </p>
                  <p style={{ fontSize: 12, color: c.muted }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard bento */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Stats row */}
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}
            >
              {[
                { label: "Listings", val: "247", sub: "↑ 18%", subColor: c.green, valColor: c.dark },
                { label: "Hot Leads", val: "34", sub: "↑ 6 today", subColor: c.green, valColor: c.blue },
                { label: "RERA", val: "✓", sub: "All clean", subColor: c.green, valColor: c.green },
              ].map((item) => (
                <BentoCard
                  key={item.label}
                  style={{ padding: 16, textAlign: "center" }}
                >
                  <p style={{ fontSize: 11, color: c.muted, marginBottom: 4 }}>
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontWeight: 800,
                      fontSize: 28,
                      color: item.valColor,
                    }}
                  >
                    {item.val}
                  </p>
                  <p style={{ fontSize: 11, color: item.subColor }}>
                    {item.sub}
                  </p>
                </BentoCard>
              ))}
            </div>

            {/* Chart */}
            <BentoCard>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <p style={{ fontWeight: 600, fontSize: 13 }}>
                  Enquiries this week
                </p>
                <Badge variant="blue">+24%</Badge>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 6,
                  height: 64,
                }}
              >
                {[
                  { h: "40%", bg: c.border, op: 1 },
                  { h: "55%", bg: c.border, op: 1 },
                  { h: "48%", bg: c.blueLight, op: 0.5 },
                  { h: "70%", bg: c.blueLight, op: 0.5 },
                  { h: "60%", bg: c.blueLight, op: 0.7 },
                  { h: "85%", bg: c.blueLight, op: 0.8 },
                  { h: "100%", bg: c.blue, op: 1 },
                ].map((bar, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: bar.h,
                      background: bar.bg,
                      opacity: bar.op,
                      borderRadius: "3px 3px 0 0",
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                  fontSize: 10,
                  color: c.muted,
                  fontFamily: "var(--font-jetbrains), monospace",
                }}
              >
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </BentoCard>

            {/* AI copy snippet */}
            <BentoCard style={{ background: c.dark }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                  AI Copy — EN
                </p>
                <Badge variant="green" style={{ fontSize: 10 }}>
                  Generated
                </Badge>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 11,
                  color: "rgba(255,255,255,0.7)",
                  lineHeight: 1.7,
                }}
              >
                &ldquo;Exceptional 3BR in Downtown Dubai with Burj views, private gym,
                and premium finishes throughout…&rdquo;
              </p>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        style={{ padding: "64px 24px", maxWidth: 1280, margin: "0 auto" }}
      >
        <div style={{ marginBottom: 40 }}>
          <SectionLabel>Platform</SectionLabel>
          <h2
            style={{
              fontWeight: 800,
              fontSize: "clamp(28px, 4vw, 44px)",
              color: c.dark,
            }}
          >
            Six modules.
            <br />
            One subscription.
          </h2>
        </div>

        {/* Bento grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "auto",
            gap: 12,
          }}
        >
          {/* 01 — wide */}
          <BentoCard
            style={{
              gridColumn: "span 2",
              padding: 40,
              background: c.blue,
              color: "white",
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
                display: "block",
                marginBottom: 12,
              }}
            >
              01 — Core
            </span>
            <h3 style={{ fontWeight: 800, fontSize: 28, marginBottom: 12 }}>
              AI Listing Copy Engine
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 14,
                lineHeight: 1.8,
                maxWidth: 480,
              }}
            >
              Bilingual EN/AR descriptions generated in seconds. Portal-tuned
              optimised for UAE property search SEO. From a villa on the Palm
              to a studio in JLT — copy that converts.
            </p>
          </BentoCard>

          {/* 02 — tall */}
          <BentoCard style={{ padding: 32, gridRow: "span 2" }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: c.muted,
                display: "block",
                marginBottom: 12,
              }}
            >
              02
            </span>
            <h3
              style={{
                fontWeight: 700,
                fontSize: 20,
                color: c.dark,
                marginBottom: 8,
              }}
            >
              Lead Intelligence
            </h3>
            <p
              style={{
                color: c.muted,
                fontSize: 13,
                lineHeight: 1.8,
                marginBottom: 24,
              }}
            >
              ML-ranked buyer scoring. WhatsApp qualification 24/7. Your agents
              always know who to call first.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "Hot", count: "34", pct: "82%", barColor: c.amber },
                { label: "Qualified", count: "128", pct: "55%", barColor: c.blueLight },
                { label: "New", count: "312", pct: "100%", barColor: c.border },
              ].map((item) => (
                <div key={item.label}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: c.dark,
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-jetbrains), monospace",
                        fontSize: 12,
                        color: item.barColor,
                      }}
                    >
                      {item.count}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      background: c.bg,
                      borderRadius: 2,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: item.pct,
                        background: item.barColor,
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* 04 */}
          <BentoCard style={{ padding: 32, background: c.dark }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                display: "block",
                marginBottom: 12,
              }}
            >
              03
            </span>
            <h3
              style={{
                fontWeight: 700,
                fontSize: 20,
                color: "white",
                marginBottom: 8,
              }}
            >
              RERA Compliance
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 13,
                lineHeight: 1.8,
              }}
            >
              DLD permit validation before every publish. Zero suspensions.
              Automatic audit trail.
            </p>
          </BentoCard>

          {/* 05 */}
          <BentoCard style={{ padding: 32 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: c.muted,
                display: "block",
                marginBottom: 12,
              }}
            >
              04
            </span>
            <h3
              style={{
                fontWeight: 700,
                fontSize: 20,
                color: c.dark,
                marginBottom: 8,
              }}
            >
              Market Analytics
            </h3>
            <p style={{ color: c.muted, fontSize: 13, lineHeight: 1.8 }}>
              Live DLD data. AED/sqft benchmarks. Area demand heatmaps.
            </p>
          </BentoCard>

          {/* 06 */}
          <BentoCard style={{ padding: 32, background: c.bluePale }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: c.blue,
                display: "block",
                marginBottom: 12,
              }}
            >
              05
            </span>
            <h3
              style={{
                fontWeight: 700,
                fontSize: 20,
                color: c.dark,
                marginBottom: 8,
              }}
            >
              Photo Suite
            </h3>
            <p style={{ color: c.muted, fontSize: 13, lineHeight: 1.8 }}>
              AI image enhancement, smart ordering, portal sizing, watermarking.
            </p>
          </BentoCard>
        </div>
      </section>

      {/* Testimonials */}
      <section
        id="testimonials"
        style={{ padding: "64px 24px", maxWidth: 1280, margin: "0 auto" }}
      >
        <SectionLabel>Client Results</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {[
            {
              badge: "Espace Real Estate · Dubai",
              quote:
                "Two days to four minutes. That's a 720× improvement. Enlista replaced our entire publishing workflow.",
              name: "Sarah Al Mansoori",
              role: "Head of Operations",
              initial: "S",
              avatarBg: c.blue,
              dark: false,
            },
            {
              badge: "Allsopp & Allsopp · Dubai",
              quote:
                "Our Palm Jumeirah listings convert at 3× the previous rate. The AI copy is indistinguishable from our best agents.",
              name: "James Whitfield",
              role: "Managing Director",
              initial: "J",
              avatarBg: c.dark,
              dark: false,
            },
            {
              badge: "DLD Certified · Dubai",
              badgeVariant: "green" as const,
              quote:
                "Zero RERA suspensions. The compliance engine is the most reliable system in our entire operation.",
              name: "Fatima Al Hashimi",
              role: "Compliance Director",
              initial: "F",
              avatarBg: c.green,
              dark: true,
            },
            {
              badge: "Metropolitan Premium Properties",
              quote:
                "600+ listings, 4 portals, one platform. Scaled 40% without adding a single coordinator to our team.",
              name: "Ravi Menon",
              role: "Chief Executive",
              initial: "R",
              avatarBg: c.amber,
              dark: false,
            },
          ].map((t) => (
            <div
              key={t.name}
              style={{
                background: t.dark ? c.dark : c.white,
                border: `1px solid ${t.dark ? "transparent" : c.border}`,
                borderRadius: 12,
                padding: 32,
              }}
            >
              <Badge
                variant={t.badgeVariant ?? "blue"}
                style={{ marginBottom: 16 }}
              >
                {t.badge}
              </Badge>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: t.dark ? "rgba(255,255,255,0.85)" : c.text,
                  marginBottom: 20,
                  fontStyle: "italic",
                }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <div
                style={{
                  borderTop: `1px solid ${t.dark ? "rgba(255,255,255,0.08)" : c.border}`,
                  paddingTop: 16,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    background: t.avatarBg,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: 13,
                    color: "white",
                    flexShrink: 0,
                  }}
                >
                  {t.initial}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: t.dark ? "white" : c.dark,
                    }}
                  >
                    {t.name}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: t.dark ? "rgba(255,255,255,0.4)" : c.muted,
                    }}
                  >
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        style={{ padding: "64px 24px", maxWidth: 1280, margin: "0 auto" }}
      >
        <SectionLabel>Pricing</SectionLabel>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 32,
          }}
        >
          <h2
            style={{
              fontWeight: 800,
              fontSize: "clamp(28px, 4vw, 44px)",
              color: c.dark,
            }}
          >
            Transparent pricing.
            <br />
            No surprises.
          </h2>
          <p style={{ color: c.muted, maxWidth: 280, fontSize: 13 }}>
            All plans in AED. Cancel anytime. 7-day free trial included on
            every tier.
          </p>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {/* Starter */}
          <div
            style={{
              background: c.white,
              border: `1.5px solid ${c.border}`,
              borderRadius: 12,
              padding: 40,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: c.muted,
                marginBottom: 20,
              }}
            >
              Starter
            </p>
            <div
              style={{
                fontWeight: 800,
                fontSize: 56,
                lineHeight: 1,
                color: c.dark,
              }}
            >
              299
            </div>
            <p
              style={{
                fontSize: 12,
                color: c.muted,
                marginBottom: 28,
                marginTop: 4,
              }}
            >
              AED / month
            </p>
            <div style={{ marginBottom: 28 }}>
              {[
                { label: "50 active listings", on: true },
                { label: "3 portal integrations", on: true },
                { label: "AI copy — English", on: true },
                { label: "Basic analytics", on: true },
                { label: "Lead scoring", on: false },
                { label: "WhatsApp bot", on: false },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    fontSize: 13,
                    color: item.on ? c.text : c.muted,
                    padding: "9px 0",
                    borderBottom: `1px solid ${c.border}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: item.on ? c.green : c.border,
                      flexShrink: 0,
                    }}
                  >
                    {item.on ? "✓" : "–"}
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
            <a
              href="#cta"
              style={{
                display: "block",
                textAlign: "center",
                border: `1.5px solid ${c.border}`,
                color: c.text,
                padding: "10px 24px",
                fontWeight: 500,
                fontSize: 13,
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              Get Started
            </a>
          </div>

          {/* Professional */}
          <div
            style={{
              background: c.dark,
              border: `1.5px solid ${c.dark}`,
              borderRadius: 12,
              padding: 40,
              color: "white",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.4)",
                marginBottom: 20,
              }}
            >
              Professional · Recommended
            </p>
            <div
              style={{
                fontWeight: 800,
                fontSize: 56,
                lineHeight: 1,
                color: c.blueLight,
              }}
            >
              799
            </div>
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 28,
                marginTop: 4,
              }}
            >
              AED / month
            </p>
            <div style={{ marginBottom: 28 }}>
              {[
                "200 active listings",
                "All portals",
                "AI copy — EN + AR",
                "Advanced analytics",
                "Lead scoring",
                "WhatsApp bot",
                "RERA compliance",
              ].map((label) => (
                <div
                  key={label}
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.7)",
                    padding: "9px 0",
                    borderBottom: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 11, color: c.green, flexShrink: 0 }}>
                    ✓
                  </span>
                  {label}
                </div>
              ))}
            </div>
            <a
              href="#cta"
              style={{
                display: "block",
                textAlign: "center",
                background: c.blue,
                color: "white",
                padding: "10px 24px",
                fontWeight: 600,
                fontSize: 13,
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              Get Started
            </a>
          </div>

          {/* Enterprise */}
          <div
            style={{
              background: c.white,
              border: `1.5px solid ${c.border}`,
              borderRadius: 12,
              padding: 40,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: c.muted,
                marginBottom: 20,
              }}
            >
              Enterprise
            </p>
            <div
              style={{
                fontWeight: 800,
                fontSize: 56,
                lineHeight: 1,
                color: c.dark,
              }}
            >
              1,999
            </div>
            <p
              style={{
                fontSize: 12,
                color: c.muted,
                marginBottom: 28,
                marginTop: 4,
              }}
            >
              AED / month
            </p>
            <div style={{ marginBottom: 28 }}>
              {[
                "Unlimited listings",
                "Custom integrations",
                "Full AI suite",
                "Market analytics",
                "Dedicated manager",
                "API + SLA",
              ].map((label) => (
                <div
                  key={label}
                  style={{
                    fontSize: 13,
                    color: c.text,
                    padding: "9px 0",
                    borderBottom: `1px solid ${c.border}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 11, color: c.green, flexShrink: 0 }}>
                    ✓
                  </span>
                  {label}
                </div>
              ))}
            </div>
            <a
              href="#cta"
              style={{
                display: "block",
                textAlign: "center",
                border: `1.5px solid ${c.border}`,
                color: c.text,
                padding: "10px 24px",
                fontWeight: 500,
                fontSize: 13,
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="cta"
        style={{ background: c.dark, padding: "80px 24px", margin: 0 }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 56,
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                fontWeight: 800,
                fontSize: "clamp(32px, 5vw, 52px)",
                color: "white",
                marginBottom: 16,
                lineHeight: 1.1,
              }}
            >
              Start building your
              <br />
              listing stack today.
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: 14,
                lineHeight: 1.8,
                marginBottom: 24,
              }}
            >
              7-day free trial. No credit card. UAE support team available
              daily.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Setup in under 10 minutes",
                "Connect portals on day one",
                "RERA compliance active by default",
              ].map((item) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  <span style={{ color: c.green }}>✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <form
            style={{ display: "flex", flexDirection: "column", gap: 10 }}
          >
            {["Agency email", "Agency name"].map((placeholder) => (
              <input
                key={placeholder}
                type={placeholder.includes("email") ? "email" : "text"}
                placeholder={placeholder}
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1.5px solid rgba(255,255,255,0.1)",
                  color: "white",
                  padding: "11px 16px",
                  fontFamily: "var(--font-jakarta), sans-serif",
                  fontSize: 13,
                  borderRadius: 6,
                  outline: "none",
                  width: "100%",
                }}
              />
            ))}
            <button
              type="submit"
              style={{
                padding: 13,
                cursor: "pointer",
                background: c.blue,
                color: "white",
                border: "none",
                fontSize: 13,
                borderRadius: 6,
                display: "block",
                width: "100%",
                fontWeight: 600,
                letterSpacing: "0.02em",
                fontFamily: "var(--font-jakarta), sans-serif",
              }}
            >
              Start Free Trial →
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          background: "#0A1120",
          padding: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: 15, color: "white" }}>
          Listings<span style={{ color: c.blueLight }}>Launch</span>
        </span>
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
          © 2026 · Dubai, UAE
        </span>
      </footer>
    </div>
  );
}
