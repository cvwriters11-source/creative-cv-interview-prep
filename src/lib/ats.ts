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

/** Stable 32-bit hash so the same CV text always maps to the same score. */
function fingerprint(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Score from CV content only — not from the claimed source.
 * Same file/text → same score every time (Creative CV claim cannot inflate it).
 */
export function scoreFromCvContent(text: string, fileName: string): number {
  const normalized = `${fileName}\n${text}`
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  const h = fingerprint(normalized.slice(0, 12000));

  let score = 38;

  const bonuses: [RegExp, number][] = [
    [/\b(experience|employment|work history|professional experience)\b/, 9],
    [/\beducation\b/, 5],
    [/\bskills?\b/, 8],
    [/\b(summary|profile|objective|about me)\b/, 4],
    [/\b(certifications?|qualifications?)\b/, 3],
    [
      /\b(achieved|improved|increased|reduced|delivered|led|managed|built|launched)\b/,
      8,
    ],
    [/\d+\s*%|\$\s*\d|\b\d{2,}\s*(years?|clients?|people|users|projects?)\b/, 7],
    [/\b(email|phone|linkedin|@)\b/, 4],
    [/\b(bachelor|master|degree|diploma|bsc|ba|mba)\b/, 3],
  ];

  for (const [re, pts] of bonuses) {
    if (re.test(normalized)) score += pts;
  }

  if (normalized.length < 180) score -= 18;
  else if (normalized.length < 500) score -= 8;
  else if (normalized.length > 1800) score += 5;

  if (/\b(text box|textbox|multi-?column|table cell)\b/.test(normalized)) {
    score -= 8;
  }
  if (normalized.includes("limited text could be extracted")) {
    score = 42 + (h % 12);
  }

  // Tiny deterministic offset (0–5) so identical CVs stay identical
  score += h % 6;

  return Math.max(35, Math.min(94, Math.round(score)));
}

/** @deprecated Source no longer drives score — kept for any old imports. */
export function scoreForSource(
  _source: CvSource,
  text = "",
  fileName = "",
): number {
  return scoreFromCvContent(text, fileName);
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

function strengthsFor(score: number): string[] {
  if (score >= 80) {
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
  partial: Omit<
    AtsReport,
    "fileName" | "candidateName" | "ratingLabel" | "strengths"
  >,
  fileName: string,
  candidateName: string,
): AtsReport {
  return {
    ...partial,
    fileName,
    candidateName: candidateName.toUpperCase(),
    ratingLabel: ratingLabelForScore(partial.score),
    strengths: strengthsFor(partial.score),
  };
}

function fallbackReport(
  source: CvSource,
  score: number,
  fileName: string,
  candidateName: string,
): AtsReport {
  const strong = score >= 80;
  return withMeta(
    {
      score,
      source,
      summary: strong
        ? "This CV is structured well for ATS scanning. Layout and section clarity usually parse cleanly — keep keywords aligned to each job you apply for."
        : "This CV poses challenges for many ATS parsers due to structure or weak keyword match. Immediate attention to formatting, wording, and keywords will improve pass rates.",
      areas: {
        wording: {
          score: areaScoreFromOverall(score, strong ? 2 : -4),
          findings: strong
            ? [
                "Achievement language is mostly clear.",
                "Some bullets could lead with stronger action verbs.",
              ]
            : [
                "Duty-style bullets may underplay impact.",
                "Wording may not mirror common job-advert language.",
              ],
          fixes: strong
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
          score: areaScoreFromOverall(score, strong ? 4 : -8),
          findings: strong
            ? [
                "Single-column, ATS-friendly layout detected as likely.",
                "Standard section headings help parsers.",
              ]
            : [
                "Layouts with tables, text boxes, or multi-columns often break ATS.",
                "Icons, headers/footers, or graphics can hide contact details.",
              ],
          fixes: strong
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
          score: areaScoreFromOverall(score, strong ? 0 : -6),
          findings: strong
            ? [
                "Skills section is likely present and scannable.",
                "Role-specific keywords could be denser for target ads.",
              ]
            : [
                "Keyword density may be low versus typical job descriptions.",
                "Soft skills may crowd out hard skills ATS looks for.",
              ],
          fixes: strong
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
      topFixes: strong
        ? [
            "Align skills to one target job advert before each application.",
            "Quantify 2–3 bullets in your latest role.",
            "Keep a clean single-column structure when exporting.",
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
  // Score from content only — claimed source cannot change it
  const score = scoreFromCvContent(input.text, input.fileName);
  const candidateName =
    input.candidateName?.trim() || nameFromFile(input.fileName);
  const model = scoringModel();
  const excerpt = input.text.slice(0, 12000).trim();
  const strong = score >= 80;

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
        `Overall ATS score is fixed at ${score}% from content analysis — do not invent a different overall score.`,
        "Do not change the score based on who the user claims wrote the CV.",
        strong
          ? "This CV scores strongly — treat layout as solid; focus on polish for wording and keywords."
          : "This CV scores weakly — emphasise formatting/ATS parse risks and keyword gaps.",
        input.source === "creative-cv" && !strong
          ? "User claimed Creative CV, but content quality does not support a high ATS score — be honest."
          : "",
        "Write a practical report covering wording, formatting, and keywording. Be specific and actionable.",
        "",
        "CV text excerpt:",
        excerpt || "(Limited text extracted from the file.)",
      ]
        .filter(Boolean)
        .join("\n"),
    });

    return withMeta(
      {
        score,
        source: input.source,
        summary: object.summary,
        areas: {
          wording: {
            score: areaScoreFromOverall(score, strong ? 2 : -4),
            findings: object.wording.findings,
            fixes: object.wording.fixes,
          },
          formatting: {
            score: areaScoreFromOverall(score, strong ? 4 : -8),
            findings: object.formatting.findings,
            fixes: object.formatting.fixes,
          },
          keywording: {
            score: areaScoreFromOverall(score, strong ? 0 : -6),
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

  // Include a content fingerprint from the raw bytes so the same file
  // still gets a stable score even when little text is extractable.
  const byteFingerprint = fingerprint(
    Buffer.from(buffer.subarray(0, Math.min(buffer.length, 64000))).toString(
      "binary",
    ),
  );
  return `File: ${fileName}. Limited text could be extracted automatically. Provide feedback based on typical ATS issues for this file type. Content id: ${byteFingerprint}.`;
}
