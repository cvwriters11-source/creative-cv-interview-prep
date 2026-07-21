import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { InterviewRoom } from "@/components/InterviewRoom";
import { getGuestUserId } from "@/lib/guest";
import { getSession } from "@/lib/sessions/store";
import { canJoinSession } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default async function InterviewPage({ params }: Props) {
  const userId = await getGuestUserId();
  const { id } = await params;

  const session = await getSession(userId, id);
  if (!session) notFound();

  if (session.status === "completed") {
    redirect(`/results/${session.id}`);
  }

  const joinable = canJoinSession(session.scheduled_at, session.status);

  return (
    <div className="min-h-dvh bg-[radial-gradient(ellipse_at_center,#1c1e21,#121416)]">
      <AppNav variant="app" />
      {joinable ? (
        <InterviewRoom session={session} />
      ) : (
        <div className="mx-auto max-w-lg px-6 py-20 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-ink">
            Not open yet
          </h1>
          <p className="mt-3 text-mist">
            You can join starting 5 minutes before{" "}
            {new Date(session.scheduled_at).toLocaleString()}.
          </p>
          <Link
            href="/interviews"
            className="mt-8 inline-flex rounded-full bg-teal px-6 py-3 text-sm font-semibold text-navy transition hover:bg-foam"
          >
            Back to dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
