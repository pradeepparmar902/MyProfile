import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { getSessionUser } from "@/lib/auth";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { db } from "@/lib/db";

export default async function ProfileBuilderPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");

  const fullUser = await db.user.findUnique({
    where: { id: sessionUser.id },
    include: { profile: true },
  });

  return (
    <>
      <DashboardTopbar title="Profile Builder" />
      <div className="grid gap-8 p-4 md:p-8">
        <ProfileEditor
          user={{ id: fullUser.id, name: fullUser.name, email: fullUser.email }}
          profile={fullUser?.profile ? JSON.parse(JSON.stringify(fullUser.profile)) : null}
        />
      </div>
    </>
  );
}
