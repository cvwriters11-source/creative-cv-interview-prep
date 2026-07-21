"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SignOutButton } from "@/components/SignOutButton";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/interviews", label: "Interviews" },
  { href: "/ats", label: "ATS Check" },
  { href: "/prep", label: "Prep" },
  { href: "/career-development", label: "Career Development" },
  { href: "/about", label: "About" },
] as const;

function linkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav({ variant = "app" }: { variant?: "landing" | "app" }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const adminList = (
      process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
      process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
      ""
    )
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    function applyUser(userEmail: string | null | undefined) {
      const nextEmail = userEmail ?? null;
      setEmail(nextEmail);
      setIsAdmin(
        Boolean(
          nextEmail && adminList.includes(nextEmail.trim().toLowerCase()),
        ),
      );
      setAuthReady(true);
    }

    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      applyUser(data.user?.email);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applyUser(session?.user?.email);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header
      className={`relative z-20 border-b border-transparent px-5 py-3 md:px-10 ${
        variant === "landing"
          ? ""
          : "border-white/8 bg-navy/85 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex shrink-0 items-center rounded-lg bg-white px-2.5 py-1.5 shadow-sm transition hover:opacity-95"
          aria-label="Creative CV home"
        >
          <Image
            src="/creative-cv-logo.png"
            alt="Creative CV — Group of Recruiters"
            width={200}
            height={52}
            priority
            className="h-8 w-auto md:h-9"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active = linkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-white/10 text-ink"
                    : "text-mist hover:bg-white/5 hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                linkActive(pathname, "/admin")
                  ? "bg-teal/20 text-teal"
                  : "text-teal hover:bg-teal/10"
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {authReady && email ? (
            <>
              <span className="hidden max-w-[140px] truncate text-xs text-mist sm:inline">
                {email}
              </span>
              <Link
                href="/interviews"
                className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-navy transition hover:bg-foam"
              >
                Start interview
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden rounded-full border border-white/20 px-3 py-2 text-sm font-semibold text-ink transition hover:border-teal/50 hover:text-teal sm:inline-flex"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-navy transition hover:bg-foam"
              >
                Register
              </Link>
            </>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-ink lg:hidden"
            aria-expanded={open}
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-4 bg-current" />
              <span className="block h-0.5 w-4 bg-current" />
              <span className="block h-0.5 w-4 bg-current" />
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="mx-auto mt-3 flex max-w-6xl flex-col gap-1 border-t border-white/10 pt-3 lg:hidden">
          {LINKS.map((link) => {
            const active = linkActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  active ? "bg-white/10 text-ink" : "text-mist hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-teal"
            >
              Admin
            </Link>
          )}
          {!email && (
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-mist hover:text-ink"
            >
              Sign in
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
