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
      <DashboardTopbar 
        title="Profile Builder" 
        guideContent={
          <>
            <p><strong>Headline:</strong> Keep it short and impactful. For example: "Aspiring Product Manager | CS Student at University of Tech".</p>
            <p><strong>Bio:</strong> Share a brief story about who you are, what you are passionate about, and what you are looking for next in your career.</p>
            <p><strong>Career Goal:</strong> Be specific. "Looking for a Summer 2024 Software Engineering Internship".</p>
          </>
        }
      />
      <div className="grid gap-8 p-4 md:p-8">
        <ProfileEditor
          user={{ id: fullUser.id, name: fullUser.name, email: fullUser.email }}
          profile={fullUser?.profile ? JSON.parse(JSON.stringify(fullUser.profile)) : null}
        />
      </div>
    </>
  );
}
