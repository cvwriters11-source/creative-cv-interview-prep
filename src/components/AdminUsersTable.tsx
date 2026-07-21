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
    return new Date(value).toLocaleString();
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

  return (
    <div>
      {error && (
        <p className="mb-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-ink">
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-navy-mid text-mist">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold">Last seen</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-mist">
                  No registered users yet.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isSelf = u.id === currentUserId;
                return (
                  <tr key={u.id} className="border-t border-white/8 text-ink">
                    <td className="px-4 py-3">{u.full_name || "—"}</td>
                    <td className="px-4 py-3">
                      {u.email}
                      {isSelf && (
                        <span className="ml-2 text-xs text-teal">(you)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-mist">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-mist">
                      {formatDate(u.last_seen_at)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={isSelf || busyId === u.id}
                        onClick={() => removeUser(u)}
                        className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-ink transition hover:border-danger/50 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {busyId === u.id ? "Removing…" : "Remove"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
