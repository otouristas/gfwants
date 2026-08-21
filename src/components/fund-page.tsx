import { useEffect, useState, type MouseEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FEATURED_BRANDS,
  LEAVE_AT,
  OWNER_HANDLE,
  UNFINISHED_PROJECTS,
  claimCents,
  formatMoney,
  hostFromUrl,
  logoForUrl,
  timeAgo,
  type Contribution,
  type FundPayload,
} from "@/lib/fund";
import { registerClick } from "@/lib/fund-api";
import { cn } from "@/lib/utils";

export function Hero({
  fund,
  onBid,
}: {
  fund: FundPayload;
  onBid: () => void;
}) {
  return (
    <header className="mx-auto max-w-4xl px-4 pt-8 pb-4 text-center sm:px-6 sm:pt-12">
      <h1 className="sr-only">mygirlfriendisfurious.lol</h1>
      <LiveVisitors live={fund.liveVisitors} total={fund.visitorsSinceLaunch} />
      <h2 className="mt-6 max-w-2xl mx-auto text-3xl leading-[1.1] font-medium tracking-tight sm:text-5xl">
        Outbid everyone. Get on the homepage. Save the vacation.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
        We leave Monday. I spent the money on AI. Bid €1 or €10,000. Highest payer is #1. Your site
        goes on this page. She is still packing.
      </p>
      <MondayClock />
      <Button className="mt-6 h-11 px-6" onClick={onBid}>
        Claim #1 for {formatMoney(claimCents(fund.contributions[0]?.amountCents))}
      </Button>
    </header>
  );
}

function LiveVisitors({ live, total }: { live: number; total: number }) {
  return (
    <p className="text-sm text-muted">
      <span className="relative mr-1.5 inline-flex size-1.5 align-middle">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
        <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
      </span>
      <span className="font-medium text-fg tabular">{live.toLocaleString("en-US")}</span> watching
      the apology ·{" "}
      <span className="tabular">{total.toLocaleString("en-US")}</span> since this disaster launched
    </p>
  );
}

function MondayClock() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const left = Math.max(0, LEAVE_AT - now);
  const days = Math.floor(left / 86_400_000);
  const hours = Math.floor((left % 86_400_000) / 3_600_000);
  const mins = Math.floor((left % 3_600_000) / 60_000);
  const gone = left <= 0;
  return (
    <p className="mt-4 font-mono text-sm tabular text-accent">
      {gone
        ? "We are supposed to be gone. Keep bidding. I will buy Max from the boat."
        : `Boarding in ${days}d ${hours}h ${mins}m · Monday morning`}
    </p>
  );
}

