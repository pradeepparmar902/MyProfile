import { db } from "@/lib/db";
import { createSession, publicUser } from "@/lib/auth";
import { error, json, slugify } from "@/lib/api";
import { hashPassword } from "@/lib/password";

export async function POST(request) {
  const body = await request.json();
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!name || !email || !password) {
    return error("Name, email, and password are required.");
  }

  if (password.length < 6) {
    return error("Password must be at least 6 characters.");
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return error("An account with this email already exists.", 409);
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
    include: { profile: true },
  });

  await createSession(user.id);
  return json({ user: publicUser(user) }, 201);
}
