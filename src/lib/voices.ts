import type {
  VoiceGender,
  InterviewDurationMinutes,
} from "./types";
import { formatQuestionBankForInterviewer } from "./prep-questions";

/** OpenAI Realtime voice ids mapped from interviewer gender. */
export const VOICE_BY_GENDER: Record<VoiceGender, string> = {
  male: "ash",
  female: "coral",
};

/** Display / spoken names for each interviewer voice. */
export const INTERVIEWER_BY_GENDER: Record<
  VoiceGender,
  { name: string; shortLabel: string }
> = {
  female: { name: "Sasha", shortLabel: "Sasha (Female)" },
  male: { name: "Clemence Mayer", shortLabel: "Clemence Mayer (Male)" },
};

export function interviewerName(gender: VoiceGender | null | undefined): string {
  return INTERVIEWER_BY_GENDER[gender === "male" ? "male" : "female"].name;
}

export type InterviewerContext = {
  candidateName?: string;
  roleTitle: string;
  fieldOfWork?: string;
  location?: string;
  durationMinutes?: InterviewDurationMinutes;
  voiceGender?: VoiceGender;
  /** Prior turns when reconnecting after the gateway session limit. */
  resumeBrief?: string | null;
};

function pacingGuidance(durationMinutes: InterviewDurationMinutes): string {
  if (durationMinutes === 15) {
    return [
      `This interview is exactly ${durationMinutes} minutes. Use the FULL time — do not wrap up early.`,
      "Prioritise core questions: introduction, why this role/company, strengths,",
      "a STAR behavioral story, why hire you, and invite their questions near the end.",
      "Keep follow-ups brief. Pace yourself so you are still interviewing until time runs out.",
    ].join(" ");
  }
  if (durationMinutes === 60) {
    return [
      `This interview is exactly ${durationMinutes} minutes. Use the FULL time — do not wrap up early.`,
      "Cover the core bank thoroughly with thoughtful follow-ups, role-specific scenarios,",
      "and bonus themes. Ask one question at a time and leave space for full answers.",
      "If you finish a theme early, dig deeper or move to another theme — never end the interview early.",
    ].join(" ");
  }
  return [
    `This interview is exactly ${durationMinutes} minutes. Use the FULL time — do not wrap up early.`,
    "Cover most of the core bank with light follow-ups.",
    "If you get ahead of schedule, add follow-ups or bonus themes — never conclude before time is up.",
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
  const gender: VoiceGender = ctx.voiceGender === "male" ? "male" : "female";
  const myName = interviewerName(gender);

  const candidateLine = [
    name ? `Candidate name: ${name}.` : null,
    field ? `Field of work: ${field}.` : null,
    location ? `Candidate location: ${location}.` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const resume = ctx.resumeBrief?.trim();

  return [
    `Your name is ${myName}. You are a warm, professional job interviewer conducting a realistic practice interview for the role of "${roleTitle}".`,
    `Always introduce yourself as ${myName}.`,
    candidateLine
      ? `Tailor questions to this industry and market context. ${candidateLine}`
      : "",
    pacingGuidance(durationMinutes),
    "CRITICAL TIMING: The app controls when the interview ends. Keep asking useful interview questions for the entire allotted time.",
    "Do NOT thank them and end early. Do NOT say the interview is over until you are told time is up or only about one minute remains.",
    "If conversation is flowing well and you still have time, continue with deeper follow-ups or a new theme.",
    "If the candidate goes quiet, gently prompt them after a short pause — keep the session active.",
    "HUMOR: If the candidate makes a joke or says something funny or light-hearted, react with a natural warm laugh or chuckle (for example a short 'ha!' or light laughter in your voice), acknowledge it kindly, then steer back to the interview. This should help them feel comfortable — laugh with them, never at them.",
    "Speak clearly and conversationally. Ask one question at a time.",
    resume
      ? [
          "CONTINUATION: A technical reconnect happened. Do NOT restart from the beginning.",
          "Do NOT re-introduce yourself as if the interview is new.",
          "Briefly acknowledge you're continuing, then ask the next natural question.",
          `Context so far:\n${resume}`,
        ].join(" ")
      : name
        ? `Start by briefly introducing yourself as ${myName} and greeting ${name} by name, then ask them to introduce themselves (Tell me about yourself).`
        : `Start by briefly introducing yourself as ${myName} and asking the candidate to introduce themselves (Tell me about yourself).`,
    "Adapt every question to this role and field. Prefer the STAR method when probing behavioral answers.",
    "If location is relevant (remote vs on-site, relocation, local market), ask naturally — do not read out their phone number.",
    "Do not invent salary figures; if salary comes up, ask for their expectations and discuss market fit generally.",
    "Never criticize previous employers if the candidate does; steer toward growth and opportunities.",
    "Keep your own turns concise. Do not lecture. Stay in character until the session ends.",
    "Be encouraging but honest — like a skilled hiring manager who also puts people at ease.",
    "Only when roughly one minute of time remains (or you are explicitly told time is up), briefly thank them and wrap up without starting a new deep question.",
    "",
    formatQuestionBankForInterviewer(),
  ]
    .filter(Boolean)
    .join("\n");
}

/** Build a short resume brief from transcript turns for gateway reconnects. */
export function buildInterviewResumeBrief(
  turns: { speaker: string; text: string }[],
  remainingSeconds: number,
): string {
  const recent = turns.slice(-12);
  const lines = recent.map(
    (t) => `${t.speaker === "user" ? "Candidate" : "Interviewer"}: ${t.text}`,
  );
  const mins = Math.max(1, Math.ceil(remainingSeconds / 60));
  return [
    `About ${mins} minute(s) remain on the clock.`,
    lines.length
      ? `Recent conversation:\n${lines.join("\n")}`
      : "Conversation just started; continue from the current topic.",
  ].join("\n");
}
