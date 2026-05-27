import { notFound, redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { AchievementEditForm } from "@/components/achievements/AchievementEditForm";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function EditAchievementPage({ params }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const achievement = await db.achievement.findFirst({
    where: { id, userId: user.id },
  });

  if (!achievement) notFound();
  const media = await db.media.findMany({
    where: { userId: user.id, relatedType: "ACHIEVEMENT", relatedId: achievement.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <DashboardTopbar title="Edit Achievement" />
      <div className="p-4 md:p-8">
        <AchievementEditForm
          achievement={JSON.parse(JSON.stringify(achievement))}
          media={JSON.parse(JSON.stringify(media))}
        />
      </div>
    </>
  );
}
