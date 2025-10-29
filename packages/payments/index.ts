import "server-only";
import Stripe from "stripe";
import { keys } from "./keys";

const { STRIPE_SECRET_KEY } = keys();

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-09-30.clover",
  httpClient: Stripe.createFetchHttpClient(),
});

export const stripeWebhookCryptoProvider = Stripe.createSubtleCryptoProvider();

export type { Stripe } from "stripe";
