import { db } from "@/lib/db";
import { error, json } from "@/lib/api";
import { authenticated } from "@/lib/crud";

export async function GET() {
  const { user, response } = await authenticated();
  if (response) return response;
  return json({
    projects: await db.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  });
}

export async function POST(request) {
  const { user, response } = await authenticated();
  if (response) return response;
  const body = await request.json();
  if (!body.title) return error("Project title is required.");

  const project = await db.project.create({
    data: {
      userId: user.id,
      title: body.title,
      description: body.description || "",
      problemSolved: body.problemSolved || "",
      toolsUsed: body.toolsUsed || "",
      githubLink: body.githubLink || "",
      demoLink: body.demoLink || "",
      outcome: body.outcome || "",
    },
  });

  return json({ project }, 201);
}
