import Image from "next/image";
import Link from "next/link";
import { AppNav } from "@/components/AppNav";

const VALUES = [
  {
    title: "Connecting talent",
    body: "We help candidates present their strengths clearly so the right employers can see them.",
  },
  {
    title: "Creating opportunities",
    body: "From CV craft to interview practice, we close the gap between who you are and how you show up.",
  },
  {
    title: "Building futures",
    body: "Every session is practice for the career you want — confidence that compounds over time.",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,#1c1e21,#121416_60%)]">
      <AppNav variant="app" />
      <main className="mx-auto max-w-3xl px-6 py-10 md:px-10">
        <p className="text-sm uppercase tracking-[0.2em] text-mist">About</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-ink md:text-4xl">
          Creative CV
        </h1>
        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-teal">
          Group of Recruiters
        </p>

        <div className="mt-8 inline-flex rounded-xl bg-white px-4 py-3 shadow-sm">
          <Image
            src="/creative-cv-logo.png"
            alt="Creative CV — Group of Recruiters"
            width={260}
            height={68}
            className="h-12 w-auto"
          />
        </div>

        <p className="mt-8 text-mist leading-relaxed">
          Creative CV is built for people who want to compete with confidence.
          We combine professional recruitment insight with practical tools —
          including this interview prep experience — so candidates can practise
          real conversations, get scored feedback, and walk into interviews
          ready.
        </p>

        <section className="mt-14 space-y-10">
          {VALUES.map((value) => (
            <div key={value.title} className="border-t border-white/10 pt-8">
              <h2 className="font-[family-name:var(--font-display)] text-xl text-ink">
                {value.title}
              </h2>
              <p className="mt-3 text-mist leading-relaxed">{value.body}</p>
            </div>
          ))}
        </section>

        <div className="mt-14 flex flex-wrap gap-3 border-t border-white/10 pt-10">
          <Link
            href="/interviews"
            className="rounded-full bg-teal px-6 py-3 text-sm font-semibold text-navy transition hover:bg-foam"
          >
            Start interview
          </Link>
          <Link
            href="/career-development"
            className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-ink transition hover:border-teal/50"
          >
            Career development
          </Link>
        </div>
      </main>
    </div>
  );
}
