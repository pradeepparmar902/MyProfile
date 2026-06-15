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
      <DashboardTopbar title="Other Activity" />
      <ActivityManager initialItems={items} />
    </>
  );
}
