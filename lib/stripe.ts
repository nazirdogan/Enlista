import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

// ─── Subscription plans ───────────────────────────────────────────────────────
export const PLANS = {
  plus: {
    name: "Plus",
    priceId: process.env.STRIPE_PRICE_PLUS!,
    price: 55,        // AED/month (~$15)
    credits: 5,       // listings per month
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRICE_PRO!,
    price: 110,       // AED/month (~$30)
    credits: 15,      // listings per month
  },
  plus_annual: {
    name: "Plus",
    priceId: process.env.STRIPE_PRICE_PLUS_ANNUAL!,
    price: 562,       // AED/year (~$153 — 15% off monthly)
    credits: 5,
  },
  pro_annual: {
    name: "Pro",
    priceId: process.env.STRIPE_PRICE_PRO_ANNUAL!,
    price: 1123,      // AED/year (~$306 — 15% off monthly)
    credits: 15,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

// ─── One-time credit packs ────────────────────────────────────────────────────
export const CREDIT_PACKS = {
  credits_5: {
    name: "5 Extra Credits",
    priceId: process.env.STRIPE_PRICE_CREDITS_5!,
    price: 73,        // AED one-time (~$20)
    credits: 5,
  },
  credits_10: {
    name: "10 Extra Credits",
    priceId: process.env.STRIPE_PRICE_CREDITS_10!,
    price: 110,       // AED one-time (~$30)
    credits: 10,
  },
  credits_20: {
    name: "20 Extra Credits",
    priceId: process.env.STRIPE_PRICE_CREDITS_20!,
    price: 184,       // AED one-time (~$50)
    credits: 20,
  },
} as const;

export type CreditPackKey = keyof typeof CREDIT_PACKS;
