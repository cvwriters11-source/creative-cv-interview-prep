import { gateway } from "ai";
import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/guest";
import { REALTIME_MODEL_ID } from "@/lib/realtime/gateway-browser-model";
import { getSession } from "@/lib/sessions/store";
import { canJoinSession, normalizeDurationMinutes } from "@/lib/types";

export async function POST(req: Request) {
  const userId = await requireUserId();

  if (!process.env.AI_GATEWAY_API_KEY) {
    return NextResponse.json(
      {
        error:
          "AI_GATEWAY_API_KEY is not configured. Add it to .env.local to enable live voice.",
      },
      { status: 500 },
    );
  }

  const { searchParams } = new URL(req.url);
  let sessionId = searchParams.get("sessionId") ?? undefined;

  let body: { sessionId?: string; sessionConfig?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    // Hook always sends JSON; empty body is fine if sessionId is in the query.
  }

  sessionId = sessionId || body.sessionId;
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  try {
    const session = await getSession(userId, sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (!canJoinSession(session.scheduled_at, session.status)) {
      return NextResponse.json(
        { error: "Interview is not open yet" },
        { status: 403 },
      );
    }

    const token = await gateway.experimental_realtime.getToken({
      model: REALTIME_MODEL_ID,
      // Gateway realtime sessions max out at ~25 minutes; mint for full slot (capped).
      expiresAfterSeconds: Math.min(
        normalizeDurationMinutes(session.duration_minutes) * 60 + 120,
        60 * 25,
      ),
    });

    return NextResponse.json({
      ...token,
      tools: [],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 },
    );
  }
}
