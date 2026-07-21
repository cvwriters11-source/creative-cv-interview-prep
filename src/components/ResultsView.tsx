"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { InterviewSession } from "@/lib/types";
import { normalizeDurationMinutes } from "@/lib/types";
import { shareResultsImage } from "@/lib/share-results-image";
import { interviewerName } from "@/lib/voices";

function ScoreRing({ score }: { score: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const offset = c * (1 - pct);
  const high = score >= 80;

  return (
    <div className="relative h-[132px] w-[132px] shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke="#1a3a2a"
          strokeWidth="10"
        />
        <circle
          cx="64"
          cy="64"
          r={r}
          fill="none"
          stroke={high ? "#22c55e" : "#e85d04"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-3xl font-bold leading-none">{score}</span>
        <span className="mt-0.5 text-xs text-white/70">/100</span>
      </div>
    </div>
  );
}

function Stars({ score }: { score: number }) {
  const filled =
    score >= 90 ? 5 : score >= 80 ? 4 : score >= 60 ? 3 : score >= 45 ? 2 : 1;
  return (
    <div className="flex gap-0.5" aria-label={`${filled} of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={`text-sm ${i < filled ? "text-[#e85d04]" : "text-white/25"}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function ratingLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Strong";
  if (score >= 55) return "Needs work";
  return "Keep practising";
}

export function ResultsView({ session }: { session: InterviewSession }) {
  const router = useRouter();
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [sharing, setSharing] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const feedback = session.feedback;
  const duration = normalizeDurationMinutes(session.duration_minutes);
  const score = typeof session.score === "number" ? session.score : 0;
  const strong = score >= 80;
  const host = interviewerName(session.voice_gender);
  const hostInitials = host
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const candidate = session.candidate_name?.trim() || "Candidate";

  const shareText = [
    `Creative CV Interview Results`,
    `${candidate}: ${score}/100 (${ratingLabel(score)})`,
    `${session.role_title}${session.field_of_work ? ` · ${session.field_of_work}` : ""}`,
    `${duration}-minute practice with ${host}`,
  ].join("\n");

  async function shareScorePicture() {
    const el = shareCardRef.current;
    if (!el || sharing) return;
    setSharing(true);
    setShareNote(null);
    try {
      const mode = await shareResultsImage({
        element: el,
        fileName: `creative-cv-interview-${candidate.replace(/\s+/g, "-").toLowerCase()}-${score}.png`,
        title: "Creative CV Interview Results",
        text: shareText,
      });
      if (mode === "downloaded") {
        setShareNote(
          "Score picture downloaded. Attach it in WhatsApp so the client can read it easily.",
        );
      }
    } catch (err) {
      setShareNote(
        err instanceof Error
          ? err.message
          : "Could not create the score picture. Try again.",
      );
    } finally {
      setSharing(false);
    }
  }

  const highlightItems = strong
    ? feedback?.strengths?.slice(0, 5) || []
    : feedback?.improvements?.slice(0, 5) ||
      feedback?.strengths?.slice(0, 5) ||
      [];

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <div
        data-share-ignore="true"
        className="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-t-2xl bg-[#0a1628] px-3 py-3 text-white"
      >
        <button
          type="button"
          onClick={() => router.push("/interviews")}
          className="flex items-center gap-1 text-sm font-medium text-white/90"
        >
          <span aria-hidden>←</span> Back
        </button>
        <p className="text-sm font-semibold">Interview Results</p>
        <button
          type="button"
          onClick={() => void shareScorePicture()}
          disabled={sharing}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
        >
          <span aria-hidden>↗</span> {sharing ? "…" : "Share"}
        </button>
      </div>

      <div
        ref={shareCardRef}
        className="space-y-3 rounded-b-2xl bg-[#eef1f4] px-3 pb-6 pt-3"
      >
        {strong ? (
          <div className="flex items-start gap-3 rounded-2xl border border-[#e85d04]/35 bg-[#fff4eb] px-3.5 py-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e85d04] text-sm font-bold text-white">
              ✓
            </span>
            <div>
              <p className="text-sm font-bold text-[#e85d04]">
                Strong interview performance
              </p>
              <p className="mt-0.5 text-xs leading-snug text-[#c44d03]">
                You showed clear answers and solid interview readiness.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-50 px-3.5 py-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">
              !
            </span>
            <div>
              <p className="text-sm font-bold text-amber-800">
                Practice opportunity
              </p>
              <p className="mt-0.5 text-xs leading-snug text-amber-700">
                Keep practising with Creative CV to lift structure, depth, and
                confidence.
              </p>
            </div>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl bg-[#0a1628] text-white shadow-lg">
          <div className="flex items-center gap-2 bg-[#132238] px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white/80">
            <span
              className="inline-block h-3.5 w-3 shrink-0 rounded-sm bg-[#e85d04]"
              aria-hidden
            />
            <span className="truncate">
              INTERVIEW FOR: {candidate}
              {session.location ? ` · ${session.location}` : ""}
            </span>
          </div>
          <div className="flex gap-4 px-3.5 py-4">
            <div className="flex flex-col items-center gap-1.5">
              <ScoreRing score={score} />
              <Stars score={score} />
              <p className="text-sm font-semibold">{ratingLabel(score)}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/55">
                {strong ? "Your strengths" : "Focus areas"}
              </p>
              <ul className="mt-2 space-y-2">
                {highlightItems.length > 0 ? (
                  highlightItems.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2 text-[12px] leading-snug"
                    >
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          strong
                            ? "bg-[#22c55e] text-white"
                            : "bg-[#e85d04] text-white"
                        }`}
                      >
                        {strong ? "✓" : "!"}
                      </span>
                      <span className="text-white/90">{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-[12px] text-white/70">
                    Complete another run to unlock detailed strengths.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-[#0a1628] px-3.5 py-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e85d04] text-sm font-bold">
              {hostInitials}
            </span>
            <div>
              <p className="text-sm font-bold">
                {host} · Interviewer
              </p>
              <p className="text-[11px] text-white/55">
                Creative-CV Interview Assessment · {duration} min ·{" "}
                {session.role_title}
              </p>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-white/90">
            {feedback?.summary ||
              "Your interview session is complete. Review the score and tips below, then book another practice."}
          </p>
          <p className="mt-3 flex items-start gap-2 text-[12px] text-white/85">
            <span className="mt-0.5 text-[#22c55e]">✓</span>
            {strong
              ? "Clear communication with solid interview structure"
              : "Priority: use STAR stories and more specific examples"}
          </p>
        </section>

        {feedback?.areas && (
          <section className="rounded-2xl bg-white px-3.5 py-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#0a1628]">Score breakdown</h2>
            <ul className="mt-3 space-y-3">
              {(
                [
                  ["Communication", feedback.areas.communication],
                  ["Content", feedback.areas.content],
                  ["Confidence", feedback.areas.confidence],
                ] as const
              ).map(([label, value]) => (
                <li key={label}>
                  <div className="flex items-baseline justify-between text-[13px]">
                    <span className="font-medium text-[#0a1628]">{label}</span>
                    <span className="font-bold text-[#e85d04]">{value}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#e8ebef]">
                    <div
                      className="h-full rounded-full bg-[#e85d04]"
                      style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {feedback?.improvements && feedback.improvements.length > 0 && (
          <section className="rounded-2xl bg-white px-3.5 py-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#0a1628]">
              {strong ? "Polish tips" : "Where to fix"}
            </h2>
            <ul className="mt-3 space-y-2.5">
              {feedback.improvements.map((fix, i) => (
                <li
                  key={fix}
                  className="flex gap-2.5 text-[13px] text-[#2d3136]"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e85d04]/15 text-[11px] font-bold text-[#e85d04]">
                    {i + 1}
                  </span>
                  {fix}
                </li>
              ))}
            </ul>
          </section>
        )}

        {feedback?.strengths &&
          feedback.strengths.length > 0 &&
          !strong && (
            <section className="rounded-2xl bg-white px-3.5 py-4 shadow-sm">
              <h2 className="text-sm font-bold text-[#0a1628]">Strengths</h2>
              <ul className="mt-3 space-y-2">
                {feedback.strengths.map((s) => (
                  <li
                    key={s}
                    className="flex gap-2 text-[13px] leading-snug text-[#2d3136]"
                  >
                    <span className="mt-0.5 text-[#22c55e]">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

        <div className="rounded-2xl bg-[#0a1628] px-3.5 py-3 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/55">
            Creative CV · Interview Prep
          </p>
          <p className="mt-1 text-xs text-white/80">group-of-recruiters.vercel.app</p>
        </div>
      </div>

      <div data-share-ignore="true" className="space-y-3 bg-[#eef1f4] px-3 pb-6 pt-3">
        {session.transcript && session.transcript.length > 0 && (
          <section className="rounded-2xl bg-white px-3.5 py-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#0a1628]">Transcript</h2>
            <ul className="mt-3 max-h-64 space-y-2.5 overflow-y-auto text-[12px]">
              {session.transcript.map((t, i) => (
                <li key={`${t.timestamp}-${i}`} className="leading-snug">
                  <span
                    className={
                      t.speaker === "user"
                        ? "font-semibold text-[#e85d04]"
                        : "font-semibold text-[#5c6570]"
                    }
                  >
                    {t.speaker === "user" ? "You" : host}:
                  </span>{" "}
                  <span className="text-[#2d3136]">{t.text}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {shareNote && (
          <p className="rounded-xl border border-[#e85d04]/30 bg-[#fff4eb] px-3.5 py-3 text-[13px] text-[#c44d03]">
            {shareNote}
          </p>
        )}

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={() => void shareScorePicture()}
            disabled={sharing}
            className="w-full rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {sharing ? "Preparing score picture…" : "Share score picture"}
          </button>
          <Link
            href="/interviews"
            className="w-full rounded-full bg-[#e85d04] py-3 text-center text-sm font-semibold text-white"
          >
            Book another interview
          </Link>
          <Link
            href="/prep"
            className="w-full rounded-full border border-[#0a1628]/15 bg-white py-3 text-center text-sm font-semibold text-[#0a1628]"
          >
            Open prep guide
          </Link>
        </div>
      </div>
    </div>
  );
}
