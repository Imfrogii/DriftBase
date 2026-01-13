import Stripe from "stripe";

// Загружаем .env (важно для Next.js App Router)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    "STRIPE_SECRET_KEY is missing. Please set it in your .env.local file."
  );
}

// Основной клиент Stripe (для твоей платформы)
export const stripe = new Stripe(stripeSecretKey, {
  typescript: true,
  appInfo: {
    name: "Driftuj.pl", // TODO Change to Driftbase?
    version: "1.0.0",
    url: process.env.NEXT_PUBLIC_URL || "https://localhost:3000",
  },
});