export function Leaderboard({
  items,
  onClaim,
  onRefresh,
}: {
  items: Contribution[];
  onClaim: (rank: number, amountCents: number) => void;
  onRefresh: () => void;
}) {
  const [page, setPage] = useState(0);
  const per = 50;
  const pages = Math.max(1, Math.ceil(items.length / per));
  const slice = items.slice(page * per, page * per + per);

  return (
    <section className="mx-auto w-full max-w-4xl flex-1 px-4 pb-4 sm:px-6">
      <div className="overflow-hidden rounded-xl bg-elevated shadow-[var(--shadow-border)]">
        {slice.length === 0 ? (
          <p className="px-4 py-12 text-center text-sm text-muted">
            Empty board. €1 takes #1. We leave Monday.
          </p>
        ) : (
          slice.map((item, i) => {
            const rank = page * per + i + 1;
            const take = claimCents(item.amountCents);
            return (
              <div key={item.id} className="group relative border-t border-border first:border-t-0">
                <RankRow item={item} rank={rank} />
                <button
                  type="button"
                  onClick={() => onClaim(rank, take)}
                  className="pointer-events-none absolute top-1.5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-fg px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-bg opacity-0 shadow-sm transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
                >
                  claim this rank for {formatMoney(take)}
                </button>
              </div>
            );
          })
        )}
      </div>

      {pages > 1 ? (
        <nav aria-label="Ranking pages" className="mt-5 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              Prev
            </Button>
            <p className="text-sm tabular text-muted">
              {page * per + 1}–{Math.min(items.length, page * per + per)} of {items.length}
            </p>
            <Button
              size="sm"
              variant="ghost"
              disabled={page >= pages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </nav>
      ) : null}

      <div className="mt-3 flex items-center justify-end">
        <Button size="sm" variant="outline" onClick={onRefresh}>
          <RefreshCw className="size-3.5" />
          Refresh
        </Button>
      </div>
    </section>
  );
}

function RankRow({ item, rank }: { item: Contribution; rank: number }) {
  const host = item.productUrl ? hostFromUrl(item.productUrl) : null;
  const href = item.productUrl ? `/go/${item.id}` : undefined;
  const title = host ?? item.productName ?? item.displayName;
  const pitch = item.productPitch || item.message;

  async function onClick(e: MouseEvent<HTMLAnchorElement>) {
    if (!item.productUrl) return;
    e.preventDefault();
    try {
      const result = await registerClick({ data: { id: item.id } });
      window.open(result.url, "_blank", "noopener,noreferrer");
    } catch {
      window.open(item.productUrl, "_blank", "noopener,noreferrer");
    }
  }

  const inner = (
    <>
      <div className="flex w-10 shrink-0 flex-col items-center gap-1.5 md:w-auto md:flex-row md:gap-3">
        <span
          className={cn(
            "inline-flex min-w-7 items-center justify-center text-xs font-medium md:min-w-10 md:text-base",
            rank <= 3 ? "text-fg" : "text-muted",
          )}
        >
          #{rank}
        </span>
        <BrandMark url={item.productUrl} name={title} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p className="min-w-0 flex-1 truncate text-sm font-medium md:text-base">{title}</p>
          <p className="shrink-0 text-sm font-semibold tabular text-accent md:text-base">
            {formatMoney(item.amountCents)}
          </p>
        </div>
        {pitch ? (
          <p className="mt-0.5 min-w-0 truncate text-xs text-muted md:text-sm md:whitespace-normal md:line-clamp-2">
            {pitch}
          </p>
        ) : null}
        <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11px] md:text-xs">
          <span className="text-faint">
            <time dateTime={item.createdAt}>{timeAgo(item.createdAt)}</time>
          </span>
          {item.productUrl ? (
            <span className="inline-flex items-center gap-1 font-semibold text-fg">
              <span className="relative inline-flex size-1.5 shrink-0">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
              </span>
              {item.clickCount} click{item.clickCount === 1 ? "" : "s"}
            </span>
          ) : null}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <a
        href={item.productUrl!}
        onClick={onClick}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="flex h-full items-center gap-2 px-3 py-2 transition-colors hover:text-accent md:gap-3 md:px-4 md:py-3"
      >
        {inner}
      </a>
    );
  }

  return <div className="flex h-full items-center gap-2 px-3 py-2 md:gap-3 md:px-4 md:py-3">{inner}</div>;
}

export function MoneyMade({ raisedCents }: { raisedCents: number }) {
  const digits = formatMoney(raisedCents).replace("€", "").split("");
  return (
    <section className="mt-14 flex flex-col items-center px-4" aria-live="polite">
      <p className="mb-3 text-sm text-muted">
        This{" "}
        <Link to="/about" className="font-medium text-accent hover:text-fg">
          simple side project
        </Link>{" "}
        made
      </p>
      <p className="flex items-baseline justify-center rounded-2xl bg-elevated px-5 py-3 font-mono text-4xl font-semibold tabular shadow-[var(--shadow-border)] sm:px-8 sm:py-4 sm:text-6xl">
        <span className="pr-1.5 text-accent sm:pr-2">€</span>
        <span className="flex gap-1 sm:gap-2">
          {digits.map((d, i) => (
            <span key={`${d}-${i}`} className={d === "," ? "text-faint" : undefined}>
              {d}
            </span>
          ))}
        </span>
      </p>
      <p className="mt-3 text-sm text-muted">
        of €10,000 · we leave Monday · {UNFINISHED_PROJECTS.toLocaleString("en-US")} projects still waiting
      </p>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 px-4 pb-8 text-center">
      <p className="text-sm text-muted">
        Built by{" "}
        <a
          href={`https://x.com/${OWNER_HANDLE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-fg"
        >
          @{OWNER_HANDLE}
        </a>
        {" · "}
        <Link to="/rules" className="text-accent hover:text-fg">
          Rules
        </Link>
        {" · "}
        Highest bid sits at #1. Pay more, take the rank.
      </p>
    </footer>
  );
}

export function BrandMark({ url, name }: { url?: string | null; name: string }) {
  const logo = logoForUrl(url ?? null) ?? FEATURED_BRANDS.find((b) => b.name === name)?.logo;
  if (logo) {
    return (
      <img
        src={logo}
        alt=""
        width={56}
        height={56}
        className="size-10 rounded-md bg-subtle object-contain md:size-14"
      />
    );
  }
  const letter = (name || "?").slice(0, 1).toUpperCase();
  return (
    <div className="grid size-10 shrink-0 place-items-center rounded-md bg-subtle text-sm font-medium md:size-14">
      {letter}
    </div>
  );
}

export { ArrowUpRight };
