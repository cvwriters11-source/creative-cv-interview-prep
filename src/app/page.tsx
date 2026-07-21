import Image from "next/image";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";

const STEPS = [
  {
    title: "Your details",
    body: "Name, field, role, location, phone.",
  },
  {
    title: "Live practice",
    body: "15, 30, or 60 min — questions on screen.",
  },
  {
    title: "Your score",
    body: "Performance % and where to fix.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="relative flex h-dvh max-h-dvh flex-col overflow-hidden bg-navy text-ink">
      <div className="absolute inset-0">
        <Image
          src="/creative-cv-hero.jpg"
          alt=""
          fill
          priority
          className="object-cover object-[70%_center] sm:object-center"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(105deg,rgba(10,12,14,0.97)_0%,rgba(10,12,14,0.94)_38%,rgba(10,12,14,0.82)_68%,rgba(10,12,14,0.72)_100%)]"
        />
        <div
          aria-hidden
          className="cw-hero-glow absolute inset-0 bg-[radial-gradient(ellipse_at_80%_35%,rgba(244,140,6,0.12),transparent_55%)]"
        />
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <AppNav variant="landing" />

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-between px-6 py-4 md:px-10 md:py-6">
          <div className="cw-rise flex flex-1 flex-col justify-center">
            <p className="cw-rise-delay text-sm font-bold uppercase tracking-[0.18em] text-teal sm:text-base">
              Interview Prep
            </p>
            <h1 className="cw-rise-delay mt-3 max-w-xl font-[family-name:var(--font-display)] text-2xl font-semibold leading-snug text-white sm:text-3xl md:text-4xl">
              Practice real interviews out loud — and walk in ready.
            </h1>
            <p className="cw-rise-delay mt-4 max-w-lg text-base font-medium leading-relaxed text-ink/90 sm:text-lg">
              Timed voice interviews with on-screen questions, live transcripts,
              and a clear score under your name.
            </p>

            <div className="cw-rise-delay mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="rounded-full bg-teal px-7 py-3.5 text-base font-bold text-navy shadow-[0_0_40px_rgba(232,93,4,0.3)] transition hover:bg-foam"
              >
                Register to start
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-white/35 px-5 py-3.5 text-base font-semibold text-white transition hover:border-teal/50 hover:text-teal"
              >
                Sign in
              </Link>
            </div>
          </div>

          <ol className="cw-rise-delay grid shrink-0 grid-cols-1 gap-4 border-t border-white/15 pb-2 pt-5 sm:grid-cols-3 sm:gap-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className="min-w-0">
                <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-teal">
                  {String(i + 1).padStart(2, "0")} · {step.title}
                </p>
                <p className="mt-1.5 text-sm font-medium leading-snug text-ink/85 sm:text-base">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </main>
      </div>
    </div>
  );
}
