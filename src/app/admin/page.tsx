import Link from "next/link";
import { AdminUsersTable } from "@/components/AdminUsersTable";
import { AppNav } from "@/components/AppNav";
import { requireAdmin } from "@/lib/admin";
import { loadAdminDashboard } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-navy-mid px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-mist">
        {label}
      </p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
        {value}
      </p>
    </div>
  );
}

export default async function AdminPage() {
  const adminUser = await requireAdmin();
  const data = await loadAdminDashboard();

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,#141618,#0a0c0e_60%)]">
      <AppNav variant="app" />
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
              Admin
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-ink md:text-4xl">
              Users & results
            </h1>
            <p className="mt-2 max-w-2xl text-mist">
              Signed in as {adminUser.email}. View registrations, activity,
              interview scores, ATS checks, and remove users when needed.
            </p>
          </div>
          <Link
            href="/interviews"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-ink transition hover:border-teal/50 hover:text-teal"
          >
            Back to app
          </Link>
        </div>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Registered users" value={data.stats.users} />
          <StatCard label="Registrations logged" value={data.stats.registers} />
          <StatCard label="Logins logged" value={data.stats.logins} />
          <StatCard label="ATS checks" value={data.stats.atsChecks} />
          <StatCard
            label="Interviews completed"
            value={data.stats.interviewsCompleted}
          />
          <StatCard
            label="Avg interview score"
            value={
              data.stats.avgInterviewScore != null
                ? `${data.stats.avgInterviewScore}%`
                : "—"
            }
          />
          <StatCard
            label="Avg ATS score"
            value={
              data.stats.avgAtsScore != null
                ? `${data.stats.avgAtsScore}%`
                : "—"
            }
          />
        </section>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink">
            Registered users
          </h2>
          <div className="mt-4">
            <AdminUsersTable
              users={data.users}
              currentUserId={adminUser.id}
            />
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink">
            Recent activity
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-navy-mid text-mist">
                <tr>
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">Event</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Path</th>
                </tr>
              </thead>
              <tbody>
                {data.visits.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-mist">
                      No activity logged yet.
                    </td>
                  </tr>
                ) : (
                  data.visits.map((v) => (
                    <tr key={v.id} className="border-t border-white/8 text-ink">
                      <td className="px-4 py-3 whitespace-nowrap text-mist">
                        {formatDate(v.created_at)}
                      </td>
                      <td className="px-4 py-3 capitalize">{v.event}</td>
                      <td className="px-4 py-3">{v.email || "—"}</td>
                      <td className="px-4 py-3 text-mist">{v.path || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink">
            Interview results
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-navy-mid text-mist">
                <tr>
                  <th className="px-4 py-3 font-semibold">Candidate</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Summary</th>
                  <th className="px-4 py-3 font-semibold">When</th>
                </tr>
              </thead>
              <tbody>
                {data.interviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-mist">
                      No interviews yet.
                    </td>
                  </tr>
                ) : (
                  data.interviews.map((s) => (
                    <tr key={s.id} className="border-t border-white/8 text-ink">
                      <td className="px-4 py-3">
                        {s.candidate_name || "—"}
                        <p className="text-xs text-mist">{s.phone_number}</p>
                      </td>
                      <td className="px-4 py-3">
                        {s.role_title}
                        <p className="text-xs text-mist">{s.field_of_work}</p>
                      </td>
                      <td className="px-4 py-3 capitalize">{s.status}</td>
                      <td className="px-4 py-3 font-semibold text-teal">
                        {s.score != null ? `${s.score}%` : "—"}
                      </td>
                      <td className="max-w-xs px-4 py-3 text-mist">
                        {s.feedback?.summary || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-mist">
                        {formatDate(s.ended_at || s.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10 pb-10">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink">
            ATS check results
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-navy-mid text-mist">
                <tr>
                  <th className="px-4 py-3 font-semibold">Candidate</th>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Market</th>
                  <th className="px-4 py-3 font-semibold">Score</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Summary</th>
                  <th className="px-4 py-3 font-semibold">When</th>
                </tr>
              </thead>
              <tbody>
                {data.atsAnalyses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-mist">
                      No ATS checks saved yet.
                    </td>
                  </tr>
                ) : (
                  data.atsAnalyses.map((a) => (
                    <tr key={a.id} className="border-t border-white/8 text-ink">
                      <td className="px-4 py-3">
                        {a.candidate_name || "—"}
                        <p className="text-xs text-mist">{a.file_name}</p>
                      </td>
                      <td className="px-4 py-3">{a.email || "—"}</td>
                      <td className="px-4 py-3 capitalize">{a.apply_scope}</td>
                      <td className="px-4 py-3 font-semibold text-teal">
                        {a.score}%
                        <p className="text-xs font-normal text-mist">
                          {a.rating_label}
                        </p>
                      </td>
                      <td className="px-4 py-3">{a.source}</td>
                      <td className="max-w-sm px-4 py-3 text-mist">
                        {a.summary || "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-mist">
                        {formatDate(a.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
