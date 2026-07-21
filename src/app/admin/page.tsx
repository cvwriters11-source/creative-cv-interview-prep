import Link from "next/link";
import { AdminUsersTable } from "@/components/AdminUsersTable";
import { AppNav } from "@/components/AppNav";
import { requireAdmin } from "@/lib/admin";
import { loadAdminDashboard } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-navy-mid px-3 py-3 sm:px-4 sm:py-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-mist sm:text-xs">
        {label}
      </p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink sm:mt-2 sm:text-3xl">
        {value}
      </p>
    </div>
  );
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-white/10 bg-navy-mid px-4 py-5 text-sm text-mist">
      {message}
    </p>
  );
}

export default async function AdminPage() {
  const adminUser = await requireAdmin();
  const data = await loadAdminDashboard();

  return (
    <div className="min-h-dvh overflow-x-hidden bg-[radial-gradient(ellipse_at_top,#141618,#0a0c0e_60%)]">
      <AppNav variant="app" />
      <main className="mx-auto w-full max-w-6xl px-3 py-6 sm:px-4 sm:py-8 md:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal sm:text-sm">
              Admin
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink sm:mt-2 sm:text-3xl md:text-4xl">
              Users & results
            </h1>
            <p className="mt-2 break-all text-sm text-mist sm:max-w-2xl sm:break-normal">
              Signed in as {adminUser.email}
            </p>
          </div>
          <Link
            href="/interviews"
            className="inline-flex w-full items-center justify-center rounded-full border border-white/20 px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-teal/50 hover:text-teal sm:w-auto"
          >
            Back to app
          </Link>
        </div>

        <section className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <StatCard label="Users" value={data.stats.users} />
          <StatCard label="Registers" value={data.stats.registers} />
          <StatCard label="Logins" value={data.stats.logins} />
          <StatCard label="ATS checks" value={data.stats.atsChecks} />
          <StatCard
            label="Interviews done"
            value={data.stats.interviewsCompleted}
          />
          <StatCard
            label="Avg interview"
            value={
              data.stats.avgInterviewScore != null
                ? `${data.stats.avgInterviewScore}%`
                : "—"
            }
          />
          <StatCard
            label="Avg ATS"
            value={
              data.stats.avgAtsScore != null
                ? `${data.stats.avgAtsScore}%`
                : "—"
            }
          />
        </section>

        <section className="mt-8 sm:mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-ink sm:text-2xl">
            Registered users
          </h2>
          <div className="mt-3 sm:mt-4">
            <AdminUsersTable
              users={data.users}
              currentUserId={adminUser.id}
            />
          </div>
        </section>

        <section className="mt-8 sm:mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-ink sm:text-2xl">
            Recent activity
          </h2>
          <div className="mt-3 space-y-3 sm:mt-4">
            {data.visits.length === 0 ? (
              <EmptyBlock message="No activity logged yet." />
            ) : (
              data.visits.map((v) => (
                <article
                  key={v.id}
                  className="rounded-2xl border border-white/10 bg-navy-mid p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold capitalize text-ink">
                      {v.event}
                    </span>
                    <time className="text-xs text-mist">
                      {formatDate(v.created_at)}
                    </time>
                  </div>
                  <p className="mt-2 break-all text-sm text-ink">
                    {v.email || "—"}
                  </p>
                  {v.path && (
                    <p className="mt-1 break-all text-xs text-mist">{v.path}</p>
                  )}
                </article>
              ))
            )}
          </div>
        </section>

        <section className="mt-8 sm:mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-ink sm:text-2xl">
            Interview results
          </h2>
          <div className="mt-3 space-y-3 sm:mt-4">
            {data.interviews.length === 0 ? (
              <EmptyBlock message="No interviews yet." />
            ) : (
              data.interviews.map((s) => (
                <article
                  key={s.id}
                  className="rounded-2xl border border-white/10 bg-navy-mid p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">
                        {s.candidate_name || "—"}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-mist">
                        {s.role_title}
                        {s.field_of_work ? ` · ${s.field_of_work}` : ""}
                      </p>
                    </div>
                    <p className="shrink-0 text-lg font-semibold text-teal">
                      {s.score != null ? `${s.score}%` : "—"}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-mist">
                    <span className="capitalize">{s.status}</span>
                    <span>{formatDate(s.ended_at || s.created_at)}</span>
                    {s.phone_number ? <span>{s.phone_number}</span> : null}
                  </div>
                  {s.feedback?.summary && (
                    <p className="mt-3 text-sm leading-relaxed text-mist">
                      {s.feedback.summary}
                    </p>
                  )}
                </article>
              ))
            )}
          </div>
        </section>

        <section className="mt-8 pb-8 sm:mt-10 sm:pb-10">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-ink sm:text-2xl">
            ATS check results
          </h2>
          <div className="mt-3 space-y-3 sm:mt-4">
            {data.atsAnalyses.length === 0 ? (
              <EmptyBlock message="No ATS checks saved yet." />
            ) : (
              data.atsAnalyses.map((a) => (
                <article
                  key={a.id}
                  className="rounded-2xl border border-white/10 bg-navy-mid p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">
                        {a.candidate_name || "—"}
                      </p>
                      <p className="mt-0.5 break-all text-sm text-mist">
                        {a.email || a.file_name || "—"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-semibold text-teal">
                        {a.score}%
                      </p>
                      {a.rating_label && (
                        <p className="text-xs text-mist">{a.rating_label}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-mist">
                    <span className="capitalize">{a.apply_scope}</span>
                    <span>{a.source}</span>
                    <span>{formatDate(a.created_at)}</span>
                  </div>
                  {a.summary && (
                    <p className="mt-3 text-sm leading-relaxed text-mist">
                      {a.summary}
                    </p>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
