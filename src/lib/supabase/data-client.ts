import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

export function hasServiceRole(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

/** Prefer service role; fall back to the signed-in user's client (RLS). */
export async function getDataClient(): Promise<SupabaseClient> {
  if (hasServiceRole()) {
    return getSupabaseAdmin();
  }
  return createClient();
}
