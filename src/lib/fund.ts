export const GOAL_CENTS = 1_000_000;
export const OWNER_HANDLE = "touristasai";
export const WISE_TAG = "georgek992";
export const WISE_QR = "/wise-qr.png";
export const UNFINISHED_PROJECTS = 1454;
export const LEAVE_AT = Date.UTC(2026, 7, 24, 5, 0, 0); // Monday 08:00 EEST

export type TierId =
  | "coffee"
  | "api"
  | "cocktail"
  | "doghouse"
  | "ryanair"
  | "honeymoon"
  | "wall"
  | "funded"
  | "dinner"
  | "official"
  | "naming";

export type Tier = {
  id: TierId;
  dollars: number;
  label: string;
  punch: string;
  kind: "impulse" | "sponsor";
  requiresProduct: boolean;
  limit: number | null;
  placement: string;
};

export const TIERS: Tier[] = [
  {
    id: "coffee",
    dollars: 2,
    label: "Coffee at the gate",
    punch: "Buy her a coffee. Does not buy you forgiveness. We still leave Monday.",
    kind: "impulse",
    requiresProduct: false,
    limit: null,
    placement: "Name on the Hall of Saviors",
  },
  {
    id: "api",
    dollars: 5,
    label: "Undo one API call",
    punch: "Morally equivalent to deleting a receipt. I have 1,454 more ideas after this.",
    kind: "impulse",
    requiresProduct: false,
    limit: null,
    placement: "Name on the Hall of Saviors",
  },
  {
    id: "cocktail",
    dollars: 10,
    label: "One cocktail",
    punch: "The drink I promised. You are buying it here. I will not spend it on Max. Probably.",
    kind: "impulse",
    requiresProduct: false,
    limit: null,
    placement: "Name + optional message",
  },
  {
    id: "doghouse",
    dollars: 25,
    label: "Out of the doghouse",
    punch: "A message on the wall. Optional product link. Cheap attention before Monday.",
    kind: "impulse",
    requiresProduct: false,
    limit: null,
    placement: "Wall + optional sponsored link",
  },
  {
    id: "ryanair",
    dollars: 50,
    label: "Upgrade from Ryanair",
    punch: "Assigned seats. A product link if you have something to sell.",
    kind: "impulse",
    requiresProduct: false,
    limit: null,
    placement: "Wall + optional sponsored link",
  },
  {
    id: "honeymoon",
    dollars: 100,
    label: "Honeymoon planner",
    punch: "You basically planned the trip. Your site can sit next to that fact.",
    kind: "impulse",
    requiresProduct: false,
    limit: null,
    placement: "Highlighted savior + optional product",
  },
  {
    id: "wall",
    dollars: 50,
    label: "Product on the wall",
    punch: "Your website, pitch, and logo on this homepage. €50. rel=sponsored. We leave Monday.",
    kind: "sponsor",
    requiresProduct: true,
    limit: null,
    placement: "Sponsored product card + backlink",
  },
  {
    id: "funded",
    dollars: 99,
    label: "Partially funded by you",
    punch: "Homepage line: this vacation is partially funded by [your brand]. Plus a fat product card.",
    kind: "sponsor",
    requiresProduct: true,
    limit: 12,
    placement: "Homepage credit + product card",
  },
  {
    id: "dinner",
    dollars: 199,
    label: "Sponsor a dinner",
    punch: "One dinner in Greece, billed to your brand. Big card. People will screenshot it.",
    kind: "sponsor",
    requiresProduct: true,
    limit: 8,
    placement: "Dinner sponsor block + product",
  },
  {
    id: "official",
    dollars: 499,
    label: "Official Vacation Sponsor",
    punch: "Your product in the hero strip. The only ad that might save a relationship.",
    kind: "sponsor",
    requiresProduct: true,
    limit: 5,
    placement: "Hero strip + official badge + product",
  },
  {
    id: "naming",
    dollars: 2500,
    label: "The trip exists because of you",
    punch: "One slot. Your name on the headline. This is how we actually hit €10,000.",
    kind: "sponsor",
    requiresProduct: true,
    limit: 1,
    placement: "Headline naming rights + hero product",
  },
];

