"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "register";

export function AuthForm({
  mode,
  nextPath = "/interviews",
}: {
  mode: Mode;
  nextPath?: string;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === "register") {
        if (password.length < 6) {
          throw new Error("Password must be at least 6 characters.");
        }
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() || undefined },
          },
        });
        if (signUpError) throw signUpError;

        if (data.user) {
          await fetch("/api/auth/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              event: "register",
              path: "/register",
              userId: data.user.id,
              email: data.user.email,
            }),
          });
        }

        if (!data.session) {
          setInfo(
            "Account created. Check your email to confirm, then sign in.",
          );
          return;
        }

        router.push(nextPath);
        router.refresh();
        return;
      }

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
      if (signInError) throw signInError;

      if (data.user) {
        await fetch("/api/auth/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "login",
            path: "/login",
            userId: data.user.id,
            email: data.user.email,
          }),
        });
      }

      router.push(nextPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-5">
      {mode === "register" && (
        <div>
          <label
            htmlFor="full-name"
            className="mb-2 block text-sm font-medium text-mist"
          >
            Full name
          </label>
          <input
            id="full-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            autoComplete="name"
            className="w-full rounded-xl border border-white/10 bg-navy-mid px-4 py-3 text-sm text-ink outline-none transition hover:border-white/25 focus:border-teal focus:ring-2 focus:ring-teal/25"
            placeholder="Your name"
          />
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-mist"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="w-full rounded-xl border border-white/10 bg-navy-mid px-4 py-3 text-sm text-ink outline-none transition hover:border-white/25 focus:border-teal focus:ring-2 focus:ring-teal/25"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-mist"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          className="w-full rounded-xl border border-white/10 bg-navy-mid px-4 py-3 text-sm text-ink outline-none transition hover:border-white/25 focus:border-teal focus:ring-2 focus:ring-teal/25"
          placeholder="At least 6 characters"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      {info && (
        <p className="rounded-xl border border-teal/40 bg-teal/10 px-4 py-3 text-sm text-foam">
          {info}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-teal py-3.5 text-sm font-bold text-navy shadow-[0_4px_16px_rgba(232,93,4,0.25)] transition hover:-translate-y-0.5 hover:bg-foam disabled:pointer-events-none disabled:opacity-60"
      >
        {loading
          ? mode === "register"
            ? "Creating account…"
            : "Signing in…"
          : mode === "register"
            ? "Create account"
            : "Sign in"}
      </button>

      <p className="text-center text-sm text-mist">
        {mode === "register" ? (
          <>
            Already have an account?{" "}
            <Link
              href={`/login?next=${encodeURIComponent(nextPath)}`}
              className="font-semibold text-teal hover:text-foam"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link
              href={`/register?next=${encodeURIComponent(nextPath)}`}
              className="font-semibold text-teal hover:text-foam"
            >
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
