"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ApplyScope, AtsReport, CvSource } from "@/lib/ats-types";

function emitAtsResults(showing: boolean) {
  window.dispatchEvent(
    new CustomEvent("ats-results", { detail: showing }),
  );
}

const SOURCES: { value: CvSource; label: string; hint: string }[] = [
  {
    value: "creative-cv",
    label: "Creative CV",
    hint: "Built with Creative CV templates",
  },
  {
    value: "yourself",
    label: "I did it myself",
    hint: "You designed or wrote it on your own",
  },
  {
    value: "someone-else",
    label: "Someone else did it",
    hint: "A friend, agency, or other writer",
  },
];

const APPLY_SCOPES: { value: ApplyScope; label: string; hint: string }[] = [
  {
    value: "local",
    label: "Locally",
    hint: "Jobs in your country / domestic market",
  },
  {
    value: "international",
    label: "Internationally",
    hint: "Roles abroad or global remote employers",
  },
];

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
  const filled = score >= 90 ? 5 : score >= 80 ? 4 : score >= 60 ? 3 : score >= 45 ? 2 : 1;
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

function AtsResultsView({
  report,
  onBack,
}: {
  report: AtsReport;
  onBack: () => void;
}) {
  // Verified only when claimed Creative CV AND content actually scores high
  const verified = report.source === "creative-cv" && report.score >= 80;
  const applyLabel =
    report.applyScope === "international" ? "International" : "Local";
  const shareText = [
    `Creative CV ATS Analysis`,
    `${report.candidateName}: ${report.score}/100 (${report.ratingLabel})`,
    `Applying: ${applyLabel}`,
    verified ? "Creative-CV Verified" : "Needs ATS improvements",
    report.summary,
  ].join("\n");

  function shareWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div id="ats-results-root" className="mx-auto w-full max-w-[420px]">
      {/* Phone-style chrome for screenshots */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 rounded-t-2xl bg-[#0a1628] px-3 py-3 text-white">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-sm font-medium text-white/90"
        >
          <span aria-hidden>←</span> Back
        </button>
        <p className="text-sm font-semibold">Analysis Results</p>
        <button
          type="button"
          onClick={shareWhatsApp}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white"
        >
          <span aria-hidden>↗</span> Share
        </button>
      </div>

      <div className="space-y-3 rounded-b-2xl bg-[#eef1f4] px-3 pb-6 pt-3">
        {verified ? (
          <div className="flex items-start gap-3 rounded-2xl border border-[#e85d04]/35 bg-[#fff4eb] px-3.5 py-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e85d04] text-sm font-bold text-white">
              ✓
            </span>
            <div>
              <p className="text-sm font-bold text-[#e85d04]">
                Creative-CV Verified
              </p>
              <p className="mt-0.5 text-xs leading-snug text-[#c44d03]">
                Your professionally written CV passes major ATS checks!
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-50 px-3.5 py-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">
              !
            </span>
            <div>
              <p className="text-sm font-bold text-amber-800">ATS risk detected</p>
              <p className="mt-0.5 text-xs leading-snug text-amber-700">
                Rebuild on Creative CV to lift your score into the 80–95% range.
              </p>
            </div>
          </div>
        )}

        {/* Score + strengths card */}
        <section className="overflow-hidden rounded-2xl bg-[#0a1628] text-white shadow-lg">
          <div className="flex items-center gap-2 bg-[#132238] px-3.5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white/80">
            <span
              className="inline-block h-3.5 w-3 shrink-0 rounded-sm bg-[#e85d04]"
              aria-hidden
            />
            <span className="truncate">
              CV FOR: {report.candidateName} · {applyLabel}
            </span>
          </div>
          <div className="flex gap-4 px-3.5 py-4">
            <div className="flex flex-col items-center gap-1.5">
              <ScoreRing score={report.score} />
              <Stars score={report.score} />
              <p className="text-sm font-semibold">{report.ratingLabel}</p>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/55">
                {verified ? "Your strengths" : "Focus areas"}
              </p>
              <ul className="mt-2 space-y-2">
                {(verified ? report.strengths : report.topFixes.slice(0, 5)).map(
                  (item) => (
                    <li key={item} className="flex gap-2 text-[12px] leading-snug">
                      <span
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                          verified
                            ? "bg-[#22c55e] text-white"
                            : "bg-[#e85d04] text-white"
                        }`}
                      >
                        {verified ? "✓" : "!"}
                      </span>
                      <span className="text-white/90">{item}</span>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* Advisor assessment */}
        <section className="rounded-2xl bg-[#0a1628] px-3.5 py-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e85d04] text-sm font-bold">
              CV
            </span>
            <div>
              <p className="text-sm font-bold">Creative CV · Advisor</p>
              <p className="text-[11px] text-white/55">
                Creative-CV Professional Assessment
              </p>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-white/90">
            {report.summary}
          </p>
          <p className="mt-3 flex items-start gap-2 text-[12px] text-white/85">
            <span className="mt-0.5 text-[#22c55e]">✓</span>
            {verified
              ? "Professionally structured with clear sections"
              : "Priority: move to a Creative CV ATS-ready template"}
          </p>
        </section>

        {/* Priority fixes */}
        <section className="rounded-2xl bg-white px-3.5 py-4 shadow-sm">
          <h2 className="text-sm font-bold text-[#0a1628]">
            {verified ? "Polish tips" : "Priority fixes"}
          </h2>
          <ul className="mt-3 space-y-2.5">
            {report.topFixes.map((fix, i) => (
              <li key={fix} className="flex gap-2.5 text-[13px] text-[#2d3136]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e85d04]/15 text-[11px] font-bold text-[#e85d04]">
                  {i + 1}
                </span>
                {fix}
              </li>
            ))}
          </ul>
        </section>

        {/* Area cards */}
        {(
          [
            ["Wording", report.areas.wording],
            ["Formatting", report.areas.formatting],
            ["Keywording", report.areas.keywording],
          ] as const
        ).map(([label, area]) => (
          <section
            key={label}
            className="rounded-2xl bg-white px-3.5 py-4 shadow-sm"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-bold text-[#0a1628]">{label}</h2>
              <span className="text-sm font-bold text-[#e85d04]">
                {area.score}%
              </span>
            </div>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-[#5c6570]">
              What to fix
            </p>
            <ul className="mt-1.5 space-y-1.5">
              {area.fixes.map((f) => (
                <li key={f} className="text-[12px] leading-snug text-[#2d3136]">
                  • {f}
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="flex flex-col gap-2 pt-1">
          <button
            type="button"
            onClick={shareWhatsApp}
            className="w-full rounded-full bg-[#25D366] py-3 text-sm font-semibold text-white"
          >
            Share results on WhatsApp
          </button>
          <button
            type="button"
            onClick={onBack}
            className="w-full rounded-full border border-[#0a1628]/15 bg-white py-3 text-sm font-semibold text-[#0a1628]"
          >
            Test another CV
          </button>
          <Link
            href="/interviews"
            className="w-full rounded-full bg-[#e85d04] py-3 text-center text-sm font-semibold text-white"
          >
            Practice interview next
          </Link>
        </div>
      </div>
    </div>
  );
}

export function AtsChecker() {
  const [file, setFile] = useState<File | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [source, setSource] = useState<CvSource | "">("");
  const [applyScope, setApplyScope] = useState<ApplyScope | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<AtsReport | null>(null);

  useEffect(() => {
    emitAtsResults(Boolean(report));
    return () => emitAtsResults(false);
  }, [report]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Upload your CV first.");
      return;
    }
    if (!applyScope) {
      setError("Tell us if you are applying locally or internationally.");
      return;
    }
    if (!source) {
      setError("Tell us who created this CV.");
      return;
    }

    setLoading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("source", source);
      body.set("applyScope", applyScope);
      if (candidateName.trim()) body.set("candidateName", candidateName.trim());
      const res = await fetch("/api/ats/analyze", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setReport(data.report as AtsReport);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (report) {
    return (
      <AtsResultsView
        report={report}
        onBack={() => {
          setReport(null);
          setFile(null);
          setSource("");
          setApplyScope("");
        }}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-3xl space-y-8">
      <div>
        <label
          htmlFor="ats-name"
          className="mb-2 block text-sm font-medium text-mist"
        >
          Candidate name
        </label>
        <input
          id="ats-name"
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
          placeholder="e.g. Samuel Parirenyatwa"
          className="w-full rounded-xl border border-white/10 bg-navy-mid px-4 py-3 text-sm text-ink outline-none transition placeholder:text-mist/50 hover:border-white/25 focus:border-teal focus:ring-2 focus:ring-teal/25"
        />
      </div>

      <div>
        <label
          htmlFor="ats-file"
          className="mb-2 block text-sm font-medium text-mist"
        >
          Upload your CV
        </label>
        <label
          htmlFor="ats-file"
          className={`group flex cursor-pointer items-center gap-4 rounded-xl border border-dashed px-4 py-4 transition duration-200 ${
            file
              ? "border-teal/50 bg-teal/10"
              : "border-white/15 bg-navy-mid hover:border-teal/60 hover:bg-teal/5"
          }`}
        >
          <span className="inline-flex shrink-0 items-center rounded-full bg-teal px-4 py-2 text-sm font-semibold text-navy shadow-sm transition duration-200 group-hover:bg-foam group-hover:shadow-[0_0_20px_rgba(232,93,4,0.35)] group-active:scale-[0.98]">
            Choose file
          </span>
          <span className="min-w-0 truncate text-sm text-mist transition group-hover:text-ink">
            {file
              ? `${file.name} · ${Math.round(file.size / 1024)} KB`
              : "PDF, DOC, DOCX, or TXT"}
          </span>
          <input
            id="ats-file"
            type="file"
            accept=".pdf,.doc,.docx,.txt,application/pdf,text/plain"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="sr-only"
          />
        </label>
      </div>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-mist">
          Are you applying locally or internationally?
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {APPLY_SCOPES.map((opt) => {
            const selected = applyScope === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setApplyScope(opt.value)}
                className={`group relative rounded-xl border px-4 py-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] active:translate-y-0 ${
                  selected
                    ? "border-teal bg-teal/15 text-ink shadow-[0_0_0_1px_rgba(232,93,4,0.4)]"
                    : "border-white/10 bg-navy-mid text-mist hover:border-teal/45 hover:bg-white/[0.04] hover:text-ink"
                }`}
              >
                <span
                  className={`mb-2 block h-1 w-8 rounded-full transition duration-200 ${
                    selected
                      ? "bg-teal"
                      : "bg-white/15 group-hover:bg-teal/70"
                  }`}
                />
                <span className="block font-semibold">{opt.label}</span>
                <span className="mt-1 block text-xs opacity-70 group-hover:opacity-90">
                  {opt.hint}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-mist">
          How was this CV created?
        </legend>
        <p className="mb-3 text-xs text-mist/80">
          Your ATS score is based on the CV file itself — changing this answer
          will not raise or lower the score.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {SOURCES.map((opt) => {
            const selected = source === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSource(opt.value)}
                className={`group relative rounded-xl border px-4 py-4 text-left transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)] active:translate-y-0 ${
                  selected
                    ? "border-teal bg-teal/15 text-ink shadow-[0_0_0_1px_rgba(232,93,4,0.4)]"
                    : "border-white/10 bg-navy-mid text-mist hover:border-teal/45 hover:bg-white/[0.04] hover:text-ink"
                }`}
              >
                <span
                  className={`mb-2 block h-1 w-8 rounded-full transition duration-200 ${
                    selected
                      ? "bg-teal"
                      : "bg-white/15 group-hover:bg-teal/70"
                  }`}
                />
                <span className="block font-semibold">{opt.label}</span>
                <span className="mt-1 block text-xs opacity-70 group-hover:opacity-90">
                  {opt.hint}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {error && (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-teal py-3.5 text-sm font-semibold text-navy shadow-[0_4px_16px_rgba(232,93,4,0.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-foam hover:shadow-[0_8px_28px_rgba(232,93,4,0.45)] active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {loading ? "Analysing for ATS…" : "Get ATS report"}
      </button>
    </form>
  );
}
