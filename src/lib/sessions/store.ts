import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type {
  InterviewDurationMinutes,
  InterviewFeedback,
  InterviewSession,
  SessionStatus,
  TranscriptTurn,
  VoiceGender,
} from "@/lib/types";
import { normalizeDurationMinutes } from "@/lib/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type CreateSessionInput = {
  userId: string;
  scheduledAt: string;
  voiceGender: VoiceGender;
  candidateName: string;
  roleTitle: string;
  fieldOfWork: string;
  location: string;
  phoneNumber: string;
  durationMinutes: InterviewDurationMinutes;
};

function withDefaults(session: InterviewSession): InterviewSession {
  return {
    ...session,
    duration_minutes: normalizeDurationMinutes(session.duration_minutes),
    candidate_name: session.candidate_name?.trim() || "Candidate",
    field_of_work: session.field_of_work?.trim() || "General",
    location: session.location?.trim() || "Not specified",
    phone_number: session.phone_number?.trim() || "",
  };
}

export type CompleteSessionInput = {
  transcript: TranscriptTurn[];
  score: number;
  feedback: InterviewFeedback;
};

function hasSupabaseAdmin(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim(),
  );
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "sessions.json");

async function readLocal(): Promise<InterviewSession[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as InterviewSession[];
  } catch {
    return [];
  }
}

async function writeLocal(sessions: InterviewSession[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(sessions, null, 2), "utf8");
}

export async function listSessions(userId: string): Promise<InterviewSession[]> {
  if (hasSupabaseAdmin()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("scheduled_at", { ascending: false });
    if (error) throw new Error(error.message);
    return ((data as InterviewSession[]) ?? []).map(withDefaults);
  }

  const all = await readLocal();
  return all
    .filter((s) => s.user_id === userId)
    .map(withDefaults)
    .sort(
      (a, b) =>
        new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime(),
    );
}

export async function getSession(
  userId: string,
  id: string,
): Promise<InterviewSession | null> {
  if (hasSupabaseAdmin()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();
    if (error || !data) return null;
    return withDefaults(data as InterviewSession);
  }

  const all = await readLocal();
  const found = all.find((s) => s.id === id && s.user_id === userId);
  return found ? withDefaults(found) : null;
}

export async function createSession(
  input: CreateSessionInput,
): Promise<InterviewSession> {
  if (hasSupabaseAdmin()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("interview_sessions")
      .insert({
        user_id: input.userId,
        scheduled_at: input.scheduledAt,
        voice_gender: input.voiceGender,
        candidate_name: input.candidateName,
        role_title: input.roleTitle,
        field_of_work: input.fieldOfWork,
        location: input.location,
        phone_number: input.phoneNumber,
        duration_minutes: input.durationMinutes,
        status: "scheduled",
      })
      .select("*")
      .single();
    if (error || !data) throw new Error(error?.message || "Create failed");
    return withDefaults(data as InterviewSession);
  }

  const session: InterviewSession = {
    id: randomUUID(),
    user_id: input.userId,
    scheduled_at: input.scheduledAt,
    voice_gender: input.voiceGender,
    candidate_name: input.candidateName,
    role_title: input.roleTitle,
    field_of_work: input.fieldOfWork,
    location: input.location,
    phone_number: input.phoneNumber,
    duration_minutes: input.durationMinutes,
    status: "scheduled",
    transcript: null,
    score: null,
    feedback: null,
    started_at: null,
    ended_at: null,
    created_at: new Date().toISOString(),
  };
  const all = await readLocal();
  all.push(session);
  await writeLocal(all);
  return session;
}

export async function updateSessionStatus(
  userId: string,
  id: string,
  status: SessionStatus,
  extra: Partial<InterviewSession> = {},
): Promise<InterviewSession | null> {
  if (hasSupabaseAdmin()) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("interview_sessions")
      .update({ status, ...extra })
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();
    if (error || !data) return null;
    return withDefaults(data as InterviewSession);
  }

  const all = await readLocal();
  const idx = all.findIndex((s) => s.id === id && s.user_id === userId);
  if (idx < 0) return null;
  all[idx] = withDefaults({ ...all[idx], status, ...extra });
  await writeLocal(all);
  return all[idx];
}

export async function completeSession(
  userId: string,
  id: string,
  input: CompleteSessionInput,
): Promise<InterviewSession | null> {
  return updateSessionStatus(userId, id, "completed", {
    transcript: input.transcript,
    score: input.score,
    feedback: input.feedback,
    ended_at: new Date().toISOString(),
  });
}

export function usingLocalStore(): boolean {
  return !hasSupabaseAdmin();
}
