import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ContributeDialog, type ContributeDraft } from "@/components/contribute-dialog";
import { CrisisMath, Hero, HostageWall, Leaderboard, Meters, MoneyMade, SiteFooter, SpendChart, SponsorLadder } from "@/components/fund-page";
import { SiteChrome } from "@/components/site-chrome";
import { claimCents, tierForAmount, type Tier } from "@/lib/fund";
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
    refetchInterval: 8000,
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

  function pickTier(tier: Tier) {
    setClaimRank(undefined);
    setDraft({
      ...emptyDraft(tier.dollars * 100),
      tier: tier.id,
    });
    setOpen(true);
  }

  function openDefault() {
    openBid(1, claimCents(fund.contributions[0]?.amountCents));
  }

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-fg">
      <SiteChrome raisedCents={fund.raisedCents} onContribute={openDefault} />
      <Hero fund={fund} naming={fund.contributions.find((c) => c.tier === "naming")} onBid={openDefault} />
      <Meters fund={fund} />
      <HostageWall paid={fund.contributions} />
      <CrisisMath />
      <SponsorLadder remaining={fund.remaining} onPick={pickTier} />
      <Leaderboard
        items={fund.contributions}
        onClaim={openBid}
        onRefresh={() => void query.refetch()}
      />
      <SpendChart />
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