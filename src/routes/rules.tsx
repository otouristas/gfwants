import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/site-chrome";
import { getFund } from "@/lib/fund-api";

export const Route = createFileRoute("/rules")({
  loader: () => getFund(),
  component: RulesPage,
  head: () => ({
    meta: [{ title: "Rules · mygirlfriendisfurious.lol" }],
  }),
});

function RulesPage() {
  const fund = Route.useLoaderData();
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SiteChrome raisedCents={fund.raisedCents} />
      <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs tracking-[0.18em] text-muted uppercase">The house rules</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">Rules</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          You pay to put your name and your website on this page. Rank is the cash. Highest bid is
          #1. A completed payment is what claims the slot. We leave Monday.
        </p>

        <Section title="How the board works">
          <li>This is not a charity and not tax-deductible. You are buying a screenshot and a link.</li>
          <li>Bid any amount from €1 to €10,000. Custom amounts are the point. Or buy a slot on the ladder.</li>
          <li>€4,999 naming rights + two €2,499 savers = €9,997. Then one €5 hero and the crisis is technically over.</li>
          <li>To take a rank you must pay at least €1 more than the listing sitting there.</li>
          <li>Equal amounts keep the older listing higher. Matching does not steal the rank.</li>
          <li>When the charge succeeds, you show up on the homepage. Order is highest bid first.</li>
          <li>Card is Stripe. The amount you pick is the amount you pay.</li>
        </Section>

        <Section title="What you can put on the board">
          <li>A product, a company, a newsletter, an app, or a website.</li>
          <li>Links are marked rel=sponsored. You are buying attention, not fake search equity.</li>
          <li>Chat and invite links are not allowed — Telegram, WhatsApp, Discord, Messenger, Signal, and similar.</li>
          <li>Adult, porn, and NSFW links are not allowed.</li>
          <li>Link shorteners are not allowed. Put the real URL.</li>
          <li>Your listing is public. Name, pitch, and website go on the internet.</li>
        </Section>

        <Section title="After you pay">
          <li>A completed payment is what claims the rank. Drafts do not count.</li>
          <li>No refunds. You bought a joke. The joke is already on the board.</li>
          <li>I may remove a listing that breaks these rules. The charge still stands.</li>
        </Section>

        <p className="mt-10 text-sm text-muted">
          Still want in?{" "}
          <Link to="/" className="text-fg underline decoration-border-strong underline-offset-4">
            Bid on the leaderboard
          </Link>
          .
        </p>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-medium">{title}</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted marker:text-faint">
        {children}
      </ul>
    </section>
  );
}
