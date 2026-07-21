import Image from "next/image";
import Link from "next/link";

export function AppNav({ variant = "app" }: { variant?: "landing" | "app" }) {
  return (
    <header
      className={`relative z-20 flex items-center justify-between gap-4 px-5 py-3 md:px-10 ${
        variant === "landing"
          ? ""
          : "border-b border-white/8 bg-navy/85 backdrop-blur-md"
      }`}
    >
      <Link
        href="/"
        className="inline-flex items-center rounded-lg bg-white px-2.5 py-1.5 shadow-sm transition hover:opacity-95"
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

      <nav className="flex items-center gap-3">
        <Link
          href="/guide"
          className="hidden text-sm font-medium text-mist transition hover:text-ink sm:inline"
        >
          Prep guide
        </Link>
        {variant === "app" && (
          <Link
            href="/dashboard"
            className="hidden text-sm font-medium text-mist transition hover:text-ink sm:inline"
          >
            Dashboard
          </Link>
        )}
        <Link
          href="/schedule"
          className="rounded-full bg-teal px-5 py-2 text-sm font-semibold text-navy transition hover:bg-foam"
        >
          {variant === "landing" ? "Start interview" : "New interview"}
        </Link>
      </nav>
    </header>
  );
}
