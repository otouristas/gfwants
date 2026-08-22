import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { RefreshCw, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FEATURED_BRANDS,
  LEAVE_AT,
  OWNER_HANDLE,
  LADDER,
  SPEND_BARS,
  UNFINISHED_PROJECTS,
  UNLOCKS,
  approvalScore,
  approvalStatus,
  claimCents,
  formatMoney,
  goPath,
  hostFromUrl,
  faviconCandidates,
  timeAgo,
  withUtm,
  type Contribution,
  type FundPayload,
  type Tier,
} from "@/lib/fund";
import { trackOutboundClick } from "@/lib/gtag";
import { cn } from "@/lib/utils";

export function Hero({
  fund,
  naming,
  onBid,
  onCheap,
}: {
  fund: FundPayload;
  naming?: Contribution;
  onBid: () => void;
  onCheap: () => void;
}) {
  const take = claimCents(fund.contributions[0]?.amountCents);
  return (
    <header className="mx-auto max-w-5xl px-4 pt-8 pb-4 sm:px-6 sm:pt-14 sm:pb-8">
      <LiveVisitors live={fund.liveVisitors} total={fund.visitorsSinceLaunch} />
      <h1 className="mt-5 max-w-2xl text-[2rem] leading-[1.08] font-medium tracking-tight sm:text-5xl">
        I promised a vacation. Then I spent it on AI.
      </h1>
      {naming?.productName ? (
        <p className="mt-3 text-sm text-accent">
          This trip exists because of{" "}
          {naming.productUrl ? (
            <a
              href={goPath(naming.id)}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() =>
                trackOutboundClick({
                  url: naming.productUrl!,
                  host: hostFromUrl(naming.productUrl!),
                  id: naming.id,
                })
              }
              className="underline decoration-border-strong underline-offset-4"
            >
              {naming.productName}
            </a>
          ) : (
            naming.productName
          )}
          .
        </p>
      ) : null}
      <MondayClock />
      <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
        We leave Monday. Your website on this homepage. Highest payer is #1.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button className="h-12 w-full px-6 sm:w-auto" onClick={onBid}>
          Bid {formatMoney(take)} — take #1
        </Button>
        <Button variant="outline" className="h-12 w-full px-6 sm:w-auto" onClick={onCheap}>
          €5 — just get on the board
        </Button>
      </div>
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
        : `Boarding in ${days}d ${hours}h ${mins}m · Monday morning · she has seen the tickets`}
    </p>
  );
}

