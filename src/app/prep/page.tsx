import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import {
  PREP_QUESTIONS,
  PREP_TIPS,
  type PrepQuestion,
} from "@/lib/prep-questions";

function QuestionCard({ q }: { q: PrepQuestion }) {
  return (
    <article className="border-t border-white/10 py-8">
      <h2 className="font-[family-name:var(--font-display)] text-xl text-ink">
        {q.prompt}
      </h2>
      <p className="mt-2 text-sm text-mist">
        <span className="text-teal">What they want:</span> {q.whatTheyWant}
      </p>
      {q.example && (
        <blockquote className="mt-4 border-l-2 border-teal/40 pl-4 text-sm leading-relaxed text-ink/85 italic">
          {q.example}
        </blockquote>
      )}
    </article>
  );
}

export default function PrepPage() {
  const core = PREP_QUESTIONS.filter((q) => q.category === "core");
  const logistics = PREP_QUESTIONS.filter((q) => q.category === "logistics");
  const bonus = PREP_QUESTIONS.filter((q) => q.category === "bonus");

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,#1c1e21,#121416_60%)]">
      <AppNav variant="app" />
      <main className="mx-auto max-w-3xl px-6 py-10 md:px-10">
        <p className="text-sm uppercase tracking-[0.2em] text-mist">Prep</p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-ink md:text-4xl">
          Interview prep guide
        </h1>
        <p className="mt-4 max-w-2xl text-mist">
          If you can confidently answer these questions, you&apos;ll be well
          prepared for most job interviews. Recruiters use them to assess your
          experience, skills, attitude, and fit.
        </p>

        <div className="mt-8">
          <Link
            href="/interviews"
            className="inline-flex rounded-full bg-teal px-6 py-3 text-sm font-semibold text-navy transition hover:bg-foam"
          >
            Practice out loud
          </Link>
        </div>

        <section className="mt-14">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink">
            Core questions
          </h2>
          <div className="mt-2">
            {core.map((q) => (
              <QuestionCard key={q.id} q={q} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink">
            Logistics
          </h2>
          <div className="mt-2">
            {logistics.map((q) => (
              <QuestionCard key={q.id} q={q} />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink">
            Bonus themes
          </h2>
          <p className="mt-2 text-sm text-mist">
            Employers often ask these too — prepare a STAR example for each.
          </p>
          <div className="mt-2">
            {bonus.map((q) => (
              <QuestionCard key={q.id} q={q} />
            ))}
          </div>
        </section>

        <section className="mt-14 border-t border-white/10 pt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink">
            Final tips
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-mist">
            {PREP_TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
          <p className="mt-6 text-mist">
            Mastering these questions, preparing STAR examples, and researching
            each employer beforehand will put you ahead of many candidates.
          </p>
        </section>
      </main>
    </div>
  );
}
