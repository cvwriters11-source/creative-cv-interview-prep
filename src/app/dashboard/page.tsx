import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { SessionsList } from "@/components/SessionsList";
import { getGuestUserId } from "@/lib/guest";
import { listSessions } from "@/lib/sessions/store";
import type { InterviewSession } from "@/lib/types";

export default async function DashboardPage() {
  const userId = await getGuestUserId();

  let sessions: InterviewSession[] = [];
  let loadError: string | null = null;

  try {
    sessions = await listSessions(userId);
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Failed to load sessions";
  }

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,#1c1e21,#121416_60%)]">
      <AppNav variant="app" />
      <main className="px-6 py-10 md:px-10">
        <div className="mx-auto mb-10 flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl text-ink md:text-4xl">
              Your interviews
            </h1>
            <p className="mt-2 text-mist">
              Continue a practice session or review past scores and transcripts.
            </p>
          </div>
          <Link
            href="/schedule"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-foam"
          >
            New interview
          </Link>
        </div>

        {loadError ? (
          <div className="mx-auto max-w-3xl rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {loadError}
          </div>
        ) : (
          <SessionsList initialSessions={sessions} />
        )}
      </main>
    </div>
  );
}
