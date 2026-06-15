import { db } from "@/lib/db";
import { error, json } from "@/lib/api";
import { authenticated } from "@/lib/crud";

export async function PUT(request, { params }) {
  const { user, response } = await authenticated();
  if (response) return response;
  const { id } = await params;
  const body = await request.json();

  const existing = await db.wish.findFirst({ where: { id, userId: user.id } });
  if (!existing) return error("Wish record not found.", 404);

  return json({
    wish: await db.wish.update({
      where: { id },
      data: {
        isHidden: body.isHidden !== undefined ? Boolean(body.isHidden) : existing.isHidden,
        title: body.title !== undefined ? body.title : existing.title,
        thoughts: body.thoughts !== undefined ? body.thoughts : existing.thoughts,
        achievedSteps: body.achievedSteps !== undefined ? body.achievedSteps : existing.achievedSteps,
        futureSteps: body.futureSteps !== undefined ? body.futureSteps : existing.futureSteps,
      },
    }),
  });
}

export async function DELETE(_request, { params }) {
  const { user, response } = await authenticated();
  if (response) return response;
  const { id } = await params;
  const existing = await db.wish.findFirst({ where: { id, userId: user.id } });
  if (!existing) return error("Wish record not found.", 404);
  await db.wish.delete({ where: { id } });
  return json({ ok: true });
}
