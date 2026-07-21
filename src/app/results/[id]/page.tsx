import { notFound, redirect } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { ResultsView } from "@/components/ResultsView";
import { getGuestUserId } from "@/lib/guest";
import { getSession } from "@/lib/sessions/store";

type Props = { params: Promise<{ id: string }> };

export default async function ResultsPage({ params }: Props) {
  const userId = await getGuestUserId();
  const { id } = await params;

  const session = await getSession(userId, id);
  if (!session) notFound();

  if (session.status !== "completed") {
    redirect(`/interview/${session.id}`);
  }

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_top,#1c1e21,#121416_60%)]">
      <AppNav variant="app" />
      <ResultsView session={session} />
    </div>
  );
}
