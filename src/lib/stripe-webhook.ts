import Stripe from "stripe";

export function parseStripeEvent(rawBody: string, signature: string | null): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (secret && signature) {
    return Stripe.webhooks.constructEvent(rawBody, signature, secret);
  }
  const parsed = JSON.parse(rawBody) as Stripe.Event;
  if (!parsed?.type || !parsed?.data) {
    throw new Error("Not a Stripe event");
  }
  return parsed;
}

export function isPaidCheckout(session: Stripe.Checkout.Session): boolean {
  return session.payment_status === "paid" || session.status === "complete";
}
