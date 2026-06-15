import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { ActivityManager } from "@/components/activities/ActivityManager";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ActivitiesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const items = await db.activity.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <DashboardTopbar 
        title="Other Activity" 
        guideContent={
          <>
            <p>Log your social activities, clubs, community service, and other engagements.</p>
            <p><strong>Description:</strong> What did the organization do? What was your specific contribution?</p>
            <p><strong>Achievements:</strong> Did you organize an event? Raise funds? Help a certain number of people?</p>
          </>
        }
      />
      <ActivityManager initialItems={items} />
    </>
  );
}
