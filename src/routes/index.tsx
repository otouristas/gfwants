import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ContributeDialog, type ContributeDraft } from "@/components/contribute-dialog";
import { Hero, Leaderboard, MoneyMade, SiteFooter } from "@/components/fund-page";
import { SiteChrome } from "@/components/site-chrome";
import { claimCents, tierForAmount } from "@/lib/fund";
import { getFund, pingVisitor } from "@/lib/fund-api";

export const Route = createFileRoute("/")({
  loader: () => getFund(),
  component: Home,
});

const emptyDraft = (amountCents: number): ContributeDraft => ({
  tier: tierForAmount(amountCents),
  amountCents,
  displayName: "",
  xHandle: "",
  message: "",
  productName: "",
  productUrl: "",
  productPitch: "",
  anonymous: false,
});

function Home() {
  const initial = Route.useLoaderData();
  const query = useQuery({
    queryKey: ["fund"],
    queryFn: () => getFund(),
    initialData: initial,
    refetchInterval: 2500,
    refetchOnWindowFocus: true,
  });
  const fund = query.data ?? initial;
  const [open, setOpen] = useState(false);
  const [claimRank, setClaimRank] = useState<number | undefined>(1);
  const [draft, setDraft] = useState<ContributeDraft>(() =>
    emptyDraft(claimCents(fund.contributions[0]?.amountCents)),
  );

  useEffect(() => {
    const key = "gfwants-visitor";
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }
    void pingVisitor({ data: { visitorId: id } });
    const timer = window.setInterval(() => {
      void pingVisitor({ data: { visitorId: id! } });
    }, 20_000);
    return () => window.clearInterval(timer);
  }, []);

  function openBid(rank: number, amountCents: number) {
    setClaimRank(rank);
    setDraft(emptyDraft(amountCents));
    setOpen(true);
  }

  function openDefault() {
    openBid(1, claimCents(fund.contributions[0]?.amountCents));
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <SiteChrome raisedCents={fund.raisedCents} onContribute={openDefault} />
      <Hero fund={fund} onBid={openDefault} />
      <Leaderboard
        items={fund.contributions}
        onClaim={openBid}
        onRefresh={() => void query.refetch()}
      />
      <MoneyMade raisedCents={fund.raisedCents} />
      <SiteFooter />
      <ContributeDialog
        open={open}
        onOpenChange={setOpen}
        draft={draft}
        onDraftChange={setDraft}
        claimRank={claimRank}
        onSettled={() => void query.refetch()}
      />
    </div>
  );
}