import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/site-chrome";
import { getFund } from "@/lib/fund-api";

export const Route = createFileRoute("/privacy")({
  loader: () => getFund(),
  component: PrivacyPage,
  head: () => ({ meta: [{ title: "Privacy · mygirlfriendisfurious.lol" }] }),
});

function PrivacyPage() {
  const fund = Route.useLoaderData();
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SiteChrome raisedCents={fund.raisedCents} />
      <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-4xl font-medium tracking-tight">Privacy</h1>
        <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
          <p>If you pay, your name, message, website and pitch go on the public homepage. That is the product.</p>
          <p>Card payments are handled by Stripe. I do not store card numbers. Clicks on sponsored links are counted so you can see if anyone actually tapped you.</p>
          <p>A visitor ping keeps a live count. No marketing emails. No sale of your data. There is nothing here except a vacation fund and a wall of sponsors.</p>
          <p>
            <Link to="/terms" className="text-fg underline">
              Terms
            </Link>
          </p>
        </div>
      </article>
    </div>
  );
}
