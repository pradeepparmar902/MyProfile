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
      <DashboardTopbar title="Out-of-Box Thinking" />
      <OutOfBoxManager
        initialItems={JSON.parse(JSON.stringify(outOfBox))}
        initialMedia={JSON.parse(JSON.stringify(mediaByItem))}
      />
    </>
  );
}
