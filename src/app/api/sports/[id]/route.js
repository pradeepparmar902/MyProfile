import { db } from "@/lib/db";
import { error, json } from "@/lib/api";
import { authenticated } from "@/lib/crud";

export async function PUT(request, { params }) {
  const { user, response } = await authenticated();
  if (response) return response;
  const { id } = await params;
  const body = await request.json();

  const existing = await db.sport.findFirst({ where: { id, userId: user.id } });
  if (!existing) return error("Sport record not found.", 404);

  return json({
    sport: await db.sport.update({
      where: { id },
      data: {
        isHidden: body.isHidden !== undefined ? Boolean(body.isHidden) : existing.isHidden,
        title: body.title !== undefined ? body.title : existing.title,
        period: body.period !== undefined ? body.period : existing.period,
        description: body.description !== undefined ? body.description : existing.description,
        achievements: body.achievements !== undefined ? body.achievements : existing.achievements,
      },
    }),
  });
}

export async function DELETE(_request, { params }) {
  const { user, response } = await authenticated();
  if (response) return response;
  const { id } = await params;
  const existing = await db.sport.findFirst({ where: { id, userId: user.id } });
  if (!existing) return error("Sport record not found.", 404);
  await db.sport.delete({ where: { id } });
  return json({ ok: true });
}
