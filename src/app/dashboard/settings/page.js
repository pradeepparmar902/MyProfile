import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { getSessionUser } from "@/lib/auth";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { LinkedInConnect } from "@/components/linkedin/LinkedInConnect";
import { RecruiterLink } from "@/components/profile/RecruiterLink";
import { db } from "@/lib/db";

export default async function SettingsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const fullUser = await db.user.findUnique({ 
    where: { id: user.id },
    include: { profile: true } 
  });
  const resumes = await db.resume.findMany({ 
    where: { userId: user.id },
    orderBy: { createdAt: "desc" }
  });

  const linkedinConnected = !!(
    fullUser?.linkedinAccessToken &&
    fullUser?.linkedinTokenExpiry &&
    new Date() < new Date(fullUser.linkedinTokenExpiry)
  );

  return (
    <>
      <DashboardTopbar title="Settings" />
      <div className="grid gap-8 p-4 md:p-8">
        <RecruiterLink username={fullUser?.profile?.username} resumes={resumes} />
        <LinkedInConnect isConnected={linkedinConnected} />
      </div>
    </>
  );
}
