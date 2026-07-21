"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function signOut() {
    setLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={loading}
      className="rounded-full border border-white/20 px-3 py-2 text-sm font-semibold text-ink transition hover:border-teal/50 hover:text-teal disabled:opacity-60"
    >
      {loading ? "…" : "Sign out"}
    </button>
  );
}
