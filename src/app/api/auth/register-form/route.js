import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { slugify } from "@/lib/api";
import { hashPassword } from "@/lib/password";

function redirectTo(request, path) {
  try {
    const origin = request.headers.get("origin") || request.headers.get("referer");
    if (origin) {
      const originUrl = new URL(origin);
      return NextResponse.redirect(new URL(path, originUrl.origin), 303);
    }
  } catch (e) {}

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  return NextResponse.redirect(new URL(path, `${protocol}://${host}`), 303);
}

export async function POST(request) {
  const form = await request.formData();
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || "");
  const confirmPassword = String(form.get("confirmPassword") || "");

  if (!name || !email || !password) {
    return redirectTo(request, "/register?error=missing-fields");
  }

  if (password !== confirmPassword) {
    return redirectTo(request, "/register?error=password-mismatch");
  }

  if (password.length < 6) {
    return redirectTo(request, "/register?error=password-short");
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return redirectTo(request, `/login?email=${encodeURIComponent(email)}&error=account-exists`);
  }

  const baseUsername = slugify(name) || "student";
  let username = baseUsername;
  let suffix = 1;

  while (await db.profile.findUnique({ where: { username } })) {
    suffix += 1;
    username = `${baseUsername}-${suffix}`;
  }

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      profile: {
        create: {
          username,
          headline: "Student building a proof-based career profile",
          bio: "",
          isPublic: true,
        },
      },
    },
  });

  await createSession(user.id);
  return redirectTo(request, "/dashboard");
}
