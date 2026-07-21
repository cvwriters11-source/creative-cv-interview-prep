export type VoiceGender = "male" | "female";

export type InterviewDurationMinutes = 15 | 30 | 60;

export const INTERVIEW_DURATIONS: InterviewDurationMinutes[] = [15, 30, 60];

export function normalizeDurationMinutes(
  value: unknown,
): InterviewDurationMinutes {
  if (value === 15 || value === 30 || value === 60) return value;
  if (value === "15" || value === "30" || value === "60") {
    return Number(value) as InterviewDurationMinutes;
  }
  return 30;
}

export type SessionStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export type TranscriptTurn = {
  speaker: "user" | "assistant";
  text: string;
  timestamp: string;
};

export type InterviewFeedback = {
  summary: string;
  strengths: string[];
  improvements: string[];
  areas: {
    communication: number;
    content: number;
    confidence: number;
  };
};

export type InterviewSession = {
  id: string;
  user_id: string;
  scheduled_at: string;
  voice_gender: VoiceGender;
  candidate_name: string;
  role_title: string;
  field_of_work: string;
  location: string;
  phone_number: string;
  duration_minutes: InterviewDurationMinutes;
  status: SessionStatus;
  transcript: TranscriptTurn[] | null;
  score: number | null;
  feedback: InterviewFeedback | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
};

export const JOIN_EARLY_MS = 5 * 60 * 1000;

/** Instant practice: join any open or ready session. */
export function canJoinSession(
  _scheduledAt: string,
  status: SessionStatus,
): boolean {
  return status === "scheduled" || status === "in_progress";
}
