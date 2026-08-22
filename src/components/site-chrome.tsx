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
    <header className="sticky top-0 z-40 w-full bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-12 w-full max-w-5xl items-center gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6">
        <Link
          to="/"
          className="min-w-0 flex-1 whitespace-nowrap font-display text-[clamp(12.5px,3.4vw+2px,22px)] leading-none tracking-[-0.04em] sm:flex-none sm:tracking-tight"
        >
          mygirlfriendisfurious
          <span className="text-accent">.</span>
          <span className="text-muted">lol</span>
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-5 text-sm">
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
            <p className="hidden font-mono text-sm tabular text-muted lg:block">
              {formatMoney(raisedCents)}
            </p>
          ) : null}
          {onContribute ? (
            <Button size="sm" className="h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-[13px]" onClick={onContribute}>
              Bid
            </Button>
          ) : (
            <Button size="sm" className="h-8 px-3 text-xs sm:h-9 sm:px-4 sm:text-[13px]" asChild>
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
