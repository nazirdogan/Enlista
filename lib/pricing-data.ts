// ─── Single source of truth for all customer-facing pricing ──────────────────
// Update prices here and they'll automatically reflect on both the landing page
// (/#pricing) and the dedicated pricing page (/pricing).

export const PLAN_PRICES = {
  plus: {
    monthly:      95,   // AED/month
    annual:       968,  // AED/year  (≈15% off monthly)
    annualMonthly: 81,  // AED/mo shown when billed annually (968 / 12, rounded)
  },
  pro: {
    monthly:       145,  // AED/month
    annual:        1479, // AED/year  (≈15% off monthly)
    annualMonthly: 123,  // AED/mo shown when billed annually (1479 / 12, rounded)
  },
} as const;

export const CREDIT_PACK_PRICES = {
  credits_5:  { amount: 50,  perCredit: "AED 10.00" },
  credits_10: { amount: 90,  perCredit: "AED 9.00"  },
  credits_20: { amount: 140, perCredit: "AED 7.00"  },
} as const;

// ─── Plan data used by both the landing page and /pricing ────────────────────

export const PRICING_PLANS = [
  {
    key: "free",
    name: "Free",
    tagline: "Try before you commit",
    price: 0,
    priceLabel: "Free",
    priceSub: "forever",
    credits: 1,
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
    missing: ["Additional listings", "Priority support"],
  },
  {
    key: "plus",
    name: "Plus",
    tagline: "For active individual agents",
    price: PLAN_PRICES.plus.monthly,
    priceLabel: `AED ${PLAN_PRICES.plus.monthly}`,
    priceSub: "per month",
    credits: 5,
    creditsLabel: "5 listings/month",
    cta: "Start with Plus",
    ctaHref: null as string | null,
    highlight: false,
    features: [
      "Everything in Free",
      "5 listing credits per month",
      "Credits reset on the 1st",
      "Buy extra credits anytime",
      "Email support",
    ],
    missing: [] as string[],
  },
  {
    key: "pro",
    name: "Pro",
    tagline: "For high-volume agents",
    price: PLAN_PRICES.pro.monthly,
    priceLabel: `AED ${PLAN_PRICES.pro.monthly}`,
    priceSub: "per month",
    credits: 15,
    creditsLabel: "15 listings/month",
    cta: "Start with Pro",
    ctaHref: null as string | null,
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
    missing: [] as string[],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    tagline: "For brokerages & teams",
    price: null as number | null,
    priceLabel: "Custom",
    priceSub: "per agent / per month",
    credits: null as number | null,
    creditsLabel: "Unlimited listings",
    cta: "Contact sales",
    ctaHref: "/contact-sales" as string | null,
    highlight: false,
    minAgents: 10,
    features: [
      "Minimum 10 agents",
      "Dedicated account manager",
      "White-label platform option",
      "Priority AI processing",
      "Custom onboarding & training",
      "SLA guarantee",
      "Admin dashboard & analytics",
      "Bulk listing management",
      "Portal integrations (Bayut, PF)",
    ],
    missing: [] as string[],
  },
];

// ─── Credit pack data used by both landing page and /pricing ─────────────────

export const CREDIT_PACKS = [
  {
    key: "credits_5",
    label: "5 Credits",
    price: `AED ${CREDIT_PACK_PRICES.credits_5.amount}`,
    perCredit: CREDIT_PACK_PRICES.credits_5.perCredit,
  },
  {
    key: "credits_10",
    label: "10 Credits",
    price: `AED ${CREDIT_PACK_PRICES.credits_10.amount}`,
    perCredit: CREDIT_PACK_PRICES.credits_10.perCredit,
    popular: true,
  },
  {
    key: "credits_20",
    label: "20 Credits",
    price: `AED ${CREDIT_PACK_PRICES.credits_20.amount}`,
    perCredit: CREDIT_PACK_PRICES.credits_20.perCredit,
  },
];

// ─── Shared FAQ content ───────────────────────────────────────────────────────

export const PRICING_FAQS = [
  {
    q: "What counts as one credit?",
    a: 'Each time you click "Generate" to produce a listing, one credit is used. Saving or editing an existing listing does not use credits.',
  },
  {
    q: "Do unused monthly credits roll over?",
    a: "Monthly credits reset on the 1st of each month and do not roll over. Extra credits you purchase are permanent — they never expire.",
  },
  {
    q: "Can I buy extra credits on any plan?",
    a: "Yes. Extra credit packs are available on all plans including Free. They stack on top of your monthly allowance.",
  },
  {
    q: "What happens when I run out of credits?",
    a: "You'll see a prompt in the sidebar and when you try to generate. You can immediately purchase a credit pack or upgrade your plan without losing any work.",
  },
  {
    q: "What qualifies as Enterprise?",
    a: "Enterprise is designed for brokerages with 10 or more agents. It includes a custom per-agent rate, a brokerage admin dashboard, and optional white-labelling of the platform.",
  },
  {
    q: "Can I switch plans at any time?",
    a: "Yes. Upgrades take effect immediately. Downgrades take effect at the end of your current billing cycle.",
  },
];
