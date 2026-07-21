import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { SessionsList } from "@/components/SessionsList";
import { StartInterviewForm } from "@/components/StartInterviewForm";
import { getGuestUserId } from "@/lib/guest";
import { listSessions } from "@/lib/sessions/store";
import type { InterviewSession } from "@/lib/types";

export default async function InterviewsPage() {
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
      <main className="px-4 py-8 md:px-10 md:py-10">
        <div className="mx-auto mb-8 max-w-3xl">
          <p className="text-sm uppercase tracking-[0.2em] text-mist">
            Interviews
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-ink md:text-4xl">
            Practice interviews
          </h1>
          <p className="mt-2 max-w-2xl text-mist">
            Enter your details, choose a length, and go live. Your score is saved
            under your name so you can track progress.
          </p>
        </div>

        <StartInterviewForm />

        <section className="mx-auto mt-14 max-w-3xl border-t border-white/10 pt-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink">
                Your sessions
              </h2>
              <p className="mt-1 text-sm text-mist">
                Continue a practice or review past results.
              </p>
            </div>
            <Link
              href="/prep"
              className="text-sm font-semibold text-teal transition hover:text-foam"
            >
              Study the prep guide →
            </Link>
          </div>

          {loadError ? (
            <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
              {loadError}
            </div>
          ) : (
            <SessionsList initialSessions={sessions} />
          )}
        </section>
      </main>
    </div>
  );
}
