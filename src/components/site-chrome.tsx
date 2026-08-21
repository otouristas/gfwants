import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/fund";
import { cn } from "@/lib/utils";

export function SiteChrome({
  raisedCents,
  onContribute,
}: {
  raisedCents?: number;
  onContribute?: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="min-w-0 shrink font-display text-base tracking-tight sm:text-lg">
          mygirlfriendisfurious
          <span className="text-muted">.lol</span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm sm:gap-2">
          <NavLink to="/rules">Rules</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
        {raisedCents != null ? (
          <p className="hidden font-mono text-sm tabular text-muted sm:block">
            {formatMoney(raisedCents)}
            <span className="text-faint"> / €10,000</span>
          </p>
        ) : null}
        {onContribute ? (
          <Button size="sm" onClick={onContribute}>
            Sponsor
          </Button>
        ) : (
          <Button size="sm" asChild>
            <Link to="/" hash="sponsor">
              Sponsor
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}

function NavLink({ to, children }: { to: "/rules" | "/about"; children: string }) {
  return (
    <Link
      to={to}
      className={cn(
        "rounded-md px-2 py-1.5 text-muted transition-colors duration-150 hover:text-fg",
      )}
      activeProps={{ className: "text-fg" }}
    >
      {children}
    </Link>
  );
}
