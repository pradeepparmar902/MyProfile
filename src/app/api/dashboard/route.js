import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { error, json } from "@/lib/api";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return error("Unauthorized", 401);

  const achievementCount = await db.achievement.count({ where: { userId: user.id } });
  const projectCount = await db.project.count({ where: { userId: user.id } });
  const skillCount = await db.skill.count({ where: { userId: user.id } });
  const recentAchievements = await db.achievement.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  const profileViews = user.profile
    ? await db.profileView.count({ where: { profileId: user.profile.id } })
    : 0;

  const profile = user.profile;
  const completed = [
    user.name,
    profile?.username,
    profile?.headline,
    profile?.bio,
    profile?.careerGoal,
    profile?.location,
    achievementCount > 0,
    projectCount > 0,
    skillCount > 0,
  ].filter(Boolean).length;

  return json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profile,
    },
    stats: {
      achievements: achievementCount,
      projects: projectCount,
      skills: skillCount,
      views: profileViews,
      completion: Math.round((completed / 9) * 100),
    },
    recentAchievements,
  });
}
