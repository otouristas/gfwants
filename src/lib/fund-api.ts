import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSql } from "@/lib/db";
import { supabase, type SupabaseContribution } from "@/lib/supabase";
import { STRIPE_PAY_URL } from "@/lib/stripe";
import {
  FEATURED_BRANDS,
  GOAL_CENTS,
  TIER_BY_ID,
  TIERS,
  isTierId,
  sanitizeHandle,
  sanitizeUrl,
  type Contribution,
  type FundPayload,
  type TierId,
} from "@/lib/fund";

type Row = {
  id: number;
  amount_cents: number;
  tier: string;
  display_name: string;
  x_handle: string | null;
  message: string;
  product_name: string | null;
  product_url: string | null;
  product_pitch: string | null;
  created_at: Date | string;
};

const SEED_VERSION = "paid-three-v2";

const PAID_SEED: Array<{
  amount_cents: number;
  tier: TierId;
  display_name: string;
  x_handle: string | null;
  message: string;
  product_name: string;
  product_url: string;
  product_pitch: string;
}> = FEATURED_BRANDS.map((brand) => ({
  amount_cents: brand.euros * 100,
  tier: "wall" as const,
  display_name: brand.name,
  x_handle: brand.id === "guru" ? "touristasai" : null,
  message:
    brand.id === "cyclades"
      ? "She deserves Santorini."
      : brand.id === "guru"
        ? "Stop buying AI tools."
        : "Villas first. Max seats never.",
  product_name: brand.name,
  product_url: brand.url,
  product_pitch: brand.pitch,
}));

function iso(value: Date | string | null | undefined): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : String(value);
}

function mapRow(row: Row): Contribution {
  if (!isTierId(row.tier)) throw new Error("Unknown tier in database");
  return {
    id: row.id,
    amountCents: Number(row.amount_cents),
    tier: row.tier,
    displayName: row.display_name,
    xHandle: row.x_handle,
    message: row.message,
    productName: row.product_name,
    productUrl: row.product_url,
    productPitch: row.product_pitch,
    createdAt: iso(row.created_at),
  };
}

function mapSupabase(row: SupabaseContribution): Contribution {
  return mapRow({
    id: row.id,
    amount_cents: row.amount_cents,
    tier: row.tier,
    display_name: row.display_name,
    x_handle: row.x_handle,
    message: row.message,
    product_name: row.product_name,
    product_url: row.product_url,
    product_pitch: row.product_pitch,
    created_at: row.created_at,
  });
}

async function readSupabase(): Promise<Contribution[] | null> {
  const { data, error } = await supabase()
    .from("contributions")
    .select(
      "id, amount_cents, tier, display_name, x_handle, message, product_name, product_url, product_pitch, stripe_session_id, created_at",
    )
    .order("amount_cents", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) return null;
  return (data ?? []).map((row) => mapSupabase(row as SupabaseContribution));
}

async function insertSupabase(
  listing: ReturnType<typeof listingFromDraft>,
  stripeSessionId: string | null,
): Promise<Contribution | null> {
  const { data, error } = await supabase()
    .from("contributions")
    .insert({
      amount_cents: listing.tier.dollars * 100,
      tier: listing.tier.id,
      display_name: listing.displayName,
      x_handle: listing.xHandle,
      message: listing.message,
      product_name: listing.productName,
      product_url: listing.productUrl,
      product_pitch: listing.productPitch,
      stripe_session_id: stripeSessionId,
    })
    .select(
      "id, amount_cents, tier, display_name, x_handle, message, product_name, product_url, product_pitch, stripe_session_id, created_at",
    )
    .single();
  if (error || !data) return null;
  return mapSupabase(data as SupabaseContribution);
}

async function seedSupabase() {
  const existing = await readSupabase();
  if (existing === null) return;
  const hosts = new Set(
    existing.filter((c) => c.productUrl).map((c) => c.productUrl!.replace(/\/$/, "")),
  );
  const missing = PAID_SEED.filter((row) => !hosts.has(row.product_url));
  if (missing.length === 0) return;
  await supabase().from("contributions").insert(missing);
}

