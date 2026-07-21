import { NextResponse } from "next/server";
import { isValidPhoneNumber, normalizePhoneNumber } from "@/lib/candidate";
import { requireUserId } from "@/lib/guest";
import { createSession, listSessions } from "@/lib/sessions/store";
import {
  INTERVIEW_DURATIONS,
  normalizeDurationMinutes,
  type InterviewDurationMinutes,
  type VoiceGender,
} from "@/lib/types";

export async function GET() {
  const userId = await requireUserId();

  try {
    const sessions = await listSessions(userId);
    return NextResponse.json({ sessions });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const userId = await requireUserId();

  let body: {
    scheduledAt?: string;
    startNow?: boolean;
    voiceGender?: VoiceGender;
    candidateName?: string;
    roleTitle?: string;
    fieldOfWork?: string;
    location?: string;
    phoneNumber?: string;
    durationMinutes?: InterviewDurationMinutes;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { voiceGender, roleTitle, startNow } = body;
  const durationMinutes = normalizeDurationMinutes(body.durationMinutes);
  const candidateName = body.candidateName?.trim() ?? "";
  const fieldOfWork = body.fieldOfWork?.trim() ?? "";
  const location = body.location?.trim() ?? "";
  const phoneNumber = normalizePhoneNumber(body.phoneNumber ?? "");

  if (!candidateName || candidateName.length < 2) {
    return NextResponse.json(
      { error: "Please enter your full name" },
      { status: 400 },
    );
  }

  if (!voiceGender || !roleTitle?.trim()) {
    return NextResponse.json(
      { error: "voiceGender and roleTitle are required" },
      { status: 400 },
    );
  }

  if (!fieldOfWork) {
    return NextResponse.json(
      { error: "fieldOfWork is required" },
      { status: 400 },
    );
  }

  if (!location) {
    return NextResponse.json(
      { error: "location is required" },
      { status: 400 },
    );
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    return NextResponse.json(
      { error: "Enter a valid phone number (7–15 digits)" },
      { status: 400 },
    );
  }

  if (voiceGender !== "male" && voiceGender !== "female") {
    return NextResponse.json({ error: "Invalid voiceGender" }, { status: 400 });
  }

  if (!INTERVIEW_DURATIONS.includes(durationMinutes)) {
    return NextResponse.json(
      { error: "durationMinutes must be 15, 30, or 60" },
      { status: 400 },
    );
  }

  const when = startNow
    ? new Date()
    : body.scheduledAt
      ? new Date(body.scheduledAt)
      : new Date();

  if (Number.isNaN(when.getTime())) {
    return NextResponse.json({ error: "Invalid scheduledAt" }, { status: 400 });
  }

  try {
    const session = await createSession({
      userId,
      scheduledAt: when.toISOString(),
      voiceGender,
      candidateName,
      roleTitle: roleTitle.trim(),
      fieldOfWork,
      location,
      phoneNumber,
      durationMinutes,
    });
    return NextResponse.json({ session }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 },
    );
  }
}
