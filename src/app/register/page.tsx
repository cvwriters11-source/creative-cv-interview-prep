import { AppNav } from "@/components/AppNav";
import { AuthForm } from "@/components/AuthForm";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath =
    params.next && params.next.startsWith("/") ? params.next : "/interviews";

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,#1c1e21,#121416_60%)]">
      <AppNav variant="app" />
      <main className="px-4 py-10 md:px-10">
        <div className="mx-auto mb-8 max-w-md text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal">
            Get started
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-ink">
            Create your account
          </h1>
          <p className="mt-3 text-mist">
            Register with email and password so we can save your practice
            sessions and track progress.
          </p>
        </div>
        <AuthForm mode="register" nextPath={nextPath} />
      </main>
    </div>
  );
}