export const TIER_BY_ID = Object.fromEntries(TIERS.map((t) => [t.id, t])) as Record<TierId, Tier>;

export type FeaturedBrand = {
  id: string;
  name: string;
  url: string;
  host: string;
  pitch: string;
  plea: string;
  logo: string;
  euros: number;
};

export const FEATURED_BRANDS: FeaturedBrand[] = [
  {
    id: "cyclades",
    name: "Discover Cyclades",
    url: "https://discovercyclades.gr",
    host: "discovercyclades.gr",
    pitch: "Guides, ferries and hotels for the Cyclades. I already put you on the apology.",
    plea: "€50 landed. You stay on this homepage. We leave Monday.",
    logo: "/brands/discovercyclades.png",
    euros: 50,
  },
  {
    id: "guru",
    name: "AnotherSEOGuru",
    url: "https://anotherseoguru.com",
    host: "anotherseoguru.com",
    pitch: "SEO and web design in Greece that actually brings in customers. Yes I work here. Yes I still spent the money on AI.",
    plea: "€50 landed. The agency is on the joke. Do not fund another Max seat. Unless this overshoots.",
    logo: "/brands/anotherseoguru.png",
    euros: 50,
  },
  {
    id: "mykonos",
    name: "Mykonos Luxury",
    url: "https://mykonos.luxury",
    host: "mykonos.luxury",
    pitch: "Villas, yachts, VIP. You craft the island. I crafted 1,454 unfinished AI projects.",
    plea: "€50 landed. You stay on this wall. She is already packing.",
    logo: "/brands/mykonos-luxury.png",
    euros: 50,
  },
];

export const LOGO_BY_HOST: Record<string, string> = Object.fromEntries(
  FEATURED_BRANDS.map((b) => [b.host, b.logo]),
);

export const MIN_BID_CENTS = 100;
export const MAX_BID_CENTS = 1_000_000;
export const QUICK_BIDS = [1, 2, 5, 10, 25, 50, 100, 250, 500, 1_000, 2_500, 10_000];

export type Contribution = {
  id: number;
  amountCents: number;
  tier: TierId;
  displayName: string;
  xHandle: string | null;
  message: string;
  productName: string | null;
  productUrl: string | null;
  productPitch: string | null;
  clickCount: number;
  createdAt: string;
};

export type FundPayload = {
  raisedCents: number;
  goalCents: number;
  count: number;
  contributions: Contribution[];
  remaining: Partial<Record<TierId, number>>;
  liveVisitors: number;
  visitorsSinceLaunch: number;
};

export function formatMoney(cents: number): string {
  const euros = Math.round(cents / 100);
  return `€${euros.toLocaleString("en-US")}`;
}

export function claimCents(rankAmountCents: number | undefined): number {
  if (!rankAmountCents) return MIN_BID_CENTS;
  return Math.min(MAX_BID_CENTS, rankAmountCents + 100);
}

export function tierForAmount(cents: number): TierId {
  const sorted = [...TIERS].sort((a, b) => b.dollars - a.dollars);
  return sorted.find((t) => cents >= t.dollars * 100)?.id ?? "coffee";
}

export function timeAgo(iso: string): string {
  const delta = Date.now() - Date.parse(iso);
  if (!Number.isFinite(delta) || delta < 45_000) return "just now";
  if (delta < 3_600_000) {
    const n = Math.max(1, Math.round(delta / 60_000));
    return `${n} minute${n === 1 ? "" : "s"} ago`;
  }
  if (delta < 86_400_000) {
    const n = Math.max(1, Math.round(delta / 3_600_000));
    return `${n} hour${n === 1 ? "" : "s"} ago`;
  }
  if (delta < 172_800_000) return "yesterday";
  const n = Math.round(delta / 86_400_000);
  return `${n} days ago`;
}

export function approvalScore(raisedCents: number): number {
  const pct = Math.min(1, Math.max(0, raisedCents / GOAL_CENTS));
  return Math.round(12 + pct * 88);
}

