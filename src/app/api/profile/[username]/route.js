import { db } from "@/lib/db";
import { error, json } from "@/lib/api";

export async function GET(_request, { params }) {
  const { username } = await params;
  const profile = await db.profile.findUnique({
    where: { username },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          education: { orderBy: { startYear: "desc" } },
          achievements: {
            where: { status: "PUBLISHED" },
            orderBy: { createdAt: "desc" },
          },
          projects: { orderBy: { createdAt: "desc" } },
          skills: { orderBy: { createdAt: "desc" } },
        },
      },
    },
  });

  if (!profile || !profile.isPublic) return error("Profile not found.", 404);

  await db.profileView.create({
    data: {
      profileId: profile.id,
    },
  });

  return json({ profile });
}
