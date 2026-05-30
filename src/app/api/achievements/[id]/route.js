import { db } from "@/lib/db";
import { error, json } from "@/lib/api";
import { authenticated, normalizeEnum } from "@/lib/crud";

export async function PUT(request, { params }) {
  const { user, response } = await authenticated();
  if (response) return response;
  const { id } = await params;
  const body = await request.json();
  const existing = await db.achievement.findFirst({ where: { id, userId: user.id } });
  if (!existing) return error("Achievement not found.", 404);

  return json({
    achievement: await db.achievement.update({
      where: { id },
      data: {
        isHidden: body.isHidden !== undefined ? Boolean(body.isHidden) : existing.isHidden,
        title: body.title,
        category: normalizeEnum(body.category, existing.category),
        problemStatement: body.problemStatement || "",
        thinkingProcess: body.thinkingProcess || "",
        executionProcess: body.executionProcess || "",
        result: body.result || "",
        metrics: body.metrics || "",
        learning: body.learning || "",
        skillsUsed: body.skillsUsed || "",
        proofLink: body.proofLink || "",
        status: normalizeEnum(body.status, existing.status),
      },
    }),
  });
}

export async function DELETE(_request, { params }) {
  const { user, response } = await authenticated();
  if (response) return response;
  const { id } = await params;
  const existing = await db.achievement.findFirst({ where: { id, userId: user.id } });
  if (!existing) return error("Achievement not found.", 404);
  await db.achievement.delete({ where: { id } });
  return json({ ok: true });
}
