import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const COOKIE_NAME = "cw_guest_id";
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Stable anonymous id per browser — no login required. */
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
