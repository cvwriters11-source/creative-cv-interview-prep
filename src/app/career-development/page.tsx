import Link from "next/link";
import { AppNav } from "@/components/AppNav";

const PILLARS = [
  {
    title: "Clarify your direction",
    body: "Know the field and role you are aiming for. Write a short career goal you can say in under a minute — then build your CV and practice around it.",
  },
  {
    title: "Strengthen your CV",
    body: "Lead with results, not duties. Quantify impact where you can, match language to the job advert, and keep formatting clean and easy to scan.",
  },
  {
    title: "Practice out loud",
    body: "Reading answers silently is not enough. Timed voice practice builds confidence, pacing, and the ability to recover when a question surprises you.",
  },
  {
    title: "Build your network",
    body: "Stay visible: informational chats, alumni groups, and professional communities. Connecting talent and creating opportunities starts with relationships.",
  },
] as const;

export default function CareerDevelopmentPage() {
  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,#1c1e21,#121416_60%)]">
      <AppNav variant="app" />
      <main className="mx-auto max-w-3xl px-6 py-10 md:px-10">
        <p className="text-sm uppercase tracking-[0.2em] text-mist">
          Career Development
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-ink md:text-4xl">
          Grow with intention
        </h1>
        <p className="mt-4 max-w-2xl text-mist leading-relaxed">
          Creative CV helps candidates move from uncertainty to readiness —
          clearer goals, stronger applications, and interview skills you can
          trust under pressure.
        </p>

        <ol className="mt-12 space-y-10">
          {PILLARS.map((item, i) => (
            <li key={item.title} className="border-t border-white/10 pt-8">
              <p className="font-[family-name:var(--font-display)] text-lg text-teal">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-ink">
                {item.title}
              </h2>
              <p className="mt-3 text-mist leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex flex-wrap gap-3 border-t border-white/10 pt-10">
          <Link
            href="/ats"
            className="rounded-full bg-teal px-6 py-3 text-sm font-semibold text-navy transition hover:bg-foam"
          >
            Test Your CV for ATS
          </Link>
          <Link
            href="/interviews"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-ink transition hover:border-teal/50"
          >
            Book a practice interview
          </Link>
          <Link
            href="/prep"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-ink transition hover:border-teal/50"
          >
            Open prep guide
          </Link>
        </div>
      </main>
    </div>
  );
}
