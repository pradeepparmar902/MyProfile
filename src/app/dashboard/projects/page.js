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
      <DashboardTopbar title="Projects" />
      <ProjectsManager
        initialProjects={JSON.parse(JSON.stringify(projects))}
        initialMedia={JSON.parse(JSON.stringify(mediaByProject))}
      />
    </>
  );
}
