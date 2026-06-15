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
      <DashboardTopbar title="My Wish / Career Vision" />
      <WishManager initialItems={items} />
    </>
  );
}
