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
      await admin
        .from("profiles")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", input.userId);
    }
  } catch {
    // Tracking must never break auth
  }
}
