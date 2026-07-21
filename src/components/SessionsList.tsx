"use client";

import Link from "next/link";
import {
  canJoinSession,
  type InterviewSession,
  type SessionStatus,
} from "@/lib/types";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusLabel(status: SessionStatus) {
  switch (status) {
    case "scheduled":
      return "Ready";
    case "in_progress":
      return "In progress";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
  }
}

export function SessionsList({
  initialSessions,
}: {
  initialSessions: InterviewSession[];
}) {
  const active = initialSessions.filter(
    (s) => s.status === "scheduled" || s.status === "in_progress",
  );
  const past = initialSessions.filter((s) => s.status === "completed");

  if (initialSessions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="font-[family-name:var(--font-display)] text-2xl text-ink">
          No interviews yet
        </p>
        <p className="mt-2 text-mist">
          Start a practice session whenever you are ready.
        </p>
        <Link
          href="/schedule"
          className="mt-8 inline-flex rounded-full bg-teal px-6 py-3 text-sm font-semibold text-navy transition hover:bg-foam"
        >
          Start interview
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <section>
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl text-ink">
          Active
        </h2>
        {active.length === 0 ? (
          <p className="text-sm text-mist">No active sessions.</p>
        ) : (
          <ul className="divide-y divide-white/8 border-y border-white/8">
            {active.map((session) => (
              <li
                key={session.id}
                className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-ink">
                    {session.candidate_name
                      ? `${session.candidate_name} · ${session.role_title}`
                      : session.role_title}
                  </p>
                  <p className="mt-1 text-sm text-mist">
                    {formatWhen(session.scheduled_at)} ·{" "}
                    {session.duration_minutes ?? 30} min
                    {session.field_of_work
                      ? ` · ${session.field_of_work}`
                      : ""}{" "}
                    · {session.voice_gender === "male" ? "Male" : "Female"} voice
                    · {statusLabel(session.status)}
                  </p>
                </div>
                {canJoinSession(session.scheduled_at, session.status) ? (
                  <Link
                    href={`/interview/${session.id}`}
                    className="inline-flex shrink-0 items-center justify-center rounded-full bg-teal px-5 py-2.5 text-sm font-semibold text-navy transition hover:bg-foam"
                  >
                    Enter interview
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-xl text-ink">
            Past results
          </h2>
          <ul className="divide-y divide-white/8 border-y border-white/8">
            {past.map((session) => (
              <li
                key={session.id}
                className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-ink">
                    {session.candidate_name
                      ? `${session.candidate_name} · ${session.role_title}`
                      : session.role_title}
                  </p>
                  <p className="mt-1 text-sm text-mist">
                    {formatWhen(session.scheduled_at)}
                    {session.candidate_name ? ` · ${session.candidate_name}` : ""}
                    {session.score != null && <> · {session.score}%</>}
                  </p>
                </div>
                <Link
                  href={`/results/${session.id}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-full border border-teal/40 px-5 py-2.5 text-sm font-semibold text-teal transition hover:bg-teal/10"
                >
                  View feedback
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