export function Meters({ fund }: { fund: FundPayload }) {
  const score = approvalScore(fund.raisedCents);
  const pct = Math.min(100, Math.round((fund.raisedCents / fund.goalCents) * 100));
  return (
    <section className="mx-auto grid max-w-5xl gap-4 px-4 sm:px-6 md:grid-cols-2">
      <div className="rounded-xl bg-elevated p-5 shadow-[var(--shadow-border)] md:p-6">
        <p className="text-xs tracking-wide text-muted uppercase">Relationship recovery fund</p>
        <p className="mt-3 font-display text-4xl tracking-tight">{formatMoney(fund.raisedCents)}</p>
        <p className="mt-1 text-sm text-muted">
          of €10,000 · {fund.count} on the board · we leave Monday
        </p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-subtle">
          <div className="h-full bg-fg transition-[width] duration-500" style={{ width: `${pct}%` }} />
        </div>
        <ul className="mt-5 grid grid-cols-2 gap-2">
          {UNLOCKS.map((item) => {
            const on = fund.raisedCents >= item.atCents;
            return (
              <li key={item.id} className="flex items-center gap-2 text-sm">
                {on ? <Check className="size-4 text-fg" /> : <X className="size-4 text-faint" />}
                <span className={on ? "text-fg" : "text-muted"}>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="rounded-xl bg-elevated p-5 shadow-[var(--shadow-border)] md:p-6">
        <p className="text-xs tracking-wide text-muted uppercase">Girlfriend Approval Index</p>
        <p className="mt-3 font-display text-4xl tracking-tight tabular">{score}/100</p>
        <p className="mt-1 text-sm text-accent">{approvalStatus(score)}</p>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-subtle">
          <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${score}%` }} />
        </div>
        <p className="mt-5 text-sm leading-relaxed text-muted">
          The index goes up when money comes in. If it overshoots, I buy more Max and attack the
          1,454. She has been briefed. Do not make me explain a second dashboard.
        </p>
      </div>
    </section>
  );
}

export function HostageWall({ paid }: { paid: Contribution[] }) {
  const paidHosts = new Set(
    paid.filter((c) => c.productUrl).map((c) => hostFromUrl(c.productUrl!)),
  );
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h2 className="text-3xl font-medium tracking-tight">They already paid. I hope they pay the rest.</h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
        Three websites I already put on the apology. €50 each, on the board, paid. If you are one of
        them: thank you. If you are not: outbid them.
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {FEATURED_BRANDS.map((brand) => {
          const on = paidHosts.has(brand.host);
          const match = paid.find((c) => c.productUrl && hostFromUrl(c.productUrl) === brand.host);
          const href = match ? goPath(match.id) : withUtm(brand.url, brand.host);
          return (
            <a
              key={brand.id}
              href={href}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() =>
                trackOutboundClick({
                  url: brand.url,
                  host: brand.host,
                  id: match?.id,
                })
              }
              className="rounded-xl bg-elevated p-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
            >
              <div className="flex items-start gap-3">
                <img
                  src={brand.logo}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-md bg-subtle object-contain"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{brand.name}</p>
                    <Badge variant={on ? "default" : "mute"}>{on ? "Paid" : "Unpaid"}</Badge>
                  </div>
                  <p className="truncate text-xs text-faint">{brand.host}</p>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">{brand.pitch}</p>
              <p className="mt-3 font-mono text-sm tabular">{formatMoney(brand.euros * 100)}</p>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export function CrisisMath() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <div className="rounded-xl bg-fg px-5 py-6 text-bg sm:px-8">
        <p className="font-mono text-sm tabular text-bg/70">The arithmetic of a rescued relationship</p>
        <p className="mt-2 font-display text-2xl tracking-tight sm:text-3xl">
          €4,999 + €2,499 + €2,499 = €9,997
        </p>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-bg/80">
          Vacation Naming Rights plus two Relationship Savers. Then one €5 hero and the vacation
          crisis is technically over. I will still buy Max if it overshoots.
        </p>
      </div>
    </section>
  );
}

export function SponsorLadder({
  remaining,
  onPick,
}: {
  remaining: FundPayload["remaining"];
  onPick: (tier: Tier) => void;
}) {
  return (
    <section id="sponsor" className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h2 className="text-3xl font-medium tracking-tight">This is not a donation page. This is ad inventory.</h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
        I promised my girlfriend a vacation. Then I discovered AI subscriptions. So I turned the
        crisis into sponsored slots. Put your website, SaaS, app, agency, newsletter, shop, or X
        account on the apology. Bid custom if you want. Rank is cash.
      </p>
      <div className="mt-6 grid gap-3">
        {LADDER.map((tier) => {
          const left = remaining[tier.id];
          const sold = left === 0;
          return (
            <article
              key={tier.id}
              className="flex flex-col gap-3 rounded-xl bg-elevated p-4 shadow-[var(--shadow-border)] sm:flex-row sm:items-center sm:gap-6 sm:p-5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{tier.label}</h3>
                  {tier.limit != null ? (
                    <Badge variant={sold ? "mute" : "outline"}>{sold ? "Sold out" : `${left} left`}</Badge>
                  ) : (
                    <Badge variant="mute">Open</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">{tier.punch}</p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <p className="font-mono text-xl tabular">{formatMoney(tier.dollars * 100)}</p>
                <Button size="sm" className="min-w-24" disabled={sold} onClick={() => onPick(tier)}>
                  {sold ? "Gone" : "Claim"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function SpendChart() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h2 className="text-3xl font-medium tracking-tight">Where the money went</h2>
      <p className="mt-2 text-sm text-muted">An honest visualization of a vacation that is happening anyway.</p>
      <div className="mt-6 space-y-3 rounded-xl bg-elevated p-5 shadow-[var(--shadow-border)]">
        {SPEND_BARS.map((bar) => (
          <div key={bar.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span>{bar.label}</span>
              <span className="font-mono tabular text-muted">{bar.pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-subtle">
              <div className="h-full bg-fg" style={{ width: `${bar.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function StickyBid({ amountCents, onBid }: { amountCents: number; onBid: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden">
      <Button className="h-12 w-full" onClick={onBid}>
        Bid {formatMoney(amountCents)} — take #1
      </Button>
    </div>
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
    <section id="board" className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">
      <h2 className="text-3xl font-medium tracking-tight">Hall of Relationship Saviors</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Ranked by cash. Tap a row to steal it for €1 more. Your website stays on the homepage.
      </p>
      <div className="mt-6 overflow-hidden rounded-xl bg-elevated shadow-[var(--shadow-border)]">
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
                <RankRow item={item} rank={rank} onClaim={() => onClaim(rank, take)} take={take} />
                <button
                  type="button"
                  onClick={() => onClaim(rank, take)}
                  className="pointer-events-none absolute top-1.5 left-1/2 z-20 hidden -translate-x-1/2 rounded-full bg-fg px-2.5 py-0.5 text-xs font-bold whitespace-nowrap text-bg opacity-0 shadow-sm transition-opacity duration-150 md:block group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
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

function RankRow({
  item,
  rank,
  onClaim,
  take,
}: {
  item: Contribution;
  rank: number;
  onClaim: () => void;
  take: number;
}) {
  const host = item.productUrl ? hostFromUrl(item.productUrl) : null;
  const title = host ?? item.productName ?? item.displayName;
  const pitch = item.productPitch || item.message;

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
        <BrandMark url={item.productUrl} name={title} logoUrl={item.logoUrl} />
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
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClaim();
        }}
        className="shrink-0 rounded-full bg-fg px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap text-bg md:hidden"
      >
        Outbid {formatMoney(take)}
      </button>
    </>
  );

  if (item.productUrl) {
    return (
      <a
        href={goPath(item.id)}
        onClick={() =>
          trackOutboundClick({
            url: item.productUrl!,
            host: host ?? undefined,
            id: item.id,
            rank,
          })
        }
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
    <section className="mt-8 flex flex-col items-center px-4" aria-live="polite">
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
    <footer className="mt-16 px-4 pb-10 text-center">
      <p className="text-sm text-muted">
        Built by{" "}
        <a
          href={withUtm(`https://x.com/${OWNER_HANDLE}`, "footer-x")}
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
        <Link to="/terms" className="text-accent hover:text-fg">
          Terms
        </Link>
        {" · "}
        <Link to="/privacy" className="text-accent hover:text-fg">
          Privacy
        </Link>
        {" · "}
        Built in a sitting because I apparently have not learned my lesson.
      </p>
    </footer>
  );
}

export function BrandMark({
  url,
  name,
  logoUrl,
}: {
  url?: string | null;
  name: string;
  logoUrl?: string | null;
}) {
  const sources = faviconCandidates(url ?? null, logoUrl);
  const [i, setI] = useState(0);
  useEffect(() => {
    setI(0);
  }, [url, logoUrl]);
  const src = sources[i];
  if (!src) {
    const letter = (name || "?").slice(0, 1).toUpperCase();
    return (
      <div className="grid size-10 shrink-0 place-items-center rounded-md bg-subtle text-sm font-medium md:size-14">
        {letter}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={56}
      height={56}
      referrerPolicy="no-referrer"
      onError={() => setI((n) => n + 1)}
      className="size-10 shrink-0 rounded-md bg-subtle object-contain md:size-14"
    />
  );
}
