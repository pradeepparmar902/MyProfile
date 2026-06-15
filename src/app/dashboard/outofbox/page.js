import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { OutOfBoxManager } from "@/components/outofbox/OutOfBoxManager";

export default async function OutOfBoxPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  
  const outOfBox = await db.outOfBox.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  
  const media = await db.media.findMany({
    where: {
      userId: user.id,
      relatedType: "OUTOFBOX",
      relatedId: { in: outOfBox.map((item) => item.id) },
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
        title="Out-of-Box Thinking" 
        guideContent={
          <>
            <p>Showcase moments where you thought differently.</p>
            <p><strong>Context:</strong> What was the normal way of doing things?</p>
            <p><strong>Innovation:</strong> What unique approach did you take?</p>
            <p><strong>Result:</strong> How did your new idea improve the situation?</p>
            <p><em>Example: "Instead of manually grading 100 papers, I wrote a quick Python script to auto-grade them, saving 10 hours."</em></p>
          </>
        }
      />
      <OutOfBoxManager
        initialItems={JSON.parse(JSON.stringify(outOfBox))}
        initialMedia={JSON.parse(JSON.stringify(mediaByItem))}
      />
    </>
  );
}
