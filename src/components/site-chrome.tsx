import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/fund";

export function SiteChrome({
  raisedCents,
  onContribute,
}: {
  raisedCents?: number;
  onContribute?: () => void;
}) {
  return (
    <header className="w-full">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 pt-5 pb-4">
        <Link to="/" className="inline-flex items-center gap-1.5 font-display text-[22px] tracking-tight">
          mygirlfriendisfurious
          <span className="text-accent">.</span>
          <span className="text-muted">lol</span>
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <nav aria-label="Main">
            <ul className="flex items-center gap-4 text-sm sm:gap-5">
              <li>
                <NavLink to="/">Leaderboard</NavLink>
              </li>
              <li>
                <NavLink to="/about">About</NavLink>
              </li>
              <li>
                <NavLink to="/rules">Rules</NavLink>
              </li>
            </ul>
          </nav>
          {raisedCents != null ? (
            <p className="hidden font-mono text-sm tabular text-muted sm:block">{formatMoney(raisedCents)}</p>
          ) : null}
          {onContribute ? (
            <Button size="sm" onClick={onContribute}>
              Bid
            </Button>
          ) : (
            <Button size="sm" asChild>
              <Link to="/">Bid</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({
  to,
  children,
}: {
  to: "/" | "/rules" | "/about";
  children: string;
}) {
  return (
    <Link
      to={to}
      className="font-medium text-muted transition-colors hover:text-fg"
      activeProps={{ className: "text-fg" }}
    >
      {children}
    </Link>
  );
}
