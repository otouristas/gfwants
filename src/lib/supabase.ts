import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "https://xfhgdufuareuhyjdwcbp.supabase.co";

const key =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "sb_publishable_wfBaCBVzj_-Ge6awA91cBA_DTO1ents";

let cached: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (!cached) cached = createClient(url, key, { auth: { persistSession: false } });
  return cached;
}

export type SupabaseContribution = {
  id: number;
  amount_cents: number;
  tier: string;
  display_name: string;
  x_handle: string | null;
  message: string;
  product_name: string | null;
  product_url: string | null;
  product_pitch: string | null;
  stripe_session_id: string | null;
  click_count?: number | null;
  created_at: string;
};
