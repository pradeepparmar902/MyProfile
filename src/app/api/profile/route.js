import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, json, slugify } from "@/lib/api";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return error("Unauthorized", 401);
  return json({ user: { id: user.id, name: user.name, email: user.email }, profile: user.profile });
}

export async function PUT(request) {
  const user = await getSessionUser();
  if (!user) return error("Unauthorized", 401);

  const body = await request.json();
  const name = body.name?.trim() || user.name;
  const username = slugify(body.username || user.profile?.username || name);

  const existing = await db.profile.findUnique({ where: { username } });
  if (existing && existing.userId !== user.id) {
    return error("Username is already taken.", 409);
  }

  const [updatedUser, profile] = await db.$transaction([
    db.user.update({
      where: { id: user.id },
      data: { name },
    }),
    db.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        username,
        headline: body.headline || "",
        bio: body.bio || "",
        careerGoal: body.careerGoal || "",
        location: body.location || "",
        linkedinUrl: body.linkedinUrl || "",
        githubUrl: body.githubUrl || "",
        portfolioUrl: body.portfolioUrl || "",
        emailVisible: Boolean(body.emailVisible),
        isPublic: body.isPublic !== false,
      },
      update: {
        username,
        headline: body.headline || "",
        bio: body.bio || "",
        careerGoal: body.careerGoal || "",
        location: body.location || "",
        linkedinUrl: body.linkedinUrl || "",
        githubUrl: body.githubUrl || "",
        portfolioUrl: body.portfolioUrl || "",
        emailVisible: Boolean(body.emailVisible),
        isPublic: body.isPublic !== false,
      },
    }),
  ]);

  return json({ user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email }, profile });
}
