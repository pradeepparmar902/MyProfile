import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";

export async function PUT(request, { params }) {
  await requireAdmin();
  const { id } = await params;
  const body = await request.json();

  if (!body.planId) return error("Plan ID is required");

  const updatedUser = await db.user.update({
    where: { id },
    data: { planId: body.planId }
  });

  return json({ user: updatedUser });
}
