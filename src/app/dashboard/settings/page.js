import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { getSessionUser } from "@/lib/auth";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { LinkedInConnect } from "@/components/linkedin/LinkedInConnect";
import { db } from "@/lib/db";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const fullUser = await db.user.findUnique({ where: { id: user.id } });
  const linkedinConnected = !!(
    fullUser?.linkedinAccessToken &&
    fullUser?.linkedinTokenExpiry &&
    new Date() < new Date(fullUser.linkedinTokenExpiry)
  );

  return (
    <>
      <DashboardTopbar title="Settings" />
      <div className="grid gap-8 p-4 md:p-8">
        <ProfileEditor
          user={{ id: user.id, name: user.name, email: user.email }}
          profile={user.profile ? JSON.parse(JSON.stringify(user.profile)) : null}
        />
        <LinkedInConnect isConnected={linkedinConnected} />
      </div>
    </>
  );
}
