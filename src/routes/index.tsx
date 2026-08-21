import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ContributeDialog, type ContributeDraft } from "@/components/contribute-dialog";
import {
  Hero,
  HostageWall,
  Meters,
  OfficialStrip,
  ProductWall,
  SaviorHall,
  SiteFooter,
  SpendChart,
  SponsorLadder,
} from "@/components/fund-page";
import { SiteChrome } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { TIER_BY_ID, type FeaturedBrand, type Tier, type TierId } from "@/lib/fund";
import { getFund } from "@/lib/fund-api";

export const Route = createFileRoute("/")({
  loader: () => getFund(),
  component: Home,
});

const emptyDraft = (tier: TierId): ContributeDraft => ({
  tier,
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
  });
  const fund = query.data ?? initial;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ContributeDraft>(() => emptyDraft("wall"));

  const naming = useMemo(
    () => fund.contributions.find((c) => c.tier === "naming"),
    [fund.contributions],
  );
  const officials = useMemo(
    () => fund.contributions.filter((c) => c.tier === "official" || c.tier === "naming"),
    [fund.contributions],
  );

  function pick(tier: Tier) {
    setDraft(emptyDraft(tier.id));
    setOpen(true);
  }

  function pickBrand(brand: FeaturedBrand) {
    setDraft({
      ...emptyDraft("wall"),
      displayName: brand.name,
      productName: brand.name,
      productUrl: brand.url,
      productPitch: brand.pitch,
      message: "Fine. €50. Keep us on the homepage. We leave Monday.",
    });
    setOpen(true);
  }

  function openDefault() {
    pick(TIER_BY_ID.wall);
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <SiteChrome raisedCents={fund.raisedCents} onContribute={openDefault} />
      <Hero naming={naming} />
      <Meters fund={fund} />
      <HostageWall paid={fund.contributions} onPay={pickBrand} />
      <OfficialStrip items={officials} onBuy={() => pick(TIER_BY_ID.official)} />
      <SponsorLadder remaining={fund.remaining} onPick={pick} />
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-xl bg-subtle px-5 py-6 text-center">
          <p className="font-display text-xl">The €2 people are cute. The €499 people get us to Monday with dignity.</p>
          <Button className="mt-4" onClick={() => pick(TIER_BY_ID.official)}>
            Become Official Vacation Sponsor
          </Button>
        </div>
      </div>
      <ProductWall items={fund.contributions} />
      <SaviorHall items={fund.contributions} />
      <SpendChart />
      <SiteFooter raisedCents={fund.raisedCents} />
      <ContributeDialog
        open={open}
        onOpenChange={setOpen}
        draft={draft}
        onDraftChange={setDraft}
        onSettled={() => void query.refetch()}
      />
    </div>
  );
}
