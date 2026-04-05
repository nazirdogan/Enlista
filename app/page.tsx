"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Check, Zap, ArrowRight, Star, MessageSquare } from "lucide-react";

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

// ─── Pricing data ─────────────────────────────────────────────────────────────

const pricingPlans = [
  {
    key: "free",
    name: "Free",
    tagline: "Try before you commit",
    priceLabel: "Free",
    priceSub: "forever",
    creditsLabel: "1 listing/month",
    cta: "Get started free",
    ctaHref: "/auth?tab=signup",
    highlight: false,
    features: [
      "Full AI listing generation",
      "English + Arabic output",
      "Property portal copy (Bayut, PF, Dubizzle)",
      "Compact listing & highlight bullets",
      "1 listing credit per month",
    ],
  },
  {
    key: "plus",
    name: "Plus",
    tagline: "For active individual agents",
    priceLabel: "AED 92",
    priceSub: "per month",
    creditsLabel: "5 listings/month",
    cta: "Start with Plus",
    ctaHref: null,
    highlight: false,
    features: [
      "Everything in Free",
      "5 listing credits per month",
      "Credits reset on the 1st",
      "Buy extra credits anytime",
      "Email support",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    tagline: "For high-volume agents",
    priceLabel: "AED 147",
    priceSub: "per month",
    creditsLabel: "15 listings/month",
    cta: "Start with Pro",
    ctaHref: null,
    highlight: true,
    badge: "Most popular",
    features: [
      "Everything in Plus",
      "WhatsApp & Instagram copy",
      "15 listing credits per month",
      "Priority support",
      "Advanced analytics",
      "Early access to new features",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    tagline: "For brokerages & teams",
    priceLabel: "Custom",
    priceSub: "",
    creditsLabel: "Unlimited listings",
    cta: "Contact sales",
    ctaHref: "/contact-sales",
    highlight: false,
    features: [
      "Minimum 10 agents",
      "Dedicated account manager",
      "White-label platform option",
      "Priority AI processing",
      "Custom onboarding & training",
      "SLA guarantee",
      "Admin dashboard & analytics",
      "Bulk listing management",
    ],
  },
];

const creditPacks = [
  { key: "credits_5",  label: "5 Credits",  price: "AED 56",  perCredit: "AED 11.20 per credit" },
  { key: "credits_10", label: "10 Credits", price: "AED 92",  perCredit: "AED 9.20 per credit", popular: true },
  { key: "credits_20", label: "20 Credits", price: "AED 147", perCredit: "AED 7.35 per credit" },
];

const pricingFaqs = [
  { q: "What counts as one credit?", a: "Each time you click \"Generate\" to produce a listing, one credit is used. Saving or editing an existing listing does not use credits." },
  { q: "Do unused monthly credits roll over?", a: "Monthly credits reset on the 1st of each month and do not roll over. Extra credits you purchase are permanent — they never expire." },
  { q: "Can I buy extra credits on any plan?", a: "Yes. Extra credit packs are available on all plans including Free. They stack on top of your monthly allowance." },
  { q: "What happens when I run out of credits?", a: "You'll see a prompt in the sidebar and when you try to generate. You can immediately purchase a credit pack or upgrade your plan without losing any work." },
  { q: "What qualifies as Enterprise?", a: "Enterprise is designed for brokerages with 10 or more agents. It includes a custom per-agent rate, a brokerage admin dashboard, and optional white-labelling of the platform." },
  { q: "Can I switch plans at any time?", a: "Yes. Upgrades take effect immediately. Downgrades take effect at the end of your current billing cycle." },
];

// ──────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  async function handlePlanCta(planKey: string) {
    setLoadingPlan(planKey);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, billing }),
      });
      const data = await res.json();
      if (res.status === 401) {
        router.push(`/auth?tab=signup&plan=${planKey}`);
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch { /* ignore */ } finally {
      setLoadingPlan(null);
    }
  }

  async function handleBuyPack(packKey: string) {
    setLoadingPack(packKey);
    try {
      const res = await fetch("/api/stripe/buy-credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack: packKey }),
      });
      const data = await res.json();
      if (res.status === 401) { router.push("/auth?tab=signin"); return; }
      if (data.url) window.location.href = data.url;
    } catch { /* ignore */ } finally {
      setLoadingPack(null);
    }
  }
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
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            {/* Grid mark — 3×3 cells forming "E" */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 10px)', gridTemplateRows: 'repeat(3, 10px)', gap: 3 }}>
              <div style={{ borderRadius: 2, background: c.blue }} />
              <div style={{ borderRadius: 2, background: c.blue }} />
              <div style={{ borderRadius: 2, background: c.blue }} />
              <div style={{ borderRadius: 2, background: c.blue }} />
              <div style={{ borderRadius: 2, background: c.blue }} />
              <div style={{ borderRadius: 2, background: `rgba(29,78,216,0.14)` }} />
              <div style={{ borderRadius: 2, background: c.blue }} />
              <div style={{ borderRadius: 2, background: c.blue }} />
              <div style={{ borderRadius: 2, background: c.blue }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: 17, color: c.dark, letterSpacing: '-0.04em' }}>
              Enlist<span style={{ color: c.blue }}>a</span>
            </span>
          </div>
          {/* Desktop nav links */}
          <div className="hidden md:flex" style={{ gap: 8, fontSize: 13 }}>
            {["How It Works", "Clients", "Pricing"].map((label, i) => {
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
          {/* Desktop CTA buttons */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: 10 }}>
            <a
              href="/auth"
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
              Login
            </a>
            <a
              href="/auth?tab=signup"
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
              Start free trial
            </a>
          </div>
          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: c.dark }}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden" style={{ paddingTop: 16, paddingBottom: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {["How It Works", "Clients", "Pricing"].map((label, i) => {
              const hrefs = ["#features", "#testimonials", "#pricing"];
              return (
                <a
                  key={label}
                  href={hrefs[i]}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: c.muted,
                    padding: "10px 12px",
                    borderRadius: 6,
                    textDecoration: "none",
                    fontWeight: 400,
                    fontSize: 15,
                    display: "block",
                  }}
                >
                  {label}
                </a>
              );
            })}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8 }}>
              <a
                href="/auth"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "block",
                  textAlign: "center",
                  border: `1.5px solid ${c.border}`,
                  color: c.text,
                  padding: "11px 24px",
                  fontWeight: 500,
                  fontSize: 14,
                  borderRadius: 6,
                  textDecoration: "none",
                }}
              >
                Login
              </a>
              <a
                href="/auth?tab=signup"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: "block",
                  textAlign: "center",
                  background: c.blue,
                  color: "white",
                  padding: "11px 24px",
                  fontWeight: 600,
                  fontSize: 14,
                  borderRadius: 6,
                  textDecoration: "none",
                }}
              >
                Start free trial
              </a>
            </div>
          </div>
        )}
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
              AI-powered listing copy, multi-portal sync, lead scoring and RERA
              compliance for UAE real estate agencies — in one clean dashboard.
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
                href="/auth?tab=signup"
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
                Start your 14-day free trial
              </a>
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

            {/* Portal status */}
            <BentoCard>
              <p style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>
                Portal Status
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {["Bayut", "Property Finder", "Dubizzle"].map((portal) => (
                  <div
                    key={portal}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: 13 }}>{portal}</span>
                    <Badge variant="green">● Live</Badge>
                  </div>
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

      {/* How It Works */}
      <section
        id="features"
        style={{ padding: "64px 24px", maxWidth: 1280, margin: "0 auto" }}
      >
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <SectionLabel>How It Works</SectionLabel>
          <h2
            style={{
              fontWeight: 800,
              fontSize: "clamp(28px, 4vw, 44px)",
              color: c.dark,
              marginBottom: 12,
            }}
          >
            A complete listing in 30 seconds.
            <br />
            Bilingual. Built to sell.
          </h2>
          <p style={{ color: c.muted, fontSize: 15, lineHeight: 1.7 }}>
            Speak or fill in the details — the AI handles the rest.
          </p>
        </div>

        {/* 3-step flow */}
        <div
          className="how-it-works-steps"
          style={{
            display: "flex",
            alignItems: "stretch",
            gap: 0,
            marginBottom: 16,
          }}
        >
          <BentoCard style={{ flex: 1, padding: 32 }}>
            <span
              style={{
                fontSize: 36,
                fontWeight: 300,
                color: c.blue,
                display: "block",
                marginBottom: 12,
                lineHeight: 1,
              }}
            >
              1
            </span>
            <h3
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: c.dark,
                marginBottom: 8,
              }}
            >
              Speak or fill in the details
            </h3>
            <p style={{ color: c.muted, fontSize: 13, lineHeight: 1.8 }}>
              Use your voice or a short form. Property type, size, key
              features — say it or type it.
            </p>
          </BentoCard>

          <div
            className="how-it-works-connector"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              fontSize: 20,
              color: c.muted,
              flexShrink: 0,
            }}
          >
            {"\u2192"}
          </div>

          <BentoCard style={{ flex: 1, padding: 32 }}>
            <span
              style={{
                fontSize: 36,
                fontWeight: 300,
                color: c.blue,
                display: "block",
                marginBottom: 12,
                lineHeight: 1,
              }}
            >
              2
            </span>
            <h3
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: c.dark,
                marginBottom: 8,
              }}
            >
              AI writes your listing
            </h3>
            <p style={{ color: c.muted, fontSize: 13, lineHeight: 1.8 }}>
              Bilingual EN/AR copy generated in seconds. Optimised for
              Bayut, Property Finder, and Dubizzle.
            </p>
          </BentoCard>

          <div
            className="how-it-works-connector"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 16px",
              fontSize: 20,
              color: c.muted,
              flexShrink: 0,
            }}
          >
            {"\u2192"}
          </div>

          <BentoCard style={{ flex: 1, padding: 32 }}>
            <span
              style={{
                fontSize: 36,
                fontWeight: 300,
                color: c.blue,
                display: "block",
                marginBottom: 12,
                lineHeight: 1,
              }}
            >
              3
            </span>
            <h3
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: c.dark,
                marginBottom: 8,
              }}
            >
              Copy and paste
            </h3>
            <p style={{ color: c.muted, fontSize: 13, lineHeight: 1.8 }}>
              Done. Paste straight into any portal. No editing, no
              reformatting.
            </p>
          </BentoCard>
        </div>

        {/* Sample output card */}
        <BentoCard style={{ padding: 40, marginTop: 12 }}>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: c.muted,
              display: "block",
              marginBottom: 24,
            }}
          >
            Sample output — 2BR, Downtown Dubai
          </span>
          <div
            className="sample-output-columns"
            style={{ display: "flex", gap: 0 }}
          >
            {/* English column */}
            <div style={{ flex: 1, paddingRight: 32 }}>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: c.blue,
                  marginBottom: 12,
                }}
              >
                EN
              </p>
              <p style={{ color: c.text, fontSize: 14, lineHeight: 1.9 }}>
                Nestled in the heart of Downtown Dubai, this well-appointed
                2-bedroom apartment offers sweeping views of the iconic Burj
                Khalifa skyline. Spanning 1,150 sq ft across a smart
                open-plan layout, the residence features floor-to-ceiling
                windows, a fully fitted kitchen, and two generously sized
                en-suite bedrooms. Residents enjoy access to a rooftop
                infinity pool, a state-of-the-art gymnasium, and 24-hour
                concierge service — all just steps from Dubai Mall and the
                Dubai Fountain.
              </p>
            </div>

            {/* Vertical divider */}
            <div
              className="sample-output-divider"
              style={{
                width: 1,
                background: c.border,
                flexShrink: 0,
                alignSelf: "stretch",
              }}
            />

            {/* Arabic column */}
            <div
              dir="rtl"
              className="sample-output-ar"
              style={{ flex: 1, paddingLeft: 32, textAlign: "right" }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: c.blue,
                  marginBottom: 12,
                }}
              >
                AR
              </p>
              <p style={{ color: c.text, fontSize: 14, lineHeight: 1.9 }}>
                تقع هذه الشقة المكوّنة من غرفتَي نوم في قلب وسط مدينة
                دبي، وتوفّر إطلالات خلّابة على أفق برج خليفة الشهير. تمتد
                الشقة على مساحة 1,150 قدم مربع بتصميم مفتوح ذكي، وتتميّز
                بنوافذ تمتد من الأرض إلى السقف، ومطبخ مجهّز بالكامل،
                وغرفتَي نوم واسعتَين مع حمّامَين ملحقَين. يتمتع السكان
                بالوصول إلى مسبح لا نهاية له على السطح، وصالة رياضية
                متكاملة، وخدمة كونسيرج على مدار الساعة — على بعد خطوات من
                دبي مول ونافورة دبي.
              </p>
            </div>
          </div>
        </BentoCard>
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
              badge: "Agency in Dubai",
              quote:
                "Two days to four minutes. That's a 720× improvement. Enlista replaced our entire publishing workflow.",
              label: "Head of Operations",
              avatarBg: c.blue,
              dark: false,
            },
            {
              badge: "Agency in Dubai Marina",
              quote:
                "Our Palm Jumeirah listings convert at 3× the previous rate. The AI copy is indistinguishable from our best agents.",
              label: "Managing Director",
              avatarBg: c.dark,
              dark: false,
            },
            {
              badge: "DLD Certified · Dubai",
              badgeVariant: "green" as const,
              quote:
                "Zero RERA suspensions. The compliance engine is the most reliable system in our entire operation.",
              label: "Compliance Director",
              avatarBg: c.green,
              dark: true,
            },
            {
              badge: "Agency in Abu Dhabi",
              quote:
                "600+ listings, 4 portals, one platform. Scaled 40% without adding a single coordinator to our team.",
              label: "Chief Executive",
              avatarBg: c.amber,
              dark: false,
            },
          ].map((t, i) => (
            <div
              key={i}
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
                }}
              >
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: t.dark ? "rgba(255,255,255,0.4)" : c.muted,
                  }}
                >
                  — {t.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        style={{ padding: "80px 24px 0", background: "#F7F8FC" }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto", paddingBottom: 96 }}>

        {/* Hero */}
        <div style={{ textAlign: "center", padding: "0 0 56px" }}>
          <h2 style={{
            fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 800,
            color: "#0F172A", lineHeight: 1.15, marginBottom: 16,
          }}>
            Pay for what you generate.
            <br />
            <span style={{ color: "#1D4ED8" }}>Nothing more.</span>
          </h2>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#EFF6FF", border: "1px solid #BFDBFE",
            borderRadius: 100, padding: "5px 14px", marginBottom: 28,
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#1D4ED8", letterSpacing: "0.04em" }}>
              CANCEL ANYTIME
            </span>
          </div>

          {/* Billing toggle */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <button
              onClick={() => setBilling("monthly")}
              style={{
                fontSize: 14, fontWeight: billing === "monthly" ? 700 : 500,
                color: billing === "monthly" ? "#0F172A" : "#9CA3AF",
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", padding: "2px 4px",
              }}
            >
              Monthly
            </button>
            <div
              onClick={() => setBilling(billing === "monthly" ? "annual" : "monthly")}
              style={{
                width: 44, height: 24, borderRadius: 100, cursor: "pointer",
                background: billing === "annual" ? "#1D4ED8" : "#D1D5DB",
                position: "relative", transition: "background 0.2s",
              }}
            >
              <div style={{
                position: "absolute", top: 3, left: billing === "annual" ? 23 : 3,
                width: 18, height: 18, borderRadius: "50%", background: "#fff",
                transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
              }} />
            </div>
            <button
              onClick={() => setBilling("annual")}
              style={{
                fontSize: 14, fontWeight: billing === "annual" ? 700 : 500,
                color: billing === "annual" ? "#0F172A" : "#9CA3AF",
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", padding: "2px 4px",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              Annual
              <span style={{
                fontSize: 11, fontWeight: 800, color: "#065F46",
                background: "#D1FAE5", border: "1px solid #6EE7B7",
                borderRadius: 100, padding: "2px 8px", letterSpacing: "0.03em",
              }}>
                SAVE 15%
              </span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
            alignItems: "stretch",
          }}
        >
          {pricingPlans.map((plan) => (
            <div
              key={plan.key}
              style={{
                background: plan.highlight ? "linear-gradient(160deg, #1D4ED8 0%, #1e3a8a 100%)" : "#fff",
                border: plan.highlight ? "none" : "1.5px solid #EAECF0",
                borderRadius: 20,
                padding: 28,
                boxShadow: plan.highlight
                  ? "0 16px 48px rgba(29,78,216,0.3)"
                  : "0 2px 12px rgba(0,0,0,0.04)",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {plan.badge && (
                <div style={{
                  position: "absolute", top: 20, right: 20,
                  background: "#FDE68A", color: "#92400E",
                  fontSize: 10, fontWeight: 800, letterSpacing: "0.06em",
                  padding: "3px 10px", borderRadius: 100,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <Star size={9} style={{ fill: "#92400E" }} />
                  {plan.badge.toUpperCase()}
                </div>
              )}

              {/* Plan header */}
              <div style={{ marginBottom: 20 }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                  color: plan.highlight ? "rgba(255,255,255,0.55)" : "#9CA3AF", marginBottom: 4,
                }}>
                  {plan.name}
                </p>
                <p style={{ fontSize: 12, color: plan.highlight ? "rgba(255,255,255,0.5)" : "#6B7280", marginBottom: 16 }}>
                  {plan.tagline}
                </p>
                {/* Price — switches with billing toggle for plus/pro */}
                {(() => {
                  const isDiscountable = plan.key === "plus" || plan.key === "pro";
                  const annualMonthly = plan.key === "plus" ? 79 : plan.key === "pro" ? 125 : null;
                  const showAnnual = billing === "annual" && isDiscountable;
                  return (
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                        <span style={{
                          fontSize: plan.key === "enterprise" ? 26 : 36, fontWeight: 800,
                          color: plan.highlight ? "#fff" : "#0F172A", lineHeight: 1,
                        }}>
                          {showAnnual ? `AED ${annualMonthly}` : plan.priceLabel}
                        </span>
                        <span style={{ fontSize: 12, color: plan.highlight ? "rgba(255,255,255,0.45)" : "#9CA3AF" }}>
                          {showAnnual ? "/ mo" : plan.priceSub}
                        </span>
                      </div>
                      {showAnnual && (
                        <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 12, color: plan.highlight ? "rgba(255,255,255,0.35)" : "#9CA3AF", textDecoration: "line-through" }}>
                            AED {plan.key === "plus" ? "92" : "147"}/mo
                          </span>
                          <span style={{
                            fontSize: 11, fontWeight: 700, color: plan.highlight ? "#6EE7B7" : "#065F46",
                            background: plan.highlight ? "rgba(110,231,183,0.15)" : "#D1FAE5",
                            borderRadius: 100, padding: "1px 7px",
                          }}>
                            billed AED {plan.key === "plus" ? "937" : "1,499"}/yr
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })()}
                <div style={{
                  marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5,
                  background: plan.highlight ? "rgba(255,255,255,0.1)" : "#F0F9FF",
                  borderRadius: 6, padding: "4px 10px",
                }}>
                  <Zap size={11} color={plan.highlight ? "rgba(255,255,255,0.7)" : "#1D4ED8"} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: plan.highlight ? "rgba(255,255,255,0.8)" : "#1D4ED8" }}>
                    {plan.creditsLabel}
                  </span>
                </div>
              </div>

              {/* CTA */}
              {plan.ctaHref ? (
                <Link
                  href={plan.ctaHref}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    width: "100%", padding: "12px 0", borderRadius: 10, textDecoration: "none",
                    fontSize: 14, fontWeight: 700,
                    background: plan.highlight ? "#fff" : plan.key === "free" ? "#0F172A" : "#EFF6FF",
                    color: plan.highlight ? "#1D4ED8" : plan.key === "free" ? "#fff" : "#1D4ED8",
                    marginBottom: 24, boxSizing: "border-box",
                  }}
                >
                  {plan.cta}
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <button
                  onClick={() => handlePlanCta(plan.key)}
                  disabled={!!loadingPlan}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    width: "100%", padding: "12px 0", borderRadius: 10,
                    fontSize: 14, fontWeight: 700, border: "none", cursor: loadingPlan ? "not-allowed" : "pointer",
                    background: plan.highlight ? "#fff" : "#EFF6FF",
                    color: "#1D4ED8",
                    fontFamily: "inherit",
                    opacity: loadingPlan && loadingPlan !== plan.key ? 0.5 : 1,
                    marginBottom: 24,
                  }}
                >
                  {loadingPlan === plan.key ? "Redirecting..." : plan.cta}
                  <ArrowRight size={14} />
                </button>
              )}

              {/* Feature list */}
              <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 5,
                      background: plan.highlight ? "rgba(255,255,255,0.15)" : "#EFF6FF",
                      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    }}>
                      <Check size={11} color={plan.highlight ? "#fff" : "#1D4ED8"} strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: 13, color: plan.highlight ? "rgba(255,255,255,0.85)" : "#374151", lineHeight: 1.4 }}>
                      {f}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>

        {/* Credit packs */}
        <div style={{ marginTop: 72 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>
              Need a few more listings?
            </h2>
            <p style={{ fontSize: 14, color: "#6B7280" }}>
              Buy extra credits on any plan — they never expire and stack on top of your monthly allowance.
            </p>
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16, maxWidth: 700, margin: "0 auto",
          }}>
            {creditPacks.map((pack) => (
              <button
                key={pack.key}
                onClick={() => handleBuyPack(pack.key)}
                disabled={!!loadingPack}
                style={{
                  padding: "20px 20px 18px", borderRadius: 16, cursor: loadingPack ? "not-allowed" : "pointer",
                  border: pack.popular ? "2px solid #1D4ED8" : "1.5px solid #EAECF0",
                  background: pack.popular ? "#EFF6FF" : "#fff",
                  fontFamily: "inherit", textAlign: "left",
                  opacity: loadingPack && loadingPack !== pack.key ? 0.5 : 1,
                  boxShadow: pack.popular ? "0 4px 20px rgba(29,78,216,0.12)" : "none",
                }}
              >
                {pack.popular && (
                  <div style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: "0.08em", color: "#1D4ED8",
                    background: "#DBEAFE", display: "inline-block",
                    padding: "2px 8px", borderRadius: 100, marginBottom: 10,
                  }}>
                    BEST VALUE
                  </div>
                )}
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 2 }}>{pack.label}</div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 12 }}>{pack.perCredit}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 22, fontWeight: 800, color: "#1D4ED8" }}>{pack.price}</span>
                  <ArrowRight size={16} color={pack.popular ? "#1D4ED8" : "#9CA3AF"} />
                </div>
                {loadingPack === pack.key && (
                  <p style={{ fontSize: 11, color: "#6B7280", marginTop: 6, textAlign: "center" }}>Redirecting...</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div style={{ marginTop: 80 }}>
          <h2 style={{ textAlign: "center", fontSize: 24, fontWeight: 800, color: "#0F172A", marginBottom: 32 }}>
            Compare plans
          </h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  {["Feature", "Free", "Plus", "Pro", "Enterprise"].map((h, i) => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: i === 0 ? "left" : "center",
                      fontSize: 12, fontWeight: 700, color: "#6B7280",
                      borderBottom: "2px solid #EAECF0", whiteSpace: "nowrap",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Monthly credits",        "1",  "5",  "15", "Unlimited"],
                  ["Extra credit packs",      "✓",  "✓",  "✓",  "✓"],
                  ["English + Arabic output", "✓",  "✓",  "✓",  "✓"],
                  ["Property portal copy",    "✓",  "✓",  "✓",  "✓"],
                  ["WhatsApp & Instagram",    "—",  "—",  "✓",  "✓"],
                  ["Email support",           "—",  "✓",  "✓",  "✓"],
                  ["Priority support",        "—",  "—",  "✓",  "✓"],
                  ["Advanced analytics",      "—",  "—",  "✓",  "✓"],
                  ["Admin dashboard",         "—",  "—",  "—",  "✓"],
                  ["White-label platform",    "—",  "—",  "—",  "✓"],
                  ["Dedicated account mgr",   "—",  "—",  "—",  "✓"],
                  ["SLA guarantee",           "—",  "—",  "—",  "✓"],
                  ["Portal integrations",     "—",  "—",  "—",  "✓"],
                ].map(([label, free, plus, pro, ent], i) => (
                  <tr key={label} style={{ background: i % 2 === 0 ? "#FAFAFA" : "#fff" }}>
                    <td style={{ padding: "11px 16px", color: "#374151", fontWeight: 500 }}>{label}</td>
                    {[free, plus, pro, ent].map((val, j) => (
                      <td key={j} style={{ padding: "11px 16px", textAlign: "center", color: val === "—" ? "#D1D5DB" : val === "✓" ? "#1D4ED8" : "#0F172A", fontWeight: val === "✓" ? 700 : 600 }}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr style={{ background: "#F7F8FC" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 700, color: "#0F172A" }}>Price</td>
                  {["Free", "AED 92/mo", "AED 147/mo", "Custom"].map((p, i) => (
                    <td key={i} style={{ padding: "14px 16px", textAlign: "center", fontWeight: 800, color: i === 2 ? "#1D4ED8" : "#0F172A" }}>
                      {p}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 80, maxWidth: 680, margin: "80px auto 0" }}>
          <h2 style={{ textAlign: "center", fontSize: 24, fontWeight: 800, color: "#0F172A", marginBottom: 32 }}>
            Common questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {pricingFaqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  background: "#fff", border: "1.5px solid #EAECF0",
                  borderRadius: 12, overflow: "hidden",
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 20px", background: "none", border: "none", cursor: "pointer",
                    fontFamily: "inherit", textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{faq.q}</span>
                  <span style={{
                    fontSize: 18, color: "#9CA3AF", lineHeight: 1,
                    transform: openFaq === i ? "rotate(45deg)" : "none",
                    transition: "transform 0.2s", flexShrink: 0, marginLeft: 12,
                  }}>+</span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: "0 20px 16px" }}>
                    <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise CTA */}
        <div style={{
          marginTop: 72, background: "linear-gradient(135deg, #0F1829 0%, #1D3461 100%)",
          borderRadius: 24, padding: "48px 40px", textAlign: "center",
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12, background: "rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
          }}>
            <MessageSquare size={22} color="#5DA3FF" />
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 10 }}>
            Running a brokerage?
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", maxWidth: 420, margin: "0 auto 28px" }}>
            Enterprise plans start at 10 agents with a dedicated account manager, white-label options, and custom per-agent pricing.
          </p>
          <Link
            href="/contact-sales"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#fff", color: "#0F1829",
              fontSize: 14, fontWeight: 700, padding: "13px 28px", borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Talk to our team
            <ArrowRight size={15} />
          </Link>
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
            maxWidth: 640,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontWeight: 800,
              fontSize: "clamp(32px, 5vw, 52px)",
              color: "white",
              marginBottom: 16,
              lineHeight: 1.1,
            }}
          >
            Ready to transform your
            <br />
            listing workflow?
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 14,
              lineHeight: 1.8,
              marginBottom: 32,
              maxWidth: 440,
              margin: "0 auto 32px",
            }}
          >
            Sign up in minutes and get 14 days free — no credit card required.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a
              href="/auth?tab=signup"
              style={{
                display: "inline-block",
                background: c.blue,
                color: "white",
                padding: "13px 32px",
                fontWeight: 600,
                fontSize: 14,
                borderRadius: 6,
                textDecoration: "none",
                fontFamily: "var(--font-jakarta), sans-serif",
              }}
            >
              Start your 14-day free trial
            </a>
            <a
              href="/auth"
              style={{
                display: "inline-block",
                border: "1.5px solid rgba(255,255,255,0.2)",
                color: "white",
                padding: "13px 32px",
                fontWeight: 500,
                fontSize: 14,
                borderRadius: 6,
                textDecoration: "none",
                fontFamily: "var(--font-jakarta), sans-serif",
              }}
            >
              Login
            </a>
          </div>
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
          Enlist<span style={{ color: c.blueLight }}>a</span>
        </span>
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 12 }}>
          © 2026 · Dubai, UAE
        </span>
      </footer>
    </div>
  );
}
