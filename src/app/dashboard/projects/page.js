import { redirect } from "next/navigation";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ProjectsManager } from "@/components/projects/ProjectsManager";

export default async function ProjectsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const projects = await db.project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  const media = await db.media.findMany({
    where: {
      userId: user.id,
      relatedType: "PROJECT",
      relatedId: { in: projects.map((project) => project.id) },
    },
    orderBy: { createdAt: "desc" },
  });
  const mediaByProject = media.reduce((groups, item) => {
    groups[item.relatedId] = groups[item.relatedId] || [];
    groups[item.relatedId].push(item);
    return groups;
  }, {});

  return (
    <>
      <DashboardTopbar 
        title="Projects" 
        guideContent={
          <>
            <p>List your personal or academic side-projects.</p>
            <p><strong>Title:</strong> Keep it clear (e.g. "E-Commerce App").</p>
            <p><strong>Description:</strong> What did you build and why?</p>
            <p><strong>Tech Stack:</strong> List the languages and frameworks used (e.g. "React, Node.js").</p>
            <p><strong>Outcome:</strong> What is the current status? Is it live? How many users?</p>
            <p>Don't forget to attach links or screenshots!</p>
          </>
        }
      />
      <ProjectsManager
        initialProjects={JSON.parse(JSON.stringify(projects))}
        initialMedia={JSON.parse(JSON.stringify(mediaByProject))}
      />
    </>
  );
}
