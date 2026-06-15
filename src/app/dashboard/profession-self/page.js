import { redirect } from "next/navigation";
import { SelfBusinessManager } from "@/components/experience/SelfBusinessManager";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ProfessionSelfPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const items = await db.professionSelf.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  
  const media = await db.media.findMany({
    where: {
      userId: user.id,
      relatedType: "PROFESSION_SELF",
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
      <DashboardTopbar 
        title="Profession - Self Business / Training" 
        guideContent={
          <>
            <p>Are you an entrepreneur, freelancer, or trainer? Log your business details here.</p>
            <p><strong>Business Highlights:</strong> Did you register a company? Gain clients? What services or products do you offer?</p>
            <p>Make sure to upload links to your business website or portfolio pieces!</p>
          </>
        }
      />
      <SelfBusinessManager
        title="Profession - Self Business / Training"
        description="Save your business details, freelancing projects, professional trainings, key milestones, and outcomes."
        apiPath="/api/profession-self"
        relatedType="PROFESSION_SELF"
        initialItems={JSON.parse(JSON.stringify(items))}
        initialMedia={JSON.parse(JSON.stringify(mediaByItem))}
      />
    </>
  );
}
