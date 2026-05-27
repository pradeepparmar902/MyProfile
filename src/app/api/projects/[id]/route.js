import { db } from "@/lib/db";
import { error, json } from "@/lib/api";
import { authenticated } from "@/lib/crud";

export async function PUT(request, { params }) {
  const { user, response } = await authenticated();
  if (response) return response;
  const { id } = await params;
  const body = await request.json();
  const existing = await db.project.findFirst({ where: { id, userId: user.id } });
  if (!existing) return error("Project not found.", 404);

  return json({
    project: await db.project.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description || "",
        problemSolved: body.problemSolved || "",
        toolsUsed: body.toolsUsed || "",
        githubLink: body.githubLink || "",
        demoLink: body.demoLink || "",
        outcome: body.outcome || "",
      },
    }),
  });
}

export async function DELETE(_request, { params }) {
  const { user, response } = await authenticated();
  if (response) return response;
  const { id } = await params;
  const existing = await db.project.findFirst({ where: { id, userId: user.id } });
  if (!existing) return error("Project not found.", 404);
  await db.project.delete({ where: { id } });
  return json({ ok: true });
}
