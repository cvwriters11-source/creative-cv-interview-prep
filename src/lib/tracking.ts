import { getDataClient, hasServiceRole } from "@/lib/supabase/data-client";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type TrackEvent = "register" | "login" | "visit";

export async function trackSiteEvent(input: {
  userId?: string | null;
  email?: string | null;
  event: TrackEvent;
  path?: string | null;
  userAgent?: string | null;
}) {
  try {
    const client = await getDataClient();
    await client.from("site_visits").insert({
      user_id: input.userId || null,
      email: input.email || null,
      event: input.event,
      path: input.path || null,
      user_agent: input.userAgent || null,
    });

    if (input.userId && hasServiceRole()) {
      const admin = getSupabaseAdmin();
      const patch: Record<string, string> = {
        last_seen_at: new Date().toISOString(),
      };
      if (input.email) patch.email = input.email;

      const { data } = await admin
        .from("user_accounts")
        .update(patch)
        .eq("id", input.userId)
        .select("id")
        .maybeSingle();

      if (!data) {
        await admin.from("user_accounts").insert({
          id: input.userId,
          email: input.email || "",
          last_seen_at: patch.last_seen_at,
        });
      }
    } else if (input.userId) {
      // Trigger already creates user_accounts; refresh last_seen when allowed
      await client
        .from("user_accounts")
        .update({
          last_seen_at: new Date().toISOString(),
          ...(input.email ? { email: input.email } : {}),
        })
        .eq("id", input.userId);
    }
  } catch {
    // Tracking must never break auth
  }
}
