import { NextResponse } from "next/server";
import { getGuestUserId } from "@/lib/guest";
import { getSession } from "@/lib/sessions/store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const userId = await getGuestUserId();
  const { id } = await params;

  try {
    const session = await getSession(userId, id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json({ session });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 },
    );
  }
}
