"use client";

import { experimental_useRealtime as useRealtime } from "@ai-sdk/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createGatewayBrowserRealtimeModel } from "@/lib/realtime/gateway-browser-model";
import {
  normalizeDurationMinutes,
  type InterviewSession,
  type TranscriptTurn,
} from "@/lib/types";
import {
  VOICE_BY_GENDER,
  buildInterviewResumeBrief,
  interviewerInstructions,
  interviewerName,
} from "@/lib/voices";

/** Reconnect before AI Gateway's ~25 minute hard session limit. */
const GATEWAY_RECONNECT_AFTER_MS = 20 * 60 * 1000;

type Phase =
  | "idle"
  | "connecting"
  | "live"
  | "time_up"
  | "ending"
  | "error";

function formatCountdown(seconds: number) {
  const safe = Math.max(0, seconds);
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function messageText(
  message: { parts: Array<{ type: string; text?: string }> },
): string {
  return message.parts
    .filter((p) => p.type === "text" && p.text?.trim())
    .map((p) => p.text!.trim())
    .join(" ")
    .trim();
}

function messagesToTranscript(
  messages: { role: string; parts: Array<{ type: string; text?: string }> }[],
): TranscriptTurn[] {
  const turns: TranscriptTurn[] = [];
  for (const message of messages) {
    if (message.role !== "user" && message.role !== "assistant") continue;
    const text = messageText(message);
    if (!text) continue;
    turns.push({
      speaker: message.role === "user" ? "user" : "assistant",
      text,
      timestamp: new Date().toISOString(),
    });
  }
  return turns;
}

export function InterviewRoom({ session }: { session: InterviewSession }) {
  const router = useRouter();
  const durationMinutes = normalizeDurationMinutes(session.duration_minutes);
  const totalSeconds = durationMinutes * 60;

  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [remaining, setRemaining] = useState(totalSeconds);
  const [liveQuestion, setLiveQuestion] = useState("");
  const [liveAnswer, setLiveAnswer] = useState("");
  const [resultsReady, setResultsReady] = useState(false);
  const [resumeBrief, setResumeBrief] = useState<string | null>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const realtimeRef = useRef<ReturnType<typeof useRealtime> | null>(null);
  const endingRef = useRef(false);
  const assistantBufRef = useRef("");
  const remainingRef = useRef(totalSeconds);
  const connectedAtRef = useRef(0);
  const reconnectingRef = useRef(false);
  const pendingReconnectRef = useRef(false);
  const phaseRef = useRef<Phase>("idle");
  const finishRef = useRef<(opts?: { timedOut?: boolean }) => Promise<void>>(
    async () => {},
  );
  const hostName = interviewerName(session.voice_gender);

  remainingRef.current = remaining;
  phaseRef.current = phase;

  const model = useMemo(() => createGatewayBrowserRealtimeModel(), []);
  const voice = VOICE_BY_GENDER[session.voice_gender] ?? VOICE_BY_GENDER.female;
  const instructions = useMemo(
    () =>
      interviewerInstructions({
        candidateName: session.candidate_name,
        roleTitle: session.role_title,
        fieldOfWork: session.field_of_work,
        location: session.location,
        durationMinutes,
        voiceGender: session.voice_gender,
        resumeBrief,
      }),
    [
      session.candidate_name,
      session.role_title,
      session.field_of_work,
      session.location,
      session.voice_gender,
      durationMinutes,
      resumeBrief,
    ],
  );
  const tokenApi = useMemo(
    () => ({
      token: `/api/realtime/session?sessionId=${encodeURIComponent(session.id)}`,
    }),
    [session.id],
  );
  const sessionConfig = useMemo(
    () => ({
      instructions,
      voice,
      inputAudioTranscription: {},
      turnDetection: { type: "server-vad" as const },
      outputModalities: ["audio"] as Array<"audio" | "text">,
    }),
    [instructions, voice],
  );

  const finishInterview = useCallback(
    async (opts?: { timedOut?: boolean }) => {
      if (endingRef.current) return;
      endingRef.current = true;

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      const rt = realtimeRef.current;
      const turns = messagesToTranscript(rt?.messages ?? []);
      rt?.stopAudioCapture();
      rt?.disconnect();
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;

      setPhase(opts?.timedOut ? "time_up" : "ending");
      setResultsReady(false);

      try {
        const res = await fetch(`/api/interviews/${session.id}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: turns }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to save results");
        }

        if (opts?.timedOut) {
          setResultsReady(true);
        } else {
          router.push(`/results/${session.id}`);
        }
      } catch (err) {
        endingRef.current = false;
        setPhase("error");
        setError(err instanceof Error ? err.message : "Failed to end interview");
      }
    },
    [router, session.id],
  );
  finishRef.current = finishInterview;

  const scheduleReconnect = useCallback(() => {
    if (endingRef.current || reconnectingRef.current) return;
    if (remainingRef.current < 45) return;
    reconnectingRef.current = true;
    pendingReconnectRef.current = true;
    setIsReconnecting(true);
    const turns = messagesToTranscript(realtimeRef.current?.messages ?? []);
    setResumeBrief(buildInterviewResumeBrief(turns, remainingRef.current));
  }, []);

  const realtime = useRealtime({
    model,
    api: tokenApi,
    sessionConfig,
    onError: (err) => {
      if (
        !endingRef.current &&
        remainingRef.current > 45 &&
        phaseRef.current === "live"
      ) {
        scheduleReconnect();
        return;
      }
      setError(err.message);
      setPhase("error");
    },
    onEvent: (event) => {
      if (event.type === "speech-started") setListening(true);
      if (event.type === "speech-stopped") setListening(false);

      if (event.type === "audio-transcript-delta") {
        assistantBufRef.current += event.delta;
        setLiveQuestion(assistantBufRef.current.trim());
      }
      if (event.type === "audio-transcript-done") {
        const text = (event.transcript || assistantBufRef.current).trim();
        assistantBufRef.current = "";
        if (text) setLiveQuestion(text);
      }
      if (event.type === "response-created") {
        assistantBufRef.current = "";
      }
      if (event.type === "input-transcription-completed") {
        const text = event.transcript?.trim();
        if (text) setLiveAnswer(text);
      }
    },
  });
  realtimeRef.current = realtime;

  useEffect(() => {
    if (!pendingReconnectRef.current || !resumeBrief) return;
    pendingReconnectRef.current = false;

    void (async () => {
      try {
        const rt = realtimeRef.current;
        const stream = micStreamRef.current;
        rt?.stopAudioCapture();
        rt?.disconnect();
        await rt?.connect();
        if (stream) rt?.startAudioCapture(stream);
        rt?.requestResponse({ modalities: ["audio"] });
        connectedAtRef.current = Date.now();
        setPhase("live");
        setError(null);
      } catch (err) {
        setPhase("error");
        setError(
          err instanceof Error
            ? err.message
            : "Lost connection during the interview",
        );
      } finally {
        reconnectingRef.current = false;
        setIsReconnecting(false);
      }
    })();
  }, [resumeBrief]);

  const transcript = useMemo(
    () => messagesToTranscript(realtime.messages),
    [realtime.messages],
  );

  // Prefer finalized message text when available for current question / answer
  useEffect(() => {
    const lastAssistant = [...realtime.messages]
      .reverse()
      .find((m) => m.role === "assistant");
    const lastUser = [...realtime.messages]
      .reverse()
      .find((m) => m.role === "user");
    if (lastAssistant) {
      const text = messageText(lastAssistant);
      if (text) setLiveQuestion(text);
    }
    if (lastUser) {
      const text = messageText(lastUser);
      if (text) setLiveAnswer(text);
    }
  }, [realtime.messages]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      const rt = realtimeRef.current;
      rt?.stopAudioCapture();
      rt?.disconnect();
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    };
  }, []);

  async function startInterview() {
    setError(null);
    endingRef.current = false;
    setResumeBrief(null);
    setPhase("connecting");
    setLiveQuestion("");
    setLiveAnswer("");
    setRemaining(totalSeconds);

    try {
      const startRes = await fetch(`/api/interviews/${session.id}/start`, {
        method: "POST",
      });
      const startData = await startRes.json();
      if (!startRes.ok) {
        throw new Error(startData.error || "Could not start session");
      }

      if (typeof window !== "undefined" && !window.isSecureContext) {
        throw new Error(
          "Microphone requires HTTPS (or localhost). Open the app on a secure origin.",
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      micStreamRef.current = stream;

      await realtime.connect();
      realtime.startAudioCapture(stream);
      realtime.requestResponse({ modalities: ["audio"] });

      setPhase("live");
      connectedAtRef.current = Date.now();
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (
          !endingRef.current &&
          !reconnectingRef.current &&
          connectedAtRef.current > 0 &&
          Date.now() - connectedAtRef.current >= GATEWAY_RECONNECT_AFTER_MS &&
          remainingRef.current > 45
        ) {
          scheduleReconnect();
        }

        setRemaining((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            queueMicrotask(() => {
              void finishRef.current({ timedOut: true });
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      realtime.disconnect();
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
      setPhase("error");
      const message =
        err instanceof Error ? err.message : "Failed to connect";
      setError(
        message.includes("Failed to fetch realtime setup")
          ? "AI_GATEWAY_API_KEY is not configured. Add it to .env.local to enable live voice."
          : message,
      );
    }
  }

  const statusListening =
    listening || (realtime.isCapturing && !realtime.isPlaying);

  if (phase === "time_up") {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-16 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-mist">
          {session.candidate_name || session.role_title}
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-ink md:text-4xl">
          Your time is up
        </h1>
        <p className="mt-4 max-w-md text-mist">
          You can book again if you need more practice time.{" "}
          {resultsReady
            ? "Your results are ready with a performance score and where to fix."
            : "Saving your transcript and preparing your score…"}
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/interviews"
            className="rounded-full bg-teal px-8 py-3.5 text-base font-semibold text-navy transition hover:bg-foam"
          >
            Book again
          </Link>
          {resultsReady ? (
            <Link
              href={`/results/${session.id}`}
              className="rounded-full border border-white/20 px-8 py-3.5 text-base font-medium text-ink transition hover:border-teal/50"
            >
              See results
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="rounded-full bg-white/10 px-8 py-3.5 text-base font-semibold text-mist"
            >
              Preparing results…
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-10">
      <p className="text-sm uppercase tracking-[0.2em] text-mist">
        {session.candidate_name || "Candidate"}
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-ink">
        Live interview
      </h1>
      <p className="mt-2 text-sm text-mist">
        with {hostName} · {session.role_title}
        {session.field_of_work ? ` · ${session.field_of_work}` : ""} ·{" "}
        {durationMinutes} min
      </p>

      <div className="relative mt-10 flex h-28 w-28 items-center justify-center">
        {(phase === "live" || phase === "connecting") && (
          <div
            className={`absolute inset-0 rounded-full ${statusListening ? "cw-pulse-ring" : ""}`}
          />
        )}
        <div
          className={`flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 transition ${
            phase === "live"
              ? remaining <= 60
                ? "border-danger/70 bg-white"
                : statusListening
                  ? "border-teal bg-white"
                  : "border-teal/50 bg-white"
              : "border-white/20 bg-white"
          }`}
        >
          {phase === "live" || phase === "ending" ? (
            <span className="font-[family-name:var(--font-display)] text-xl tabular-nums text-navy-mid">
              {formatCountdown(remaining)}
            </span>
          ) : (
            <Image
              src="/creative-cv-icon.png"
              alt="Creative CV"
              width={96}
              height={96}
              className="h-full w-full object-cover"
              priority
            />
          )}
        </div>
      </div>

      <p className="mt-4 min-h-6 max-w-md text-center text-sm text-mist">
        {phase === "idle" &&
          "Tap start when you are ready. Allow microphone access when prompted."}
        {phase === "connecting" && `Connecting to ${hostName}…`}
        {phase === "live" &&
          (isReconnecting
            ? "Reconnecting so you can finish your full time…"
            : statusListening
              ? "Listening to you…"
              : `${hostName} is speaking or waiting for you…`)}
        {phase === "ending" && "Saving transcript and generating feedback…"}
        {phase === "error" && (error || "Something went wrong")}
      </p>

      {(phase === "live" || phase === "connecting" || liveQuestion) && (
        <section className="mt-10 w-full">
          <p className="text-xs font-semibold uppercase tracking-wider text-mist">
            Current question
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-xl leading-snug text-ink md:text-2xl">
            {liveQuestion ||
              (phase === "connecting" || phase === "live"
                ? "Waiting for the interviewer…"
                : "—")}
          </p>
        </section>
      )}

      {(phase === "live" || liveAnswer) && (
        <section className="mt-8 w-full rounded-2xl border border-white/10 bg-navy-mid/60 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal">
            Your answer (live)
          </p>
          <p className="mt-2 min-h-12 text-base leading-relaxed text-ink/90">
            {liveAnswer ||
              (statusListening
                ? "Speak clearly — your words will appear here…"
                : "Waiting for your reply…")}
          </p>
        </section>
      )}

      {error && phase !== "error" && (
        <p className="mt-2 text-sm text-danger">{error}</p>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {phase === "idle" || phase === "error" ? (
          <button
            type="button"
            onClick={startInterview}
            className="rounded-full bg-teal px-8 py-3.5 text-base font-semibold text-navy transition hover:bg-foam"
          >
            {phase === "error" ? "Try again" : "Start interview"}
          </button>
        ) : null}
        {phase === "live" && (
          <button
            type="button"
            onClick={() => void finishInterview()}
            className="rounded-full bg-danger/90 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-danger"
          >
            End interview
          </button>
        )}
        {phase === "connecting" || phase === "ending" ? (
          <button
            type="button"
            disabled
            className="rounded-full bg-white/10 px-8 py-3.5 text-base font-semibold text-mist"
          >
            Please wait…
          </button>
        ) : null}
      </div>

      {transcript.length > 0 && (
        <div className="mt-14 w-full border-t border-white/10 pt-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-mist">
            Full transcript
          </h2>
          <ul className="max-h-64 space-y-3 overflow-y-auto text-sm">
            {transcript.map((t, i) => (
              <li key={`${t.speaker}-${i}-${t.text.slice(0, 24)}`}>
                <span
                  className={
                    t.speaker === "user" ? "text-teal" : "text-mist"
                  }
                >
                  {t.speaker === "user" ? "You" : "Interviewer"}:
                </span>{" "}
                <span className="text-ink/90">{t.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
