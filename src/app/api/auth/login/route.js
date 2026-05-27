import { db } from "@/lib/db";
import { createSession, publicUser } from "@/lib/auth";
import { error, json } from "@/lib/api";
import { verifyPassword } from "@/lib/password";

export async function POST(request) {
  const body = await request.json();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!email || !password) {
    return error("Email and password are required.");
  }

  const user = await db.user.findUnique({
    where: { email },
    include: { profile: true },
  });

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return error("Invalid email or password.", 401);
  }

  await createSession(user.id);
  return json({ user: publicUser(user) });
}
