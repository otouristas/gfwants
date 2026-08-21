import { LADDER, TIER_BY_ID, type TierId } from "@/lib/fund";

export const GA_ID = "G-TG7X4HF0V1";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag(...args);
}

function euros(cents: number) {
  return Math.round(cents) / 100;
}

function item(id: string, name: string, amountCents: number) {
  return {
    item_id: id,
    item_name: name,
    item_category: "sponsor",
    price: euros(amountCents),
    quantity: 1,
  };
}

export function trackPageView(path: string) {
  gtag("event", "page_view", { page_path: path, page_location: window.location.href });
}

export function trackViewItemList() {
  gtag("event", "view_item_list", {
    item_list_id: "sponsor_ladder",
    item_list_name: "Sponsor ladder",
    items: LADDER.map((tier) => item(tier.id, tier.label, tier.dollars * 100)),
  });
}

export function trackSelectItem(tierId: TierId, amountCents: number) {
  const tier = TIER_BY_ID[tierId];
  gtag("event", "select_item", {
    item_list_id: "sponsor_ladder",
    item_list_name: "Sponsor ladder",
    items: [item(tierId, tier?.label ?? "Custom bid", amountCents)],
  });
  gtag("event", "view_item", {
    currency: "EUR",
    value: euros(amountCents),
    items: [item(tierId, tier?.label ?? "Custom bid", amountCents)],
  });
}

export function trackBeginCheckout(tierId: TierId, amountCents: number) {
  const tier = TIER_BY_ID[tierId];
  gtag("event", "begin_checkout", {
    currency: "EUR",
    value: euros(amountCents),
    items: [item(tierId, tier?.label ?? "Custom bid", amountCents)],
  });
}

export function trackPurchase(input: {
  transactionId: string;
  amountCents: number;
  tierId?: string;
  name?: string;
}) {
  const key = `ga-purchase-${input.transactionId}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
  } catch {
    /* private mode */
  }
  const label = input.name || TIER_BY_ID[input.tierId as TierId]?.label || "Bid";
  gtag("event", "purchase", {
    transaction_id: input.transactionId,
    currency: "EUR",
    value: euros(input.amountCents),
    items: [item(input.tierId || "bid", label, input.amountCents)],
  });
}
