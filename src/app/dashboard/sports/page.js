import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { SportsManager } from "@/components/sports/SportsManager";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function SportsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const items = await db.sport.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <DashboardTopbar title="Sports Activity" />
      <SportsManager initialItems={items} />
    </>
  );
}
