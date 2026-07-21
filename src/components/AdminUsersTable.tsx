"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type AdminUserRow = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  last_seen_at: string;
};

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

export function AdminUsersTable({
  users,
  currentUserId,
}: {
  users: AdminUserRow[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function removeUser(user: AdminUserRow) {
    if (user.id === currentUserId) return;
    const ok = window.confirm(
      `Remove ${user.email}? This deletes their account, interviews, and ATS history.`,
    );
    if (!ok) return;

    setError(null);
    setBusyId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error || "Failed to remove user");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove user");
    } finally {
      setBusyId(null);
    }
  }

  if (users.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 bg-navy-mid px-4 py-5 text-sm text-mist">
        No registered users yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      )}
      {users.map((u) => {
        const isSelf = u.id === currentUserId;
        return (
          <article
            key={u.id}
            className="rounded-2xl border border-white/10 bg-navy-mid p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-ink">
                  {u.full_name || "No name"}
                  {isSelf && (
                    <span className="ml-2 text-xs font-medium text-teal">
                      (you)
                    </span>
                  )}
                </p>
                <p className="mt-1 break-all text-sm text-mist">{u.email}</p>
              </div>
              <button
                type="button"
                disabled={isSelf || busyId === u.id}
                onClick={() => removeUser(u)}
                className="shrink-0 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-ink transition hover:border-danger/50 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busyId === u.id ? "…" : "Remove"}
              </button>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div>
                <dt className="text-mist">Joined</dt>
                <dd className="mt-0.5 text-ink">{formatDate(u.created_at)}</dd>
              </div>
              <div>
                <dt className="text-mist">Last seen</dt>
                <dd className="mt-0.5 text-ink">{formatDate(u.last_seen_at)}</dd>
              </div>
            </dl>
          </article>
        );
      })}
    </div>
  );
}
