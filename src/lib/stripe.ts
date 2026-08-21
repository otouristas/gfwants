import Stripe from "stripe";
import { getRequest } from "@tanstack/react-start/server";
import { formatMoney } from "@/lib/fund";

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("Card checkout is not live on this deploy yet. The secret is missing.");
  }
  return new Stripe(key);
}

export function appOrigin(): string {
  try {
    const req = getRequest();
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    if (host) return `${proto}://${host}`;
  } catch {
    /* server fn without a request */
  }
  return "https://mygirlfriendisfurious.lol";
}

export async function createBidCheckout(input: {
  pendingId: string;
  amountCents: number;
  displayName: string;
  productName: string | null;
  productUrl: string | null;
  message: string;
}): Promise<string> {
  const stripe = getStripe();
  const origin = appOrigin();
  const label = input.productName
    ? `${input.productName} on the wall`
    : `Bid ${formatMoney(input.amountCents)} — save the vacation`;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    currency: "eur",
    client_reference_id: input.pendingId,
    customer_creation: "if_required",
    submit_type: "pay",
    metadata: {
      pendingId: input.pendingId,
      amountCents: String(input.amountCents),
      displayName: input.displayName.slice(0, 80),
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: input.amountCents,
          product_data: {
            name: label.slice(0, 120),
            description: (input.productUrl || input.message || "mygirlfriendisfurious.lol").slice(0, 200),
          },
        },
      },
    ],
    success_url: `${origin}/thanks?session_id={CHECKOUT_SESSION_ID}&pending=${encodeURIComponent(input.pendingId)}`,
    cancel_url: `${origin}/?canceled=1`,
  });
  if (!session.url) throw new Error("Stripe did not return a checkout URL");
  return session.url;
}

export async function paidSession(sessionId: string): Promise<{
  amountCents: number;
  pendingId: string | null;
  customerName: string | null;
} | null> {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const paid = session.payment_status === "paid" || session.status === "complete";
  if (!paid) return null;
  return {
    amountCents: session.amount_total ?? 0,
    pendingId:
      (typeof session.client_reference_id === "string" && session.client_reference_id) ||
      session.metadata?.pendingId ||
      null,
    customerName: session.customer_details?.name ?? session.customer_details?.email ?? null,
  };
}
