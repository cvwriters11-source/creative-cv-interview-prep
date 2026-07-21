import { NextResponse } from "next/server";
import { getGuestUserId } from "@/lib/guest";
import { getSession, updateSessionStatus } from "@/lib/sessions/store";
import { canJoinSession } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: Params) {
  const userId = await getGuestUserId();
  const { id } = await params;

  try {
    const session = await getSession(userId, id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (!canJoinSession(session.scheduled_at, session.status)) {
      return NextResponse.json(
        { error: "This interview cannot be started." },
        { status: 403 },
      );
    }

    if (session.status === "completed" || session.status === "cancelled") {
      return NextResponse.json(
        { error: "This session is already finished" },
        { status: 400 },
      );
    }

    if (session.status === "in_progress") {
      return NextResponse.json({ session });
    }

    const updated = await updateSessionStatus(userId, id, "in_progress", {
      started_at: new Date().toISOString(),
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to start session" },
        { status: 500 },
      );
    }

    return NextResponse.json({ session: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 },
    );
  }
}
