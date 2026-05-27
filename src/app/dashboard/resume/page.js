import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { ResumeBuilder } from "@/components/resume/ResumeBuilder";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function ResumePage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [education, achievements, projects, skills, internships, professions, professionsSelf] =
    await Promise.all([
      db.education.findMany({ where: { userId: user.id }, orderBy: { startYear: "desc" } }),
      db.achievement.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      db.project.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      db.skill.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      db.internship.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      db.profession.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
      db.professionSelf.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    ]);

  const profile = user.profile;

  return (
    <>
      <DashboardTopbar title="Resume Builder" />
      <ResumeBuilder
        user={JSON.parse(JSON.stringify(user))}
        profile={JSON.parse(JSON.stringify(profile || {}))}
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
