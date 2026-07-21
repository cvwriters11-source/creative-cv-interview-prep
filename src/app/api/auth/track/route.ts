import { NextResponse } from "next/server";
import { trackSiteEvent, type TrackEvent } from "@/lib/tracking";

const EVENTS: TrackEvent[] = ["register", "login", "visit"];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = body.event as TrackEvent;
    if (!EVENTS.includes(event)) {
      return NextResponse.json({ error: "Invalid event" }, { status: 400 });
    }

    await trackSiteEvent({
      userId: typeof body.userId === "string" ? body.userId : null,
      email: typeof body.email === "string" ? body.email : null,
      event,
      path: typeof body.path === "string" ? body.path : null,
      userAgent: req.headers.get("user-agent"),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Track failed" },
      { status: 500 },
    );
  }
}
