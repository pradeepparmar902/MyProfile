import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { ResumeBuilder } from "@/components/resume/ResumeBuilder";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserLimits } from "@/lib/plans";

export default async function ResumePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");

  const fullUser = await db.user.findUnique({
    where: { id: sessionUser.id },
    include: { profile: true }
  });
  const user = fullUser || sessionUser;

  const education = await db.education.findMany({ where: { userId: user.id }, orderBy: { startYear: "desc" } });
  const achievements = await db.achievement.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const projects = await db.project.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const skills = await db.skill.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const internships = await db.internship.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const professions = await db.profession.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const professionsSelf = await db.professionSelf.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const resumes = await db.resume.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const limits = await getUserLimits(user.id);

  const profile = user.profile;

  const latestGeneralInvite = profile ? await db.invite.findFirst({
    where: { profileId: profile.id, type: "GENERAL" },
    orderBy: { createdAt: "desc" }
  }) : null;

  return (
    <>
      <DashboardTopbar 
        title="Resume Builder" 
        guideContent={
          <>
            <p>Generate a professional ATS-friendly PDF resume based on your profile.</p>
            <p><strong>Visibility:</strong> Use the "eye" icon (visibility toggle) on your other dashboard pages to hide items you don't want on your resume.</p>
            <p><strong>Design:</strong> Select a template that fits your industry and click Download PDF.</p>
          </>
        }
      />
      <ResumeBuilder
        user={JSON.parse(JSON.stringify(user))}
        profile={JSON.parse(JSON.stringify(profile || {}))}
        invite={latestGeneralInvite ? JSON.parse(JSON.stringify(latestGeneralInvite)) : null}
        education={JSON.parse(JSON.stringify(education))}
        achievements={JSON.parse(JSON.stringify(achievements))}
        projects={JSON.parse(JSON.stringify(projects))}
        skills={JSON.parse(JSON.stringify(skills))}
        internships={JSON.parse(JSON.stringify(internships))}
        professions={JSON.parse(JSON.stringify(professions))}
        professionsSelf={JSON.parse(JSON.stringify(professionsSelf))}
        resumes={JSON.parse(JSON.stringify(resumes))}
        limits={limits}
      />
    </>
  );
}
