import { NextResponse } from "next/server";
import { getGuestUserId } from "@/lib/guest";
import { completeSession, getSession } from "@/lib/sessions/store";
import { scoreInterview } from "@/lib/scoring";
import type { TranscriptTurn } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const userId = await getGuestUserId();
  const { id } = await params;

  let body: { transcript?: TranscriptTurn[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const transcript = Array.isArray(body.transcript) ? body.transcript : [];

  try {
    const session = await getSession(userId, id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status === "completed") {
      return NextResponse.json({ session });
    }

    const { score, feedback } = await scoreInterview(
      session.role_title,
      transcript,
      {
        fieldOfWork: session.field_of_work,
        location: session.location,
      },
    );

    const updated = await completeSession(userId, id, {
      transcript,
      score,
      feedback,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Failed to save results" },
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
