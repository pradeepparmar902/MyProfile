import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export async function PUT(request, { params }) {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json();

  if (body.isDefault) {
    const existing = await db.plan.findMany({});
    for (const p of existing) {
      if (p.isDefault && p.id !== id) {
        await db.plan.update({ where: { id: p.id }, data: { isDefault: false }});
      }
    }
  }

  const plan = await db.plan.update({
    where: { id },
    data: {
      name: body.name,
      price: body.price,
      resumeLimit: body.resumeLimit,
      roadmapLimit: body.roadmapLimit,
      inviteLimit: body.inviteLimit,
      isDefault: body.isDefault || false,
    }
  });

  return json({ plan });
}

export async function DELETE(_request, { params }) {
  await requireAdmin();
  const { id } = await params;
  await db.plan.delete({ where: { id } });
  return json({ ok: true });
}
