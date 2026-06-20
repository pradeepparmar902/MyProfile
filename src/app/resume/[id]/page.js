import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ResumeBuilder } from "@/components/resume/ResumeBuilder";

export default async function PublicResumePage({ params }) {
  const resume = await db.resume.findUnique({
    where: { id: params.id }
  });

  if (!resume) notFound();

  const fullUser = await db.user.findUnique({
    where: { id: resume.userId },
    include: { profile: true }
  });

  if (!fullUser) notFound();

  const user = fullUser;
  const profile = fullUser.profile;

  const education = await db.education.findMany({ where: { userId: user.id }, orderBy: { startYear: "desc" } });
  const achievements = await db.achievement.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const projects = await db.project.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const skills = await db.skill.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const internships = await db.internship.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const professions = await db.profession.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  const professionsSelf = await db.professionSelf.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-8">
      <div className="w-full max-w-5xl px-4">
        <ResumeBuilder
          readOnly={true}
          resume={JSON.parse(JSON.stringify(resume))}
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
      </div>
    </div>
  );
}
