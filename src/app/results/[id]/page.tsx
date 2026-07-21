import { notFound, redirect } from "next/navigation";
import { ResultsView } from "@/components/ResultsView";
import { requireUserId } from "@/lib/guest";
import { getSession } from "@/lib/sessions/store";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function ResultsPage({ params }: Props) {
  const userId = await requireUserId();
  const { id } = await params;

  const session = await getSession(userId, id);
  if (!session) notFound();

  if (session.status !== "completed") {
    redirect(`/interview/${session.id}`);
  }

  return (
    <div className="min-h-dvh bg-[#0a1628]">
      <main className="flex justify-center px-0 py-0 sm:px-4 sm:py-6">
        <ResultsView session={session} />
      </main>
    </div>
  );
}
