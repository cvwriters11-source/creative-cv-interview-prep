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
    const admin = getSupabaseAdmin();
    await admin.from("site_visits").insert({
      user_id: input.userId || null,
      email: input.email || null,
      event: input.event,
      path: input.path || null,
      user_agent: input.userAgent || null,
    });

    if (input.userId) {
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
    }
  } catch {
    // Tracking must never break auth
  }
}
