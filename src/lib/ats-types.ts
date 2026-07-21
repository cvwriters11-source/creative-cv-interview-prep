export type CvSource = "creative-cv" | "yourself" | "someone-else";

/** Where the candidate is applying — shapes ATS advice, not the numeric score. */
export type ApplyScope = "local" | "international";

export type AtsAreaReport = {
  score: number;
  findings: string[];
  fixes: string[];
};

export type AtsReport = {
  score: number;
  summary: string;
  source: CvSource;
  applyScope: ApplyScope;
  fileName: string;
  candidateName: string;
  ratingLabel: string;
  strengths: string[];
  areas: {
    wording: AtsAreaReport;
    formatting: AtsAreaReport;
    keywording: AtsAreaReport;
  };
  topFixes: string[];
};
