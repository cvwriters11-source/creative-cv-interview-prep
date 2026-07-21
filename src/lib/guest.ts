import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";

const COOKIE_NAME = "cw_guest_id";
const ONE_YEAR = 60 * 60 * 24 * 365;

function authConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/** Prefer signed-in Supabase user; local/guest fallback when Auth is not configured. */
export async function getCurrentUserId(): Promise<string | null> {
  if (authConfigured()) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user?.id) return user.id;
    } catch {
      // fall through
    }
    return null;
  }
  return getGuestUserId();
}

/** Stable anonymous id — only used when Supabase Auth env is missing (local fallback). */
export async function getGuestUserId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(COOKIE_NAME)?.value;
  if (existing && existing.startsWith("guest_")) {
    return existing;
  }

  const id = `guest_${randomUUID()}`;
  jar.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  });
  return id;
}

/**
 * Require a signed-in user (or local guest when Auth is not configured).
 * In App Router pages this redirects to /login.
 */
export async function requireUserId(): Promise<string> {
  const id = await getCurrentUserId();
  if (id) return id;

  if (authConfigured()) {
    redirect("/login");
  }
  throw new Error("Sign in required");
}
