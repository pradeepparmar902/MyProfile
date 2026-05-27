import { redirect } from "next/navigation";
import { ExperienceManager } from "@/components/experience/ExperienceManager";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ProfessionPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const items = await db.profession.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const media = await db.media.findMany({
    where: {
      userId: user.id,
      relatedType: "PROFESSION",
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
      <DashboardTopbar title="Profession - Job" />
      <ExperienceManager
        title="Profession - Job"
        description="Save professional work history, company details, designation, promotions, responsibilities, achievements, and proof files."
        apiPath="/api/profession"
        relatedType="PROFESSION"
        initialItems={JSON.parse(JSON.stringify(items))}
        initialMedia={JSON.parse(JSON.stringify(mediaByItem))}
      />
    </>
  );
}