export function approvalStatus(score: number): string {
  if (score < 22) return "We leave Monday. The fund is a meme.";
  if (score < 38) return "I am packing. She is not laughing.";
  if (score < 52) return "Cocktails: pending. Claude Max: already billed.";
  if (score < 68) return "Maybe we eat something that is not airport croissant.";
  if (score < 84) return "If this overshoots I am buying more Max. Sorry.";
  if (score < 100) return "She smiled. I have 1,454 projects waiting.";
  return "We are going. Do not let me open Cursor on the boat.";
}

export const UNLOCKS = [
  { id: "flights", label: "Flights — already booked", atCents: 0 },
  { id: "stay", label: "Hotel she will accept", atCents: 250_000 },
  { id: "drinks", label: "Cocktails, not Claude", atCents: 600_000 },
  { id: "max", label: "Do not buy more Max", atCents: GOAL_CENTS },
] as const;

export const SPEND_BARS = [
  { label: "Claude Max", pct: 29 },
  { label: "1,454 unfinished projects", pct: 22 },
  { label: "ChatGPT + Cursor + APIs", pct: 20 },
  { label: "Ahrefs", pct: 13 },
  { label: "This domain", pct: 12 },
  { label: "The sundress she asked for", pct: 4 },
] as const;

export function isTierId(value: string): value is TierId {
  return value in TIER_BY_ID;
}

const CHAT_HOSTS = new Set([
  "t.me",
  "telegram.me",
  "telegram.org",
  "wa.me",
  "whatsapp.com",
  "chat.whatsapp.com",
  "discord.gg",
  "discord.com",
  "discordapp.com",
  "signal.me",
  "m.me",
  "messenger.com",
]);

const SHORTENER_HOSTS = new Set([
  "bit.ly",
  "t.co",
  "tinyurl.com",
  "ow.ly",
  "rebrand.ly",
  "cutt.ly",
  "is.gd",
  "rb.gy",
  "lnkd.in",
  "buff.ly",
  "shorturl.at",
]);

const ADULT_HOSTS = new Set([
  "pornhub.com",
  "xvideos.com",
  "xnxx.com",
  "xhamster.com",
  "onlyfans.com",
  "fansly.com",
  "chaturbate.com",
  "stripchat.com",
  "redtube.com",
  "youporn.com",
]);

function hostBanned(host: string, set: Set<string>): boolean {
  if (set.has(host)) return true;
  for (const banned of set) {
    if (host.endsWith(`.${banned}`)) return true;
  }
  return false;
}

export function sanitizeHandle(raw: string): string | null {
  const cleaned = raw.trim().replace(/^@/, "");
  if (!cleaned) return null;
  if (!/^[A-Za-z0-9_]{1,15}$/.test(cleaned)) {
    throw new Error("X handle should look like a username, not a novel");
  }
  return cleaned;
}

export function sanitizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Add the URL you want people to click");
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let parsed: URL;
  try {
    parsed = new URL(withProto);
  } catch {
    throw new Error("That is not a URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("http or https only");
  }
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  if (!host || !host.includes(".")) throw new Error("Use a full domain");
  if (hostBanned(host, CHAT_HOSTS)) {
    throw new Error("Chat and invite links are not allowed. This wall is for products.");
  }
  if (hostBanned(host, SHORTENER_HOSTS)) {
    throw new Error("No link shorteners. Put the real URL on the wall.");
  }
  if (hostBanned(host, ADULT_HOSTS)) {
    throw new Error("Adult links are not allowed. She is already furious.");
  }
  parsed.hash = "";
  parsed.search = "";
  parsed.hostname = host;
  parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
  const out = parsed.toString();
  return out.endsWith("/") && parsed.pathname === "/" ? out.slice(0, -1) : out.replace(/\/$/, "");
}

export function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function logoForUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const host = hostFromUrl(url);
  if (LOGO_BY_HOST[host]) return LOGO_BY_HOST[host];
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
}

export function shareText(amountCents: number, score: number): string {
  return `I just put ${formatMoney(amountCents)} toward a vacation that actually leaves Monday.\n\nGirlfriend Approval Index: ${score}/100\nIf this overshoots, George buys more AI Max and finishes 1,454 projects.\nmygirlfriendisfurious.lol`;
}
