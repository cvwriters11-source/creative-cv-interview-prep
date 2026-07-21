import Link from "next/link";
import type { InterviewSession } from "@/lib/types";
import { normalizeDurationMinutes } from "@/lib/types";

export function ResultsView({ session }: { session: InterviewSession }) {
  const feedback = session.feedback;
  const duration = normalizeDurationMinutes(session.duration_minutes);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm uppercase tracking-[0.2em] text-mist">Results</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-ink md:text-4xl">
        {session.candidate_name || "Candidate"}
      </h1>
      <p className="mt-2 text-sm text-mist">
        {session.role_title}
        {session.field_of_work ? ` · ${session.field_of_work}` : ""} ·{" "}
        {duration}-minute practice
        {session.location ? ` · ${session.location}` : ""}
      </p>

      <div className="mt-10 flex flex-wrap items-end gap-6">
        <div>
          <p className="text-sm text-mist">
            Performance
            {session.candidate_name
              ? ` — ${session.candidate_name}`
              : ""}
          </p>
          <p className="font-[family-name:var(--font-display)] text-6xl font-semibold text-teal">
            {session.score ?? "—"}
            <span className="text-2xl text-mist">%</span>
          </p>
        </div>
        {feedback?.areas && (
          <div className="flex flex-wrap gap-6 text-sm">
            {(
              [
                ["Communication", feedback.areas.communication],
                ["Content", feedback.areas.content],
                ["Confidence", feedback.areas.confidence],
              ] as const
            ).map(([label, value]) => (
              <div key={label}>
                <p className="text-mist">{label}</p>
                <p className="text-xl font-semibold text-ink">{value}%</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {feedback?.summary && (
        <section className="mt-12">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-ink">
            Summary
          </h2>
          <p className="mt-3 leading-relaxed text-mist">{feedback.summary}</p>
        </section>
      )}

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        {feedback?.strengths && feedback.strengths.length > 0 && (
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl text-ink">
              Strengths
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-mist">
              {feedback.strengths.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        )}
        {feedback?.improvements && feedback.improvements.length > 0 && (
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl text-ink">
              Where to fix
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-mist">
              {feedback.improvements.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {session.transcript && session.transcript.length > 0 && (
        <section className="mt-12 border-t border-white/10 pt-10">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-ink">
            Transcript
          </h2>
          <ul className="mt-4 max-h-96 space-y-3 overflow-y-auto text-sm">
            {session.transcript.map((t, i) => (
              <li key={`${t.timestamp}-${i}`}>
                <span className={t.speaker === "user" ? "text-teal" : "text-mist"}>
                  {t.speaker === "user" ? "You" : "Interviewer"}:
                </span>{" "}
                <span className="text-ink/90">{t.text}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/interviews"
          className="rounded-full bg-teal px-6 py-3 text-sm font-semibold text-navy transition hover:bg-foam"
        >
          Book another interview
        </Link>
        <Link
          href="/prep"
          className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-ink transition hover:border-teal/50"
        >
          Prep guide
        </Link>
        <Link
          href="/career-development"
          className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-ink transition hover:border-teal/50"
        >
          Career development
        </Link>
      </div>
    </div>
  );
}
