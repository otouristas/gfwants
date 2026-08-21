import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FEATURED_BRANDS,
  LEAVE_AT,
  OWNER_HANDLE,
  SPEND_BARS,
  TIERS,
  UNLOCKS,
  approvalScore,
  approvalStatus,
  formatMoney,
  hostFromUrl,
  logoForUrl,
  type Contribution,
  type FeaturedBrand,
  type FundPayload,
  type Tier,
  type TierId,
} from "@/lib/fund";
import { cn } from "@/lib/utils";

export function Hero({ naming }: { naming: Contribution | undefined }) {
  return (
    <header className="mx-auto max-w-5xl px-4 pt-10 pb-6 sm:px-6 sm:pt-16">
      <p className="text-xs tracking-[0.18em] text-muted uppercase">A personal financial disaster with a departure time</p>
      <h1 className="mt-4 max-w-3xl text-4xl leading-[1.08] font-medium tracking-tight sm:text-6xl">
        The trip exists. We leave Monday. I spent the money on AI anyway.
      </h1>
      {naming?.productName ? (
        <p className="mt-4 text-sm text-accent">
          This trip exists because of{" "}
          {naming.productUrl ? (
            <a
              href={naming.productUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
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
      <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
        Flights: booked. Hotel: booked. Vacation fund: currently an apology with a progress bar.
        Claude needed Max. ChatGPT needed Plus. Cursor needed Pro. I have{" "}
        <span className="text-fg">1,454 unfinished projects</span>. I bought this domain with what
        was left. She is still coming. She is still furious.
      </p>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
        If this overshoots, I will buy more AI Max and finish the pile. That is not a threat. That
        is the business model. Put your product on the apology. Pay with card. Stripe. We leave Monday.
      </p>
    </header>
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
    <p className="mt-6 font-mono text-sm tabular text-accent">
      {gone
        ? "We are supposed to be gone. If you are still paying, I am buying Max from the boat."
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
        <p className="mt-1 text-sm text-muted">of €10,000 · {fund.count} people on the wall · we leave Monday</p>
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
          <div
            className="h-full bg-accent transition-[width] duration-500"
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="mt-5 text-sm leading-relaxed text-muted">
          The index goes up when money comes in. If it overshoots, I buy more Max and attack the
          1,454. She has been briefed. Do not make me explain a second dashboard.
        </p>
      </div>
    </section>
  );
}

export function HostageWall({
  paid,
  onPay,
}: {
  paid: Contribution[];
  onPay: (brand: FeaturedBrand) => void;
}) {
  const paidHosts = new Set(
    paid.filter((c) => c.productUrl).map((c) => hostFromUrl(c.productUrl!)),
  );
  return (
    <section id="hostages" className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <h2 className="text-3xl font-medium tracking-tight">I already put you on the homepage.</h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
        Three real sites. Real logos. They paid. €50 each. They stay on this homepage. We leave Monday.
      </p>
      <div className="mt-6 grid gap-3">
        {FEATURED_BRANDS.map((brand) => {
          const settled = paidHosts.has(brand.host);
          return (
            <article
              key={brand.id}
              className="flex flex-col gap-4 rounded-xl bg-elevated p-4 shadow-[var(--shadow-border)] sm:flex-row sm:items-center sm:p-5"
            >
              <a href={brand.url} target="_blank" rel="sponsored noopener noreferrer" className="shrink-0">
                <img
                  src={brand.logo}
                  alt=""
                  width={64}
                  height={64}
                  className="size-16 rounded-lg bg-subtle object-contain"
                />
              </a>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={brand.url}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="font-medium hover:underline"
                  >
                    {brand.name}
                  </a>
                  <span className="text-xs text-faint">{brand.host}</span>
                  {settled ? <Badge>Paid</Badge> : <Badge variant="outline">€50 · unpaid</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted">{brand.pitch}</p>
                <p className="mt-1 text-xs text-faint">{brand.plea}</p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <p className="font-mono text-xl tabular">€50</p>
                {settled ? (
                  <Button size="sm" variant="outline" asChild>
                    <a href={brand.url} target="_blank" rel="sponsored noopener noreferrer">
                      Visit
                      <ArrowUpRight className="size-3.5" />
                    </a>
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => onPay(brand)}>
                    Pay with card
                  </Button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function OfficialStrip({ items, onBuy }: { items: Contribution[]; onBuy: () => void }) {
  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-3 rounded-xl bg-fg px-5 py-6 text-bg md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs tracking-wide uppercase opacity-70">Hero strip · 5 slots</p>
            <p className="mt-1 font-display text-xl">Official Vacation Sponsor is empty. That is a €499 problem. We leave Monday.</p>
          </div>
          <Button className="bg-bg text-fg hover:bg-elevated" onClick={onBuy}>
            Take a slot
          </Button>
        </div>
      </section>
    );
  }
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <p className="text-xs tracking-wide text-muted uppercase">Official vacation sponsors</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <ProductLink key={item.id} item={item} className="rounded-md bg-fg px-3 py-2 text-sm text-bg" />
        ))}
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
  const sponsors = TIERS.filter((t) => t.kind === "sponsor");
  const impulse = TIERS.filter((t) => t.kind === "impulse");
  return (
    <section id="sponsor" className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <h2 className="text-3xl font-medium tracking-tight">Everyone else: put your product on this joke.</h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
        €2 will not get us to €10,000. A homepage slot will. Founders buy the screenshot. Every paid
        link is marked sponsored. If we overshoot, I buy more Max and try to finish 1,454 projects.
        She knows. She is still packing.
      </p>
      <div className="mt-6 grid gap-3">
        {sponsors.map((tier) => {
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
                    <Badge variant={sold ? "mute" : "outline"}>
                      {sold ? "Sold out" : `${left} left`}
                    </Badge>
                  ) : (
                    <Badge variant="mute">Open</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted">{tier.punch}</p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <p className="font-mono text-xl tabular">{formatMoney(tier.dollars * 100)}</p>
                <Button size="sm" disabled={sold} onClick={() => onPick(tier)}>
                  {sold ? "Gone" : "Claim"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <h3 className="mt-12 text-xl font-medium">Or fund the disaster in smaller sins.</h3>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {impulse.map((tier) => (
          <button
            key={tier.id}
            type="button"
            onClick={() => onPick(tier)}
            className="rounded-xl bg-elevated p-4 text-left shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
          >
            <p className="font-mono text-lg tabular">{formatMoney(tier.dollars * 100)}</p>
            <p className="mt-1 text-sm font-medium">{tier.label}</p>
            <p className="mt-1 text-xs text-muted">{tier.punch}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

export function ProductWall({ items }: { items: Contribution[] }) {
  const products = items.filter((c) => c.productUrl);
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h2 className="text-3xl font-medium tracking-tight">People who actually paid</h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        No fake SaaS. If a logo is here, a Stripe payment landed. Links are{" "}
        <span className="font-medium text-fg">rel=sponsored</span>.
      </p>
      {products.length === 0 ? (
        <p className="mt-6 text-sm text-muted">Empty. First real payment looks like a genius. We leave Monday.</p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {products.map((item) => (
            <a
              key={item.id}
              href={item.productUrl!}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="group flex gap-3 rounded-xl bg-elevated p-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
            >
              <BrandMark url={item.productUrl} name={item.productName ?? item.displayName} />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{item.productName ?? item.displayName}</p>
                    <p className="truncate text-xs text-faint">{hostFromUrl(item.productUrl!)}</p>
                  </div>
                  <ArrowUpRight className="size-4 shrink-0 text-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
                {item.productPitch ? (
                  <p className="mt-2 text-sm text-muted">{item.productPitch}</p>
                ) : null}
                <p className="mt-3 font-mono text-xs tabular text-faint">
                  {formatMoney(item.amountCents)} · {TIER_LABEL(item.tier)}
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

export function SaviorHall({ items }: { items: Contribution[] }) {
  return (
    <section id="hall" className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <h2 className="text-3xl font-medium tracking-tight">Hall of Relationship Saviors</h2>
      <p className="mt-2 text-sm text-muted">
        Ranked by cash. Older listing wins a tie. Fake brands were evicted. A completed payment is
        what claimed the rank.
      </p>
      {items.length === 0 ? (
        <p className="mt-6 rounded-xl bg-elevated px-4 py-8 text-center text-sm text-muted shadow-[var(--shadow-border)]">
          Nobody has paid yet. The hall is empty and we leave Monday. This is very on brand.
        </p>
      ) : (
        <ol className="mt-6 divide-y divide-border overflow-hidden rounded-xl bg-elevated shadow-[var(--shadow-border)]">
          {items.map((item, i) => {
            const rank = i + 1;
            const top = rank <= 3;
            return (
              <li
                key={item.id}
                className={cn("flex items-start gap-3 px-4 py-4", top && "bg-subtle/60")}
              >
                <span
                  className={cn(
                    "w-8 shrink-0 pt-1 font-mono text-sm tabular",
                    top ? "text-fg" : "text-muted",
                  )}
                >
                  #{rank}
                </span>
                <BrandMark url={item.productUrl} name={item.productName ?? item.displayName} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {item.xHandle ? (
                      <a
                        href={`https://x.com/${item.xHandle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        @{item.xHandle}
                      </a>
                    ) : (
                      item.displayName
                    )}
                    {item.productUrl ? (
                      <>
                        {" · "}
                        <a
                          href={item.productUrl}
                          target="_blank"
                          rel="sponsored noopener noreferrer"
                          className="text-muted hover:text-fg hover:underline"
                        >
                          {item.productName ?? hostFromUrl(item.productUrl)}
                        </a>
                      </>
                    ) : null}
                  </p>
                  {item.message ? <p className="mt-1 text-sm text-muted">“{item.message}”</p> : null}
                </div>
                <p className={cn("shrink-0 font-mono text-sm tabular", top && "text-accent")}>
                  {formatMoney(item.amountCents)}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export function SpendChart() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h2 className="text-3xl font-medium tracking-tight">Where the money went</h2>
      <p className="mt-2 text-sm text-muted">
        An honest visualization of a vacation that is happening anyway.
      </p>
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

export function SiteFooter({ raisedCents }: { raisedCents: number }) {
  return (
    <footer className="mx-auto max-w-5xl px-4 pt-4 pb-12 sm:px-6">
      <div className="border-t border-border pt-10 text-center">
        <p className="text-sm text-muted">
          This{" "}
          <Link to="/about" className="text-fg underline decoration-border-strong underline-offset-4">
            simple side project
          </Link>{" "}
          raised
        </p>
        <p className="mt-2 font-display text-5xl tracking-tight tabular">{formatMoney(raisedCents)}</p>
        <p className="mt-2 text-sm text-muted">of €10,000 · we leave Monday · 1,454 projects still waiting</p>
        <p className="mx-auto mt-8 max-w-xl text-sm leading-relaxed text-muted">
          Not a registered charity, not tax-deductible, not relationship advice.{" "}
          <Link to="/rules" className="text-fg underline decoration-border-strong underline-offset-4">
            Rules
          </Link>
          . Card is Stripe. If you need someone who grows things without lighting the vacation fund on fire, I am{" "}
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
    </footer>
  );
}

function BrandMark({ url, name }: { url?: string | null; name: string }) {
  const logo = logoForUrl(url ?? null);
  if (logo) {
    return (
      <img
        src={logo}
        alt=""
        width={36}
        height={36}
        className="size-9 shrink-0 rounded-md bg-subtle object-contain"
      />
    );
  }
  const letter = (name || "?").slice(0, 1).toUpperCase();
  return (
    <div className="grid size-9 shrink-0 place-items-center rounded-md bg-subtle text-xs font-medium">
      {letter}
    </div>
  );
}

function ProductLink({ item, className }: { item: Contribution; className?: string }) {
  const inner = (
    <>
      {item.productName ?? item.displayName}
      <ArrowUpRight className="size-3.5" />
    </>
  );
  if (!item.productUrl) {
    return <span className={cn("inline-flex items-center gap-1", className)}>{inner}</span>;
  }
  return (
    <a
      href={item.productUrl}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className={cn("inline-flex items-center gap-1", className)}
    >
      {inner}
    </a>
  );
}

function TIER_LABEL(id: TierId): string {
  return TIERS.find((t) => t.id === id)?.label ?? id;
}
