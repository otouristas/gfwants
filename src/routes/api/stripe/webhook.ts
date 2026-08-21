import { createFileRoute } from "@tanstack/react-router";
import { fulfillStripeSession } from "@/lib/fund-api";
import { isPaidCheckout, parseStripeEvent } from "@/lib/stripe-webhook";

export const Route = createFileRoute("/api/stripe/webhook")({
  server: {
    handlers: {
      GET: () =>
        Response.json({
          ok: true,
          listens: [
            "checkout.session.completed",
            "checkout.session.async_payment_succeeded",
            "payment_intent.succeeded",
          ],
        }),
      POST: async ({ request }) => {
        const raw = await request.text();
        const signature = request.headers.get("stripe-signature");
        let event;
        try {
          event = parseStripeEvent(raw, signature);
        } catch (err) {
          return Response.json(
            { error: err instanceof Error ? err.message : "Invalid payload" },
            { status: 400 },
          );
        }

        if (
          event.type === "checkout.session.completed" ||
          event.type === "checkout.session.async_payment_succeeded"
        ) {
          const session = event.data.object;
          if (!isPaidCheckout(session)) {
            return Response.json({ received: true, skipped: "not_paid" });
          }
          const pendingId =
            typeof session.client_reference_id === "string" ? session.client_reference_id : null;
          await fulfillStripeSession({
            sessionId: session.id,
            pendingId,
            amountCents: session.amount_total,
            customerName: session.customer_details?.name ?? session.customer_details?.email ?? null,
          });
          return Response.json({ received: true, fulfilled: session.id });
        }

        return Response.json({ received: true, ignored: event.type });
      },
    },
  },
});
