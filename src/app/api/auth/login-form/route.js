import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

function redirectTo(request, path) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

export async function POST(request) {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");

  if (!email || !password) {
    return redirectTo(request, "/login?error=missing-fields");
  }

  const user = await db.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return redirectTo(request, `/login?email=${encodeURIComponent(email)}&error=invalid-login`);
  }

  await createSession(user.id);
  return redirectTo(request, "/dashboard");
}
