import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(req, { params }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Invite ID required" }, { status: 400 });

  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const invite = await db.invite.findUnique({ where: { id } });
  if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });

  if (invite.profileId !== profile.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await db.invite.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
