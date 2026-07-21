import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { AtsReport } from "@/lib/ats-types";
import type { InterviewFeedback, InterviewSession } from "@/lib/types";

export type UserAccountRow = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  last_seen_at: string;
};

export type SiteVisitRow = {
  id: number;
  user_id: string | null;
  email: string | null;
  event: string;
  path: string | null;
  user_agent: string | null;
  created_at: string;
};

export type AtsAnalysisRow = {
  id: string;
  user_id: string | null;
  email: string | null;
  score: number;
  source: string;
  apply_scope: string;
  file_name: string | null;
  candidate_name: string | null;
  rating_label: string | null;
  summary: string | null;
  strengths: string[];
  areas: AtsReport["areas"] | Record<string, unknown>;
  top_fixes: string[];
  created_at: string;
};

export type AdminDashboardData = {
  users: UserAccountRow[];
  visits: SiteVisitRow[];
  interviews: InterviewSession[];
  atsAnalyses: AtsAnalysisRow[];
  stats: {
    users: number;
    logins: number;
    registers: number;
    interviewsCompleted: number;
    atsChecks: number;
    avgInterviewScore: number | null;
    avgAtsScore: number | null;
  };
};

function emptyDashboard(): AdminDashboardData {
  return {
    users: [],
    visits: [],
    interviews: [],
    atsAnalyses: [],
    stats: {
      users: 0,
      logins: 0,
      registers: 0,
      interviewsCompleted: 0,
      atsChecks: 0,
      avgInterviewScore: null,
      avgAtsScore: null,
    },
  };
}

export async function saveAtsAnalysis(input: {
  userId?: string | null;
  email?: string | null;
  report: AtsReport;
}) {
  try {
    const admin = getSupabaseAdmin();
    await admin.from("ats_analyses").insert({
      user_id: input.userId || null,
      email: input.email || null,
      score: input.report.score,
      source: input.report.source,
      apply_scope: input.report.applyScope,
      file_name: input.report.fileName,
      candidate_name: input.report.candidateName,
      rating_label: input.report.ratingLabel,
      summary: input.report.summary,
      strengths: input.report.strengths,
      areas: input.report.areas,
      top_fixes: input.report.topFixes,
    });
  } catch {
    // Persistence must not break the user-facing ATS flow
  }
}

export async function loadAdminDashboard(): Promise<AdminDashboardData> {
  try {
    const admin = getSupabaseAdmin();

    const [usersRes, visitsRes, interviewsRes, atsRes] = await Promise.all([
      admin
        .from("user_accounts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      admin
        .from("site_visits")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      admin
        .from("interview_sessions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      admin
        .from("ats_analyses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    const users = (usersRes.data || []) as UserAccountRow[];
    const visits = (visitsRes.data || []) as SiteVisitRow[];
    const interviews = (interviewsRes.data || []).map((row) => ({
      ...row,
      feedback: (row.feedback as InterviewFeedback | null) ?? null,
    })) as InterviewSession[];
    const atsAnalyses = (atsRes.data || []).map((row) => ({
      ...row,
      strengths: (row.strengths as string[]) || [],
      top_fixes: (row.top_fixes as string[]) || [],
      areas: row.areas || {},
    })) as AtsAnalysisRow[];

    const completed = interviews.filter(
      (s) => s.status === "completed" && typeof s.score === "number",
    );
    const avgInterviewScore =
      completed.length > 0
        ? Math.round(
            completed.reduce((sum, s) => sum + (s.score || 0), 0) /
              completed.length,
          )
        : null;
    const avgAtsScore =
      atsAnalyses.length > 0
        ? Math.round(
            atsAnalyses.reduce((sum, a) => sum + a.score, 0) /
              atsAnalyses.length,
          )
        : null;

    return {
      users,
      visits,
      interviews,
      atsAnalyses,
      stats: {
        users: users.length,
        logins: visits.filter((v) => v.event === "login").length,
        registers: visits.filter((v) => v.event === "register").length,
        interviewsCompleted: completed.length,
        atsChecks: atsAnalyses.length,
        avgInterviewScore,
        avgAtsScore,
      },
    };
  } catch {
    return emptyDashboard();
  }
}
