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

  const media = await db.media.findMany({
    where: {
      userId: user.id,
      relatedType: "SPORT",
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
        title="Sports Activity" 
        guideContent={
          <>
            <p>Log your sports involvement to show teamwork, dedication, and leadership.</p>
            <p><strong>Description:</strong> Mention your role (e.g. "Team Captain", "Starting Point Guard") and how many years you played.</p>
            <p><strong>Achievements:</strong> Did you win any tournaments? Get MVP? Break any records?</p>
          </>
        }
      />
      <SportsManager initialItems={items} initialMedia={mediaByItem} />
    </>
  );
}
