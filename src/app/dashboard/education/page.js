import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { EducationManager } from "@/components/education/EducationManager";

export default async function EducationPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const education = await db.education.findMany({
    where: { userId: user.id },
    orderBy: { startYear: "desc" },
  });
  const media = await db.media.findMany({
    where: {
      userId: user.id,
      relatedType: "EDUCATION",
      relatedId: { in: education.map((item) => item.id) },
    },
    orderBy: { createdAt: "desc" },
  });
  const mediaByEducation = media.reduce((groups, item) => {
    groups[item.relatedId] = groups[item.relatedId] || [];
    groups[item.relatedId].push(item);
    return groups;
  }, {});

  return (
    <>
      <DashboardTopbar title="Education" />
      <EducationManager
        initialEducation={JSON.parse(JSON.stringify(education))}
        initialMedia={JSON.parse(JSON.stringify(mediaByEducation))}
      />
    </>
  );
}
