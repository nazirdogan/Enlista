import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

// ─── Subscription plans ───────────────────────────────────────────────────────
export const PLANS = {
  plus: {
    name: "Plus",
    priceId: process.env.STRIPE_PRICE_PLUS!,
    price: 25,        // USD/month
    credits: 5,       // listings per month
  },
  pro: {
    name: "Pro",
    priceId: process.env.STRIPE_PRICE_PRO!,
    price: 40,        // USD/month
    credits: 15,      // listings per month
  },
} as const;

export type PlanKey = keyof typeof PLANS;

// ─── One-time credit packs ────────────────────────────────────────────────────
export const CREDIT_PACKS = {
  credits_5: {
    name: "5 Extra Credits",
    priceId: process.env.STRIPE_PRICE_CREDITS_5!,
    price: 15,        // USD one-time
    credits: 5,
  },
  credits_10: {
    name: "10 Extra Credits",
    priceId: process.env.STRIPE_PRICE_CREDITS_10!,
    price: 25,        // USD one-time
    credits: 10,
  },
  credits_20: {
    name: "20 Extra Credits",
    priceId: process.env.STRIPE_PRICE_CREDITS_20!,
    price: 40,        // USD one-time
    credits: 20,
  },
} as const;

export type CreditPackKey = keyof typeof CREDIT_PACKS;
