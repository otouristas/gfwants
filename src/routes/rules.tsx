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
          You pay to put your name, your product, or your joke on this page. Rank is the cash —
          nothing else. A completed payment is what claims the slot. We leave Monday. If this
          overshoots I will buy more AI Max and try to finish 1,454 projects.
        </p>

        <Section title="How the wall works">
          <li>This is not a charity and not tax-deductible. You are buying a screenshot and a link.</li>
          <li>Amounts are in euros. Impulse is €2, €5, €10, €25, €50, and €100.</li>
          <li>Product slots start at €50. Those put a real website on this homepage with a sponsored link.</li>
          <li>Card payments go through Stripe. When Stripe says paid, you land on the wall. Money goes to Touristas AI. Not a charity.</li>
          <li>Limited slots stay limited. When they are gone, they are gone.</li>
          <li>Equal amounts keep the older listing higher. You cannot steal a rank by matching it.</li>
          <li>The Girlfriend Approval Index is a joke KPI. It goes up when money comes in. That is the entire algorithm.</li>
        </Section>

        <Section title="What you can put on the wall">
          <li>A product, a company, a newsletter, an app, or an X profile.</li>
          <li>Sponsors must include a real website. That is the point of paying.</li>
          <li>Links are marked rel=sponsored. You are buying attention, not fake search equity.</li>
          <li>Chat and invite links are not allowed — Telegram, WhatsApp, Discord, Messenger, Signal, and similar.</li>
          <li>Adult, porn, and NSFW links are not allowed. If it is an adult platform, it does not belong here.</li>
          <li>Link shorteners are not allowed. Put the real URL.</li>
          <li>Query parameters are stripped. Affiliate and tracking URLs will not survive.</li>
          <li>Your listing is public. Name, handle, message, and product go on the internet.</li>
        </Section>

        <Section title="After you pay">
          <li>A completed payment is what claims the slot. Drafts do not count.</li>
          <li>No refunds. You bought a joke. The joke is already on the wall.</li>
          <li>I may remove a listing that breaks these rules. The charge still stands.</li>
          <li>I am not her lawyer, your lawyer, or a registered fundraiser.</li>
        </Section>

        <p className="mt-10 text-sm text-muted">
          Still want in?{" "}
          <Link to="/" hash="sponsor" className="text-fg underline decoration-border-strong underline-offset-4">
            Sponsor the trip
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
