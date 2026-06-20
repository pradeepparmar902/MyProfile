import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export async function POST(request) {
  await requireAdmin();
  const body = await request.json();
  
  if (body.isDefault) {
    // Unset other defaults if this is set to default
    const existing = await db.plan.findMany({});
    for (const p of existing) {
      if (p.isDefault) await db.plan.update({ where: { id: p.id }, data: { isDefault: false }});
    }
  }

  const plan = await db.plan.create({
    data: {
      name: body.name,
      price: body.price,
      resumeLimit: body.resumeLimit,
      roadmapLimit: body.roadmapLimit,
      inviteLimit: body.inviteLimit,
      isDefault: body.isDefault || false,
    }
  });

  return json({ plan }, 201);
}