async function ensureSeed() {
  await seedSupabase();
  const sql = await getSql();
  await sql`
    create table if not exists fund_meta (
      k text primary key,
      v text not null
    )
  `;
  await sql`alter table contributions add column if not exists stripe_session_id text`;
  await sql`
    create table if not exists pending_payments (
      id text primary key,
      payload text not null,
      created_at timestamptz not null default now()
    )
  `;
  const rows = await sql<{ v: string }>`select v from fund_meta where k = 'seed'`;
  if (rows[0]?.v === SEED_VERSION) return;
  await sql`delete from contributions`;
  for (const row of PAID_SEED) {
    await sql`
      insert into contributions (
        amount_cents, tier, display_name, x_handle, message,
        product_name, product_url, product_pitch
      ) values (
        ${row.amount_cents},
        ${row.tier},
        ${row.display_name},
        ${row.x_handle},
        ${row.message},
        ${row.product_name},
        ${row.product_url},
        ${row.product_pitch}
      )
    `;
  }
  await sql`
    insert into fund_meta (k, v) values ('seed', ${SEED_VERSION})
    on conflict (k) do update set v = excluded.v
  `;
}

function remainingFrom(contributions: Contribution[]): Partial<Record<TierId, number>> {
  const counts: Partial<Record<string, number>> = {};
  for (const item of contributions) {
    counts[item.tier] = (counts[item.tier] ?? 0) + 1;
  }
  const remaining: Partial<Record<TierId, number>> = {};
  for (const tier of TIERS) {
    if (tier.limit == null) continue;
    remaining[tier.id] = Math.max(0, tier.limit - (counts[tier.id] ?? 0));
  }
  return remaining;
}

function payloadFrom(contributions: Contribution[]): FundPayload {
  const raisedCents = contributions.reduce((sum, c) => sum + c.amountCents, 0);
  return {
    raisedCents,
    goalCents: GOAL_CENTS,
    count: contributions.length,
    contributions,
    remaining: remainingFrom(contributions),
  };
}

async function loadContributions(): Promise<Contribution[]> {
  await ensureSeed();
  const remote = await readSupabase();
  if (remote && remote.length > 0) return remote;
  const sql = await getSql();
  const rows = await sql<Row>`
    select id, amount_cents, tier, display_name, x_handle, message,
           product_name, product_url, product_pitch, created_at
    from contributions
    order by amount_cents desc, created_at asc
  `;
  return rows.map(mapRow);
}

export const getFund = createServerFn({ method: "GET" }).handler(async (): Promise<FundPayload> => {
  return payloadFrom(await loadContributions());
});

const contributeSchema = z.object({
  tier: z.enum([
    "coffee",
    "api",
    "cocktail",
    "doghouse",
    "ryanair",
    "honeymoon",
    "wall",
    "funded",
    "dinner",
    "official",
    "naming",
  ]),
  displayName: z.string().trim().max(32),
  xHandle: z.string().trim().max(20),
  message: z.string().trim().max(140),
  productName: z.string().trim().max(48),
  productUrl: z.string().trim().max(200),
  productPitch: z.string().trim().max(90),
  anonymous: z.boolean(),
});

type ContributeInput = z.infer<typeof contributeSchema>;

function listingFromDraft(data: ContributeInput) {
  const tier = TIER_BY_ID[data.tier];
  const displayName = data.anonymous || !data.displayName ? "Anonymous" : data.displayName;
  if (!data.anonymous && displayName.length < 2) {
    throw new Error("Name needs two characters, or go anonymous");
  }
  const xHandle = data.anonymous ? null : data.xHandle ? sanitizeHandle(data.xHandle) : null;
  let productName: string | null = data.productName || null;
  let productUrl: string | null = null;
  let productPitch: string | null = data.productPitch || null;
  if (tier.requiresProduct) {
    if (!productName || productName.length < 2) throw new Error("Add the product you want on the wall");
    productUrl = sanitizeUrl(data.productUrl);
  } else if (data.productUrl.trim()) {
    productUrl = sanitizeUrl(data.productUrl);
    productName = productName || displayName;
  }
  return {
    tier,
    displayName,
    xHandle,
    message: data.message,
    productName,
    productUrl,
    productPitch,
  };
}

