import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { getSessionUser } from "@/lib/auth";
import { ProfileEditor } from "@/components/profile/ProfileEditor";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <>
      <DashboardTopbar title="Settings" />
      <ProfileEditor
        user={{ id: user.id, name: user.name, email: user.email }}
        profile={user.profile ? JSON.parse(JSON.stringify(user.profile)) : null}
      />
    </>
  );
}
