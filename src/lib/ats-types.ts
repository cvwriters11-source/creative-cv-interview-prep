export type CvSource = "creative-cv" | "yourself" | "someone-else";

export type AtsAreaReport = {
  score: number;
  findings: string[];
  fixes: string[];
};

export type AtsReport = {
  score: number;
  summary: string;
  source: CvSource;
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
