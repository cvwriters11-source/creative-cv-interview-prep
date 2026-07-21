import { AppNav } from "@/components/AppNav";
import { StartInterviewForm } from "@/components/StartInterviewForm";

export default function StartPage() {
  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[radial-gradient(ellipse_at_top,#1c1e21,#121416_60%)]">
      <AppNav variant="app" />
      <main className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto px-4 py-4 md:px-8">
        <div className="mx-auto mb-4 w-full max-w-3xl text-center sm:text-left">
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink md:text-3xl">
            Start interview
          </h1>
          <p className="mt-1 text-sm text-mist">
            Enter your name and details — then go live. Your score will be saved
            under your name.
          </p>
        </div>
        <StartInterviewForm />
      </main>
    </div>
  );
}
