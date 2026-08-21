import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/site-chrome";
import { getFund } from "@/lib/fund-api";

export const Route = createFileRoute("/terms")({
  loader: () => getFund(),
  component: TermsPage,
  head: () => ({ meta: [{ title: "Terms · mygirlfriendisfurious.lol" }] }),
});

function TermsPage() {
  const fund = Route.useLoaderData();
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SiteChrome raisedCents={fund.raisedCents} />
      <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-4xl font-medium tracking-tight">Terms</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
          <p>This is a humorous personal project. You are buying a sponsored placement on a joke website. Not a charity. Not tax deductible.</p>
          <p>Payment is through Stripe. Rank is the amount paid. Equal amounts keep the older listing higher. Limited slots stay limited.</p>
          <p>Links are marked rel=sponsored. You are buying attention, not search equity. I may remove listings that break the rules. No refunds.</p>
          <p>
            <Link to="/rules" className="text-fg underline">
              Rules
            </Link>
            {" · "}
            <Link to="/privacy" className="text-fg underline">
              Privacy
            </Link>
          </p>
        </div>
      </article>
    </div>
  );
}
