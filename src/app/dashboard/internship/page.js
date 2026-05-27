import { redirect } from "next/navigation";
import { ExperienceManager } from "@/components/experience/ExperienceManager";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function InternshipPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const items = await db.internship.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const media = await db.media.findMany({
    where: {
      userId: user.id,
      relatedType: "INTERNSHIP",
      relatedId: { in: items.map((item) => item.id) },
    },
    orderBy: { createdAt: "desc" },
  });
  const mediaByItem = media.reduce((groups, item) => {
    groups[item.relatedId] = groups[item.relatedId] || [];
    groups[item.relatedId].push(item);
    return groups;
  }, {});

  return (
    <>
      <DashboardTopbar title="Internship" />
      <ExperienceManager
        title="Internship"
        description="Save internship company details, designation, dates, work handled, learnings, and proof documents."
        apiPath="/api/internship"
        relatedType="INTERNSHIP"
        initialItems={JSON.parse(JSON.stringify(items))}
        initialMedia={JSON.parse(JSON.stringify(mediaByItem))}
      />
    </>
  );
}
