import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { token, email } = body;
  if (!token || !email) {
    return NextResponse.json({ error: "Token and email are required" }, { status: 400 });
  }

  const invite = await db.invite.findUnique({ where: { id: token } });
  if (!invite) return NextResponse.json({ error: "Invalid token" }, { status: 404 });

  if (invite.type === "SPECIFIC") {
    if (invite.allowedEmail?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Access denied. Email does not match." }, { status: 403 });
    }
  }

  // Set cookie to remember the verification
  const cookieStore = await cookies();
  cookieStore.set(`invite_verified_${token}`, "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });

  return NextResponse.json({ success: true });
}
