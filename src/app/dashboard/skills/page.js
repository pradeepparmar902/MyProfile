import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SkillsManager } from "@/components/skills/SkillsManager";

export default async function SkillsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const skills = await db.skill.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const media = await db.media.findMany({
    where: {
      userId: user.id,
      relatedType: "SKILL",
      relatedId: { in: skills.map((skill) => skill.id) },
    },
    orderBy: { createdAt: "desc" },
  });
  const mediaBySkill = media.reduce((groups, item) => {
    groups[item.relatedId] = groups[item.relatedId] || [];
    groups[item.relatedId].push(item);
    return groups;
  }, {});

  return (
    <>
      <DashboardTopbar 
        title="Skills With Proof" 
        guideContent={
          <>
            <p>Instead of just claiming you know a skill, prove it!</p>
            <p><strong>Skill Name:</strong> E.g. Python, Figma, Public Speaking.</p>
            <p><strong>Proof Link:</strong> Add a link to a project, a certificate, a GitHub repo, or a design file that actually shows you using this skill.</p>
          </>
        }
      />
      <SkillsManager
        initialSkills={JSON.parse(JSON.stringify(skills))}
        initialMedia={JSON.parse(JSON.stringify(mediaBySkill))}
      />
    </>
  );
}
