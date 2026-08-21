import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/site-chrome";
import { formatMoney } from "@/lib/fund";
import { completeCheckout, getFund } from "@/lib/fund-api";
import { trackPurchase } from "@/lib/gtag";

type Search = { session_id?: string; pending?: string };

export const Route = createFileRoute("/thanks")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
    pending: typeof search.pending === "string" ? search.pending : undefined,
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const fund = await getFund();
    if (!deps.session_id) return { fund, paid: null as null | { amountCents: number; displayName: string } };
    try {
      const done = await completeCheckout({
        data: { sessionId: deps.session_id, pendingId: deps.pending },
      });
      if (!done.ok) return { fund, paid: null };
      return { fund: await getFund(), paid: { amountCents: done.amountCents, displayName: done.displayName } };
    } catch {
      return { fund, paid: null };
    }
  },
  component: ThanksPage,
  head: () => ({ meta: [{ title: "Paid · mygirlfriendisfurious.lol" }] }),
});

function ThanksPage() {
  const { fund, paid } = Route.useLoaderData();
  const search = Route.useSearch();
  useEffect(() => {
    if (!paid || !search.session_id) return;
    trackPurchase({
      transactionId: search.session_id,
      amountCents: paid.amountCents,
      name: paid.displayName,
    });
  }, [paid, search.session_id]);
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SiteChrome raisedCents={fund.raisedCents} />
      <article className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <p className="text-xs tracking-[0.18em] text-muted uppercase">Stripe said yes</p>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-tight">
          {paid ? `${formatMoney(paid.amountCents)} landed.` : "If you paid, you are on the wall."}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          {paid
            ? `${paid.displayName} is on the Hall of Saviors. Rank is cash. We leave Monday.`
            : "Refresh the homepage. Highest payer is #1. We leave Monday."}
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex h-11 items-center rounded-md bg-fg px-5 text-sm font-medium text-bg"
        >
          Back to the apology
        </Link>
      </article>
    </div>
  );
}
