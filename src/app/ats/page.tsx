"use client";

import { AppNav } from "@/components/AppNav";
import { AtsChecker } from "@/components/AtsChecker";
import { useEffect, useState } from "react";

export default function AtsPage() {
  const [showingResults, setShowingResults] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      setShowingResults(Boolean((e as CustomEvent<boolean>).detail));
    };
    window.addEventListener("ats-results", handler);
    return () => window.removeEventListener("ats-results", handler);
  }, []);

  return (
    <div
      className={`min-h-dvh ${
        showingResults
          ? "bg-[#0a1628]"
          : "bg-[radial-gradient(ellipse_at_top,#1c1e21,#121416_60%)]"
      }`}
    >
      {!showingResults && <AppNav variant="app" />}
      <main
        className={
          showingResults
            ? "flex justify-center px-0 py-0 sm:px-4 sm:py-6"
            : "px-4 py-10 md:px-10"
        }
      >
        {!showingResults && (
          <div className="mx-auto mb-10 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.2em] text-mist">
              ATS check
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-ink md:text-4xl">
              Test Your CV for ATS
            </h1>
            <p className="mt-3 max-w-2xl text-mist">
              Upload your CV and tell us how it was created. We score ATS fit and
              report what to fix for wording, formatting, and keywording.
            </p>
          </div>
        )}
        <AtsChecker />
      </main>
    </div>
  );
}
