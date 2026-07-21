import type { VoiceGender, InterviewDurationMinutes } from "./types";
import { formatQuestionBankForInterviewer } from "./prep-questions";

/** OpenAI Realtime voice ids mapped from interviewer gender. */
export const VOICE_BY_GENDER: Record<VoiceGender, string> = {
  male: "ash",
  female: "coral",
};

export type InterviewerContext = {
  candidateName?: string;
  roleTitle: string;
  fieldOfWork?: string;
  location?: string;
  durationMinutes?: InterviewDurationMinutes;
};

function pacingGuidance(durationMinutes: InterviewDurationMinutes): string {
  if (durationMinutes === 15) {
    return [
      "This is a 15-minute interview. Prioritise core questions: introduction, why this role/company,",
      "strengths, a STAR behavioral story, why hire you, and invite their questions at the end.",
      "Keep follow-ups brief. Aim for about 5–7 questions total.",
    ].join(" ");
  }
  if (durationMinutes === 60) {
    return [
      "This is a 60-minute interview. Cover the full core bank thoroughly with thoughtful follow-ups,",
      "add role-specific scenarios, and include a few bonus themes if time allows.",
      "Still ask one question at a time and leave space for the candidate to answer fully.",
    ].join(" ");
  }
  return [
    "This is a 30-minute interview. Cover most of the core bank with light follow-ups.",
    "Skip or briefly touch logistics questions unless they come up naturally.",
  ].join(" ");
}

export function interviewerInstructions(
  roleTitleOrContext: string | InterviewerContext,
  durationMinutesArg: InterviewDurationMinutes = 30,
): string {
  const ctx: InterviewerContext =
    typeof roleTitleOrContext === "string"
      ? { roleTitle: roleTitleOrContext, durationMinutes: durationMinutesArg }
      : roleTitleOrContext;

  const roleTitle = ctx.roleTitle;
  const durationMinutes = ctx.durationMinutes ?? durationMinutesArg;
  const name = ctx.candidateName?.trim();
  const field = ctx.fieldOfWork?.trim();
  const location = ctx.location?.trim();

  const candidateLine = [
    name ? `Candidate name: ${name}.` : null,
    field ? `Field of work: ${field}.` : null,
    location ? `Candidate location: ${location}.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return [
    `You are a professional job interviewer conducting a realistic practice interview for the role of "${roleTitle}".`,
    candidateLine
      ? `Tailor questions to this industry and market context. ${candidateLine}`
      : "",
    pacingGuidance(durationMinutes),
    "Speak clearly and conversationally. Ask one question at a time.",
    name
      ? `Start by briefly introducing yourself and greeting ${name} by name, then ask them to introduce themselves (Tell me about yourself).`
      : "Start by briefly introducing yourself and asking the candidate to introduce themselves (Tell me about yourself).",
    "Adapt every question to this role and field. Prefer the STAR method when probing behavioral answers.",
    "If location is relevant (remote vs on-site, relocation, local market), ask naturally — do not read out their phone number.",
    "Do not invent salary figures; if salary comes up, ask for their expectations and discuss market fit generally.",
    "Never criticize previous employers if the candidate does; steer toward growth and opportunities.",
    "Keep your own turns concise. Do not lecture. Stay in character until the session ends.",
    "Be encouraging but honest — like a skilled hiring manager.",
    "When the session is ending because time is up, briefly thank them and wrap up without starting a new question.",
    "",
    formatQuestionBankForInterviewer(),
  ]
    .filter(Boolean)
    .join("\n");
}
