"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PublicNav } from "@/components/PublicNav";
import { useRouter } from "next/navigation";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { Check, Zap, ArrowRight, Star, MessageSquare } from "lucide-react";
import { HeroCard } from "@/components/HeroCard";
import { PRICING_PLANS, CREDIT_PACKS, PRICING_FAQS, PLAN_PRICES } from "@/lib/pricing-data";

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

// Pricing data is imported from lib/pricing-data.ts — edit prices there.
const pricingPlans = PRICING_PLANS;
const creditPacks = CREDIT_PACKS;
const pricingFaqs = PRICING_FAQS;

// ──────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPack, setLoadingPack] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
      <PublicNav />

      {/* Hero */}
      <div style={{ background: c.white, minHeight: 'calc(100vh - 57px)', display: 'flex', alignItems: 'center' }}>
      <section style={{ padding: '64px 24px', maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 48,
          alignItems: 'center',
        }}>
          {/* Left: copy */}
          <div>
            {/* Pill */}
            <div className="hero-item hero-d0" style={{
              display: 'inline-block',
              background: c.bluePale,
              color: c.blue,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '.08em',
              textTransform: 'uppercase',
              padding: '5px 12px',
              borderRadius: 20,
              marginBottom: 18,
            }}>
              For UAE property agents
            </div>

            {/* Headline */}
            <h1 className="hero-item hero-d1" style={{
              fontWeight: 800,
              fontSize: 'clamp(36px, 5vw, 60px)',
              lineHeight: 1.08,
              color: c.dark,
              marginBottom: 20,
            }}>
              Less typing.<br />
              More viewings.<br />
              <span style={{ color: c.blue }}>More closings.</span>
            </h1>

            {/* Subtitle */}
            <p className="hero-item hero-d2" style={{
              color: c.muted,
              fontSize: 16,
              lineHeight: 1.8,
              maxWidth: 440,
              marginBottom: 36,
            }}>
              Describe a property and get a ready-to-publish listing in English and Arabic.
              Get 24/7 WhatsApp follow-up on every enquiry — we set the automation up for you.
            </p>

            {/* CTAs */}
            <div className="hero-item hero-d3" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
              <a
                href="/auth?tab=signup"
                className="btn-primary-hover"
                style={{
                  display: 'inline-block',
                  background: c.blue,
                  color: 'white',
                  padding: '10px 24px',
                  fontWeight: 600,
                  fontSize: 13,
                  borderRadius: 6,
                  textDecoration: 'none',
                }}
              >
                Start free trial
              </a>
              <a
                href="/auth"
                className="btn-outline-hover"
                style={{
                  display: 'inline-block',
                  border: `1.5px solid ${c.border}`,
                  color: c.text,
                  padding: '10px 24px',
                  fontWeight: 500,
                  fontSize: 13,
                  borderRadius: 6,
                  textDecoration: 'none',
                }}
              >
                Login
              </a>
            </div>

            {/* Trust signals */}
            <p className="hero-item hero-d4" style={{ fontSize: 11, color: c.muted }}>
              ✓ No credit card required &nbsp;·&nbsp; ✓ Setup in 5 minutes &nbsp;·&nbsp; ✓ RERA compliant
            </p>
          </div>

          {/* Right: tabbed graphic */}
          <div className="hero-bento hero-d2">
            <HeroCard />
          </div>
        </div>
      </section>
      </div>

      {/* How It Works */}
      <section
        id="features"
        style={{ padding: "64px 24px", maxWidth: 1280, margin: "0 auto" }}
      >
        {/* Header */}
        <div className="reveal" style={{ marginBottom: 48 }}>
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
          <BentoCard className="reveal bento-hover" style={{ flex: 1, padding: 32 }}>
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

          <BentoCard className="reveal bento-hover" style={{ flex: 1, padding: 32 }}>
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

          <BentoCard className="reveal bento-hover" style={{ flex: 1, padding: 32 }}>
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
        <BentoCard className="reveal" style={{ padding: 40, marginTop: 12 }}>
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

      {/* WhatsApp Automation */}
      <section
        id="whatsapp-automation"
        style={{ padding: "80px 24px", background: c.dark }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 56, alignItems: "center", marginBottom: 64 }}>
            <div className="reveal reveal-left">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                background: "rgba(37,211,102,0.15)", color: "#25D366", marginBottom: 20 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#25D366", display: "inline-block" }} />
                New — WhatsApp Automation
              </span>
              <h2 style={{ fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, lineHeight: 1.1,
                color: "#fff", margin: "0 0 20px" }}>
                Your listings,{" "}
                <span style={{ color: "#25D366" }}>followed up</span>{" "}
                instantly.
              </h2>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.8, margin: "0 0 32px", maxWidth: 460 }}>
                Enlista automatically qualifies every lead and books viewings over WhatsApp — the moment someone enquires. No manual chasing. No missed deals.
              </p>
              {/* Stats */}
              <div style={{ display: "flex", gap: 36, marginBottom: 36, flexWrap: "wrap" }}>
                {[
                  ["< 30 sec", "first reply time"],
                  ["5 questions", "to qualify a lead"],
                  ["24 / 7", "automated follow-up"],
                ].map(([num, label]) => (
                  <div key={num}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{num}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="/whatsapp-automation" style={{ display: "inline-flex", alignItems: "center", gap: 8,
                  background: "#25D366", color: "white", padding: "13px 28px",
                  fontWeight: 600, fontSize: 14, borderRadius: 8, textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(37,211,102,0.35)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  See How It Works
                </a>
                <a href="/contact-sales" style={{ display: "inline-flex", alignItems: "center", gap: 8,
                  border: "1.5px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.8)",
                  padding: "13px 28px", fontWeight: 500, fontSize: 14, borderRadius: 8, textDecoration: "none" }}>
                  Book a Demo
                </a>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="reveal reveal-right" style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ width: 280, background: "#1a1a2e", borderRadius: 28,
                padding: "12px 12px 20px", boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
                border: "3px solid #2a2a3e" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                  <div style={{ width: 80, height: 6, borderRadius: 4, background: "#2a2a3e" }} />
                </div>
                <div style={{ background: "#128C7E", borderRadius: "12px 12px 0 0",
                  padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#25D366",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Enlista Bot</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>● online</div>
                  </div>
                </div>
                <div style={{ background: "#ECE5DD", padding: "12px 10px", borderRadius: "0 0 12px 12px" }}>
                  {([
                    { sender: "bot", text: "Hi! 👋 You enquired about the 2BR in Dubai Marina. What's your budget?\n\n1. Below AED 1.9M\n2. AED 1.9M–2.2M\n3. Above AED 2.2M", time: "9:01 AM" },
                    { sender: "lead", text: "2", time: "9:03 AM" },
                    { sender: "bot", text: "Perfect match! 🎯 Cash buyer or mortgage?", time: "9:03 AM" },
                    { sender: "lead", text: "Cash buyer", time: "9:04 AM" },
                    { sender: "bot", text: "Great! Reply BOOK to choose a viewing slot 📅", time: "9:04 AM" },
                  ] as { sender: string; text: string; time: string }[]).map((msg, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: msg.sender === "bot" ? "flex-start" : "flex-end", marginBottom: 8 }}>
                      <div style={{
                        maxWidth: "85%",
                        background: msg.sender === "bot" ? "#fff" : "#DCF8C6",
                        borderRadius: msg.sender === "bot" ? "2px 12px 12px 12px" : "12px 2px 12px 12px",
                        padding: "8px 12px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
                      }}>
                        <div style={{ fontSize: 11, color: "#1a1a1a", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{msg.text}</div>
                        <div style={{ fontSize: 10, color: "#999", textAlign: "right", marginTop: 2 }}>{msg.time} ✓✓</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: "#1E293B", borderRadius: 8, padding: "6px 12px", marginTop: 4 }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Lead score</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#22c55e",
                      background: "rgba(34,197,94,0.12)", padding: "2px 10px", borderRadius: 12 }}>
                      🔥 HOT — 92/100
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { icon: "🎯", title: "Lead Qualification", desc: "5 smart questions score every lead as Hot, Warm, or Cold — automatically." },
              { icon: "📅", title: "Viewing Booking", desc: "Leads pick a slot from your calendar. Confirmation and reminders sent instantly." },
              { icon: "🔔", title: "Instant Agent Alerts", desc: "You get a WhatsApp summary with full lead score the moment they qualify." },
              { icon: "📊", title: "Bayut & PF Ready", desc: "Works with enquiries from Bayut, Property Finder, Dubizzle, and direct WA links." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="reveal bento-hover" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12, padding: 24 }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        style={{ padding: "80px 24px 0", background: "#F7F8FC" }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto", paddingBottom: 96 }}>

        {/* Hero */}
        <div className="reveal" style={{ textAlign: "center", padding: "0 0 56px" }}>
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
              className="reveal pricing-card-hover"
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
                  const annualMonthly = plan.key === "plus" ? PLAN_PRICES.plus.annualMonthly : plan.key === "pro" ? PLAN_PRICES.pro.annualMonthly : null;
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
                            AED {plan.key === "plus" ? PLAN_PRICES.plus.monthly : PLAN_PRICES.pro.monthly}/mo
</span>
                          <span style={{
                            fontSize: 11, fontWeight: 700, color: plan.highlight ? "#6EE7B7" : "#065F46",
                            background: plan.highlight ? "rgba(110,231,183,0.15)" : "#D1FAE5",
                            borderRadius: 100, padding: "1px 7px",
                          }}>
                            billed AED {plan.key === "plus" ? PLAN_PRICES.plus.annual.toLocaleString() : PLAN_PRICES.pro.annual.toLocaleString()}/yr
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
        <div className="reveal" style={{ marginTop: 72 }}>
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

        {/* FAQ */}
        <div className="reveal" style={{ marginTop: 80, maxWidth: 680, margin: "80px auto 0" }}>
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

        {/* Testimonials */}
        <div className="reveal" style={{ marginTop: 80 }}>
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
                className="testimonial-hover"
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
