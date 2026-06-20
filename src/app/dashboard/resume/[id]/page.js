import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { ResumeBuilder } from "@/components/resume/ResumeBuilder";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function TailoredResumePage({ params }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login");

  const resume = await db.resume.findUnique({
    where: { id: params.id }
  });

  if (!resume || resume.userId !== sessionUser.id) {
    redirect("/dashboard/resume");
  }

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

  const profile = user.profile;

  const latestGeneralInvite = profile ? await db.invite.findFirst({
    where: { profileId: profile.id, type: "GENERAL" },
    orderBy: { createdAt: "desc" }
  }) : null;

  return (
    <>
      <DashboardTopbar 
        title={`Edit: ${resume.title}`} 
        guideContent={
          <>
            <p>Customize this specific resume version.</p>
            <p><strong>Selection:</strong> Expand the sections on the left to check/uncheck the exact skills, jobs, and projects you want to appear on this resume.</p>
            <p><strong>Tailored Bio:</strong> You can write a custom headline and summary that will only appear on this resume.</p>
          </>
        }
      />
      <ResumeBuilder
        resume={JSON.parse(JSON.stringify(resume))}
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
      />
    </>
  );
}
