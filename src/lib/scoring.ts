import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import type { InterviewFeedback, TranscriptTurn } from "@/lib/types";

const feedbackSchema = z.object({
  score: z.number().min(0).max(100),
  summary: z.string(),
  strengths: z.array(z.string()).min(1).max(6),
  improvements: z.array(z.string()).min(1).max(6),
  areas: z.object({
    communication: z.number().min(0).max(100),
    content: z.number().min(0).max(100),
    confidence: z.number().min(0).max(100),
  }),
});

function scoringModel() {
  if (process.env.AI_GATEWAY_API_KEY) {
    const gateway = createOpenAI({
      apiKey: process.env.AI_GATEWAY_API_KEY,
      baseURL: "https://ai-gateway.vercel.sh/v1",
    });
    return gateway("openai/gpt-4o");
  }
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai("gpt-4o");
}

export async function scoreInterview(
  roleTitle: string,
  transcript: TranscriptTurn[],
  context?: { fieldOfWork?: string; location?: string },
): Promise<{ score: number; feedback: InterviewFeedback }> {
  const transcriptText = transcript
    .map((t) => `${t.speaker === "user" ? "Candidate" : "Interviewer"}: ${t.text}`)
    .join("\n");

  const field = context?.fieldOfWork?.trim();
  const location = context?.location?.trim();

  const { object } = await generateObject({
    model: scoringModel(),
    schema: feedbackSchema,
    prompt: [
      `You are an expert interview coach. Score this practice interview for the role "${roleTitle}".`,
      field ? `Field of work / industry: ${field}.` : "",
      location ? `Candidate location / market: ${location}.` : "",
      "Be fair, specific, and actionable. Score 0-100 overall and per area (communication, content, confidence).",
      "Judge classic interview themes: professional self-intro, motivation for the role/company, strengths/weaknesses,",
      "STAR structure on behavioral stories, teamwork/conflict handling, and clarity under pressure.",
      "When relevant, weigh industry fit and local market awareness lightly.",
      "In improvements (\"where to fix\"), give concrete coaching the candidate can practice next time — not vague advice.",
      "If the transcript is short or empty, score conservatively and explain what was missing.",
      "",
      "Transcript:",
      transcriptText || "(No transcript captured — score conservatively based on that.)",
    ]
      .filter(Boolean)
      .join("\n"),
  });

  return {
    score: Math.round(object.score),
    feedback: {
      summary: object.summary,
      strengths: object.strengths,
      improvements: object.improvements,
      areas: object.areas,
    },
  };
}
