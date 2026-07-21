import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const { id } = await context.params;

    if (!id || id === adminUser.id) {
      return NextResponse.json(
        { error: "You cannot delete your own admin account" },
        { status: 400 },
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("admin_delete_user", {
      target_id: id,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, result: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Delete failed" },
      { status: 500 },
    );
  }
}