async function insertListing(
  listing: ReturnType<typeof listingFromDraft>,
  stripeSessionId: string | null,
): Promise<{ contribution: Contribution; raisedCents: number }> {
  await ensureSeed();
  const current = await loadContributions();
  if (listing.tier.limit != null) {
    const left = remainingFrom(current)[listing.tier.id] ?? 0;
    if (left <= 0) throw new Error(`${listing.tier.label} is sold out. That is the point.`);
  }

  const remote = await insertSupabase(listing, stripeSessionId);
  if (remote) {
    const all = await loadContributions();
    return { contribution: remote, raisedCents: all.reduce((s, c) => s + c.amountCents, 0) };
  }

  const sql = await getSql();
  const inserted = await sql<Row>`
    insert into contributions (
      amount_cents, tier, display_name, x_handle, message,
      product_name, product_url, product_pitch, stripe_session_id
    ) values (
      ${listing.tier.dollars * 100},
      ${listing.tier.id},
      ${listing.displayName},
      ${listing.xHandle},
      ${listing.message},
      ${listing.productName},
      ${listing.productUrl},
      ${listing.productPitch},
      ${stripeSessionId}
    )
    returning id, amount_cents, tier, display_name, x_handle, message,
              product_name, product_url, product_pitch, created_at
  `;
  const contribution = mapRow(inserted[0]!);
  const all = await loadContributions();
  return { contribution, raisedCents: all.reduce((s, c) => s + c.amountCents, 0) };
}

export const contribute = createServerFn({ method: "POST" })
  .validator((data: unknown) => contributeSchema.parse(data))
  .handler(async ({ data }) => insertListing(listingFromDraft(data), null));

export const createCheckout = createServerFn({ method: "POST" })
  .validator((data: unknown) => contributeSchema.parse(data))
  .handler(async ({ data }): Promise<{ url: string; pendingId: string }> => {
    listingFromDraft(data);
    await ensureSeed();
    const pendingId = crypto.randomUUID();
    const sql = await getSql();
    await sql`
      insert into pending_payments (id, payload) values (${pendingId}, ${JSON.stringify(data)})
    `;
    return {
      pendingId,
      url: `${STRIPE_PAY_URL}?client_reference_id=${encodeURIComponent(pendingId)}`,
    };
  });

async function listingByStripeSession(sessionId: string): Promise<Contribution | null> {
  const sql = await getSql();
  const rows = await sql<Row>`
    select id, amount_cents, tier, display_name, x_handle, message,
           product_name, product_url, product_pitch, created_at
    from contributions
    where stripe_session_id = ${sessionId}
    limit 1
  `;
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function fulfillStripeSession(input: {
  sessionId: string;
  pendingId: string | null;
  amountCents: number | null;
  customerName: string | null;
}): Promise<{ contribution: Contribution | null; duplicate: boolean }> {
  await ensureSeed();
  const existing = await listingByStripeSession(input.sessionId);
  if (existing) return { contribution: existing, duplicate: true };

  let draft: ContributeInput | null = null;
  if (input.pendingId) {
    const sql = await getSql();
    const rows = await sql<{ payload: string }>`
      select payload from pending_payments where id = ${input.pendingId} limit 1
    `;
    if (rows[0]?.payload) {
      try {
        draft = contributeSchema.parse(JSON.parse(rows[0].payload));
      } catch {
        draft = null;
      }
    }
  }

  if (!draft) {
    draft = {
      tier: "honeymoon",
      displayName: input.customerName || "Anonymous",
      xHandle: "",
      message: "Paid on Stripe.",
      productName: "",
      productUrl: "",
      productPitch: "",
      anonymous: !input.customerName,
    };
  }

  const result = await insertListing(listingFromDraft(draft), input.sessionId);
  return { contribution: result.contribution, duplicate: false };
}
