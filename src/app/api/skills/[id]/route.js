import { db } from "@/lib/db";
import { error, json } from "@/lib/api";
import { authenticated, normalizeEnum } from "@/lib/crud";

export async function PUT(request, { params }) {
  const { user, response } = await authenticated();
  if (response) return response;
  const { id } = await params;
  const body = await request.json();
  const existing = await db.skill.findFirst({ where: { id, userId: user.id } });
  if (!existing) return error("Skill not found.", 404);

  return json({
    skill: await db.skill.update({
      where: { id },
      data: {
        isHidden: body.isHidden !== undefined ? Boolean(body.isHidden) : existing.isHidden,
        skillName: body.skillName || body.name,
        proficiencyLevel: normalizeEnum(body.proficiencyLevel || body.level, existing.proficiencyLevel),
        proofLink: body.proofLink || body.proof || "",
      },
    }),
  });
}

export async function DELETE(_request, { params }) {
  const { user, response } = await authenticated();
  if (response) return response;
  const { id } = await params;
  const existing = await db.skill.findFirst({ where: { id, userId: user.id } });
  if (!existing) return error("Skill not found.", 404);
  await db.skill.delete({ where: { id } });
  return json({ ok: true });
}
