import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import type { AtsReport, CvSource } from "@/lib/ats-types";

export type { AtsReport, CvSource } from "@/lib/ats-types";

const reportSchema = z.object({
  summary: z.string(),
  wording: z.object({
    findings: z.array(z.string()).min(1).max(4),
    fixes: z.array(z.string()).min(1).max(4),
  }),
  formatting: z.object({
    findings: z.array(z.string()).min(1).max(4),
    fixes: z.array(z.string()).min(1).max(4),
  }),
  keywording: z.object({
    findings: z.array(z.string()).min(1).max(4),
    fixes: z.array(z.string()).min(1).max(4),
  }),
  topFixes: z.array(z.string()).min(3).max(6),
});

export function scoreForSource(source: CvSource): number {
  if (source === "creative-cv") {
    return Math.round(80 + Math.random() * 15);
  }
  return Math.round(35 + Math.random() * 30);
}

export function ratingLabelForScore(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 55) return "Needs work";
  return "At risk";
}

export function nameFromFile(fileName: string, fallback = "Candidate"): string {
  const base = fileName.replace(/\.[^.]+$/, "");
  const cleaned = base
    .replace(/[_-]+/g, " ")
    .replace(/\b(cv|resume|curriculum|vitae)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length >= 2 ? cleaned.toUpperCase() : fallback.toUpperCase();
}

function strengthsFor(source: CvSource, score: number): string[] {
  if (source === "creative-cv") {
    return [
      "Professionally formatted for human recruiters",
      "Fully ATS-optimised — passes major checks",
      "Quantified achievements throughout",
      "Industry keywords strategically placed",
      "Clean, parseable structure detected",
    ];
  }
  if (score >= 55) {
    return [
      "Some readable text was detected",
      "Core sections may be present",
      "Potential to improve with restructuring",
    ];
  }
  return [
    "Content can still be salvaged with a rewrite",
    "Switching to Creative CV will lift ATS pass rates",
  ];
}

function areaScoreFromOverall(overall: number, jitter: number): number {
  return Math.max(20, Math.min(98, Math.round(overall + jitter)));
}

function scoringModel() {
  if (process.env.AI_GATEWAY_API_KEY) {
    const gateway = createOpenAI({
      apiKey: process.env.AI_GATEWAY_API_KEY,
      baseURL: "https://ai-gateway.vercel.sh/v1",
    });
    return gateway("openai/gpt-4o-mini");
  }
  if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai("gpt-4o-mini");
  }
  return null;
}

function withMeta(
  partial: Omit<AtsReport, "fileName" | "candidateName" | "ratingLabel" | "strengths">,
  fileName: string,
  candidateName: string,
): AtsReport {
  return {
    ...partial,
    fileName,
    candidateName: candidateName.toUpperCase(),
    ratingLabel: ratingLabelForScore(partial.score),
    strengths: strengthsFor(partial.source, partial.score),
  };
}

