import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const PLANS = {
  solo: {
    name: "Solo",
    priceId: process.env.STRIPE_PRICE_SOLO!,
    price: 75,
  },
  boutique: {
    name: "Boutique",
    priceId: process.env.STRIPE_PRICE_BOUTIQUE!,
    price: 120,
  },
  agency: {
    name: "Agency",
    priceId: process.env.STRIPE_PRICE_AGENCY!,
    price: 250,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
