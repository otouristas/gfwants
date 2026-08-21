import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteChrome } from "@/components/site-chrome";
import { OWNER_HANDLE } from "@/lib/fund";
import { getFund } from "@/lib/fund-api";

export const Route = createFileRoute("/about")({
  loader: () => getFund(),
  component: AboutPage,
  head: () => ({
    meta: [{ title: "About · mygirlfriendisfurious.lol" }],
  }),
});

function AboutPage() {
  const fund = Route.useLoaderData();
  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SiteChrome raisedCents={fund.raisedCents} />
      <article className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="text-xs tracking-[0.18em] text-muted uppercase">A simple side project</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">About</h1>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-muted">
          <p>
            The trip exists. We leave Monday. I still spent the vacation money on Claude Max,
            ChatGPT, Cursor, Ahrefs, APIs, and this domain. I have 1,454 unfinished projects. If
            this page makes more than we need, I will buy more Max and try to finish them. She has
            been informed. She is still packing. She is still furious.
          </p>
          <p>
            So the internet gets to put its products on the apology. You pay, your site goes on the
            homepage, we still board, and everybody gets a screenshot.
          </p>
          <p>
            Card is Stripe. Wise is faster. This is a humorous personal project. Not a
            charity. Not tax deductible. I will not send you a receipt that looks like a 501(c)(3).
          </p>
          <p>
            The public wall is the product. Rank is cash. Rules are at{" "}
            <Link to="/rules" className="text-fg underline decoration-border-strong underline-offset-4">
              /rules
            </Link>
            .
          </p>
          <p>
            Built in one sitting because I have not learned my lesson. If you need someone who grows
            things without lighting the vacation fund on fire, I am{" "}
            <a
              href={`https://x.com/${OWNER_HANDLE}`}
              className="text-fg underline decoration-border-strong underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
            >
              @{OWNER_HANDLE}
            </a>
            .
          </p>
        </div>
      </article>
    </div>
  );
}
