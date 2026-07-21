"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { WORK_FIELDS, isValidPhoneNumber } from "@/lib/candidate";
import {
  INTERVIEW_DURATIONS,
  type InterviewDurationMinutes,
  type VoiceGender,
} from "@/lib/types";

const DURATION_LABELS: Record<InterviewDurationMinutes, string> = {
  15: "15 min",
  30: "30 min",
  60: "1 hour",
};

const inputClass =
  "w-full rounded-lg border border-white/10 bg-navy-mid px-3 py-2 text-sm text-ink outline-none transition placeholder:text-mist/50 focus:border-teal/60";

export function StartInterviewForm() {
  const router = useRouter();
  const [voiceGender, setVoiceGender] = useState<VoiceGender>("female");
  const [durationMinutes, setDurationMinutes] =
    useState<InterviewDurationMinutes>(30);
  const [candidateName, setCandidateName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [fieldOfWork, setFieldOfWork] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (candidateName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!fieldOfWork.trim()) {
      setError("Please select your field of work.");
      return;
    }
    if (!location.trim()) {
      setError("Please enter your location.");
      return;
    }
    if (!isValidPhoneNumber(phoneNumber)) {
      setError("Enter a valid phone number (7–15 digits).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startNow: true,
          voiceGender,
          candidateName,
          roleTitle,
          fieldOfWork,
          location,
          phoneNumber,
          durationMinutes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start interview");
      }
      router.push(`/interview/${data.session.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto grid w-full max-w-3xl gap-3 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-teal">
          Candidate details
        </p>
      </div>

      <div>
        <label htmlFor="name" className="mb-1 block text-xs font-medium text-mist">
          Full name
        </label>
        <input
          id="name"
          required
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
          placeholder="e.g. Thabo Molefe"
          className={inputClass}
          autoComplete="name"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-xs font-medium text-mist">
          Phone number
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="e.g. +27 82 123 4567"
          className={inputClass}
          autoComplete="tel"
        />
      </div>

      <div>
        <label htmlFor="field" className="mb-1 block text-xs font-medium text-mist">
          Field of work
        </label>
        <select
          id="field"
          required
          value={fieldOfWork}
          onChange={(e) => setFieldOfWork(e.target.value)}
          className={inputClass}
        >
          <option value="" disabled>
            Select field
          </option>
          {WORK_FIELDS.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="role" className="mb-1 block text-xs font-medium text-mist">
          Target role
        </label>
        <input
          id="role"
          required
          value={roleTitle}
          onChange={(e) => setRoleTitle(e.target.value)}
          placeholder="e.g. Frontend Developer"
          className={inputClass}
        />
      </div>

      <div className="sm:col-span-2">
        <label
          htmlFor="location"
          className="mb-1 block text-xs font-medium text-mist"
        >
          Location
        </label>
        <input
          id="location"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Johannesburg, South Africa"
          className={inputClass}
          autoComplete="address-level2"
        />
      </div>

      <fieldset className="sm:col-span-2">
        <legend className="mb-1.5 text-xs font-medium text-mist">
          Interview length
        </legend>
        <div className="grid grid-cols-3 gap-2">
          {INTERVIEW_DURATIONS.map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => setDurationMinutes(mins)}
              className={`rounded-lg border px-2 py-2.5 text-sm font-semibold transition ${
                durationMinutes === mins
                  ? "border-teal bg-teal/15 text-ink"
                  : "border-white/10 bg-navy-mid text-mist hover:border-white/25"
              }`}
            >
              {DURATION_LABELS[mins]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="sm:col-span-2">
        <legend className="mb-1.5 text-xs font-medium text-mist">
          Interviewer
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: "female", label: "Sasha", hint: "Female interviewer" },
              { value: "male", label: "Clemence Mayer", hint: "Male interviewer" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setVoiceGender(opt.value)}
              className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                voiceGender === opt.value
                  ? "border-teal bg-teal/15 text-ink"
                  : "border-white/10 bg-navy-mid text-mist hover:border-white/25"
              }`}
            >
              <span className="font-semibold">{opt.label}</span>
              <span className="mt-0.5 block text-xs opacity-80">{opt.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {error && (
        <p className="sm:col-span-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="sm:col-span-2 w-full rounded-full bg-teal py-3 text-sm font-semibold text-navy transition hover:bg-foam disabled:opacity-60"
      >
        {loading ? "Starting…" : "Start interview"}
      </button>
    </form>
  );
}
