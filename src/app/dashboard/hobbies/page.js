import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { HobbiesManager } from "@/components/hobbies/HobbiesManager";

export default async function HobbiesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  
  const hobbies = await db.hobby.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  
  const media = await db.media.findMany({
    where: {
      userId: user.id,
      relatedType: "HOBBY",
      relatedId: { in: hobbies.map((item) => item.id) },
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
      <DashboardTopbar title="Hobbies & Personality" />
      <HobbiesManager
        initialItems={JSON.parse(JSON.stringify(hobbies))}
        initialMedia={JSON.parse(JSON.stringify(mediaByItem))}
      />
    </>
  );
}
