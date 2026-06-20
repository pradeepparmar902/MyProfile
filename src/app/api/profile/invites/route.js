import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import crypto from "crypto";
import { getUserLimits } from "@/lib/plans";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const invites = await db.invite.findMany({
    where: { profileId: profile.id },
  });

  return NextResponse.json({ invites });
}

export async function POST(req) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await db.profile.findUnique({ where: { userId: user.id } });
  if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, allowedEmail, resumeId } = body;
  if (!type || !["GENERAL", "SPECIFIC"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (type === "SPECIFIC" && (!allowedEmail || !allowedEmail.includes("@"))) {
    return NextResponse.json({ error: "Valid email required for specific invites" }, { status: 400 });
  }

  const limits = await getUserLimits(user.id);
  const count = await db.invite.count({ where: { profileId: profile.id } });
  if (count >= limits.inviteLimit) {
    return NextResponse.json({ error: `Limit reached. Your ${limits.planName} plan only allows ${limits.inviteLimit} recruiter links.` }, { status: 403 });
  }

  const invite = await db.invite.create({
    data: {
      profileId: profile.id,
      type,
      resumeId: resumeId || null,
      allowedEmail: type === "SPECIFIC" ? allowedEmail : null,
    },
  });

  return NextResponse.json({ invite });
}
