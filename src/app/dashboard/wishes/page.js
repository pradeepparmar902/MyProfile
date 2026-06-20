import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { WishManager } from "@/components/wish/WishManager";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function WishesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const items = await db.wish.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <DashboardTopbar 
        title="My Roadmap / Career Vision" 
        description="Share your future goals, roadmap, or dream companies."
        guideContent={
          <>
            <p>What is your ultimate career goal? What are you working towards?</p>
            <p><strong>Currently Achieved Steps:</strong> List things you've already done to get closer to this goal (e.g. "Completed my B.Tech").</p>
            <p><strong>Future Steps:</strong> List what you still need to do (e.g. "Get AWS Certified", "Gain 2 years experience").</p>
            <p><em>Note: This section is for your digital profile only, it won't appear on your formal PDF Resume.</em></p>
          </>
        }
      />
      <WishManager initialItems={items} />
    </>
  );
}
