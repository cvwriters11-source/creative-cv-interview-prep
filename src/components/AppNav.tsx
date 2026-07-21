"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/interviews"
            className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-navy transition hover:bg-foam"
          >
            Start interview
          </Link>
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
        </nav>
      )}
    </header>
  );
}
