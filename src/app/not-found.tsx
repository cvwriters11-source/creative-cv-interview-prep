import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-navy px-6 text-center">
      <div className="rounded-xl bg-white px-4 py-2.5">
        <Image
          src="/creative-cv-logo.png"
          alt="Creative CV"
          width={200}
          height={52}
          className="h-9 w-auto"
        />
      </div>
      <h1 className="mt-6 text-xl text-foam">Page not found</h1>
      <p className="mt-2 text-mist">That interview or page does not exist.</p>
      <Link
        href="/interviews"
        className="mt-8 rounded-full bg-teal px-6 py-3 text-sm font-semibold text-navy transition hover:bg-foam"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