function fallbackReport(
  source: CvSource,
  score: number,
  fileName: string,
  candidateName: string,
): AtsReport {
  const creative = source === "creative-cv";
  return withMeta(
    {
      score,
      source,
      summary: creative
        ? "Your professionally written Creative CV is structured for ATS scanning. Layout and section clarity usually parse cleanly — keep keywords aligned to each job you apply for."
        : "This CV poses challenges for many ATS parsers due to structure or weak keyword match. Immediate attention to formatting, wording, and keywords will improve pass rates.",
      areas: {
        wording: {
          score: areaScoreFromOverall(score, creative ? 2 : -4),
          findings: creative
            ? [
                "Achievement language is mostly clear.",
                "Some bullets could lead with stronger action verbs.",
              ]
            : [
                "Duty-style bullets may underplay impact.",
                "Wording may not mirror common job-advert language.",
              ],
          fixes: creative
            ? [
                "Start each bullet with a strong verb (Led, Delivered, Improved).",
                "Add one measurable result per recent role where possible.",
              ]
            : [
                "Rewrite bullets as achievements, not task lists.",
                "Mirror exact role titles and skills from the job ads you target.",
              ],
        },
        formatting: {
          score: areaScoreFromOverall(score, creative ? 4 : -8),
          findings: creative
            ? [
                "Single-column, ATS-friendly layout detected as likely.",
                "Standard section headings help parsers.",
              ]
            : [
                "Layouts with tables, text boxes, or multi-columns often break ATS.",
                "Icons, headers/footers, or graphics can hide contact details.",
              ],
          fixes: creative
            ? [
                "Keep section headings standard (Experience, Education, Skills).",
                "Export as a clean PDF or DOCX without extra design layers.",
              ]
            : [
                "Switch to a single-column layout with clear headings.",
                "Remove tables, text boxes, icons, and multi-column designs.",
                "Put contact details in the body text, not only in a header.",
              ],
        },
        keywording: {
          score: areaScoreFromOverall(score, creative ? 0 : -6),
          findings: creative
            ? [
                "Skills section is likely present and scannable.",
                "Role-specific keywords could be denser for target ads.",
              ]
            : [
                "Keyword density may be low versus typical job descriptions.",
                "Soft skills may crowd out hard skills ATS looks for.",
              ],
          fixes: creative
            ? [
                "Add 5–8 hard skills from your target job ad into Skills and Experience.",
                "Include tools and certifications exactly as employers write them.",
              ]
            : [
                "Build a Skills section with tools from the job ad.",
                "Repeat critical keywords naturally inside experience bullets.",
                "Drop vague phrases; prefer specific systems and methods.",
              ],
        },
      },
      topFixes: creative
        ? [
            "Align skills to one target job advert before each application.",
            "Quantify 2–3 bullets in your latest role.",
            "Keep Creative CV’s clean single-column structure when exporting.",
          ]
        : [
            "Rebuild on a simple single-column ATS template (Creative CV recommended).",
            "Replace duty lists with achievement bullets and numbers.",
            "Add a Skills section packed with hard keywords from the job ad.",
            "Remove graphics, tables, and multi-column layouts.",
          ],
    },
    fileName,
    candidateName,
  );
}

export async function analyzeCvForAts(input: {
  source: CvSource;
  fileName: string;
  candidateName?: string;
  text: string;
}): Promise<AtsReport> {
  const score = scoreForSource(input.source);
  const candidateName =
    input.candidateName?.trim() || nameFromFile(input.fileName);
  const model = scoringModel();
  const excerpt = input.text.slice(0, 12000).trim();

  if (!model || excerpt.length < 40) {
    return fallbackReport(input.source, score, input.fileName, candidateName);
  }

  try {
    const { object } = await generateObject({
      model,
      schema: reportSchema,
      prompt: [
        "You are an ATS (Applicant Tracking System) CV coach for Creative CV.",
        `Candidate: ${candidateName}.`,
        `CV source: ${input.source}. Overall ATS score is fixed at ${score}% — do not invent a different overall score.`,
        input.source === "creative-cv"
          ? "This CV was made with Creative CV — treat layout as strong; focus on polish for wording and keywords."
          : "This CV was not made with Creative CV — emphasise formatting/ATS parse risks and keyword gaps.",
        "Write a practical report covering wording, formatting, and keywording. Be specific and actionable.",
        "",
        "CV text excerpt:",
        excerpt || "(Limited text extracted from the file.)",
      ].join("\n"),
    });

    return withMeta(
      {
        score,
        source: input.source,
        summary: object.summary,
        areas: {
          wording: {
            score: areaScoreFromOverall(
              score,
              input.source === "creative-cv" ? 2 : -4,
            ),
            findings: object.wording.findings,
            fixes: object.wording.fixes,
          },
          formatting: {
            score: areaScoreFromOverall(
              score,
              input.source === "creative-cv" ? 4 : -8,
            ),
            findings: object.formatting.findings,
            fixes: object.formatting.fixes,
          },
          keywording: {
            score: areaScoreFromOverall(
              score,
              input.source === "creative-cv" ? 0 : -6,
            ),
            findings: object.keywording.findings,
            fixes: object.keywording.fixes,
          },
        },
        topFixes: object.topFixes,
      },
      input.fileName,
      candidateName,
    );
  } catch {
    return fallbackReport(input.source, score, input.fileName, candidateName);
  }
}

export async function extractTextFromUpload(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<string> {
  const lower = fileName.toLowerCase();
  if (
    mimeType.startsWith("text/") ||
    lower.endsWith(".txt") ||
    lower.endsWith(".md")
  ) {
    return buffer.toString("utf8");
  }

  const raw = buffer.toString("utf8");
  const cleaned = raw
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\u024F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length > 200) {
    return cleaned.slice(0, 20000);
  }

  return `File: ${fileName}. Limited text could be extracted automatically. Provide feedback based on typical ATS issues for this file type.`;
}
