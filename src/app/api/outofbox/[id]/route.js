import { db } from "@/lib/db";
import { json, error } from "@/lib/api";
import { authenticated } from "@/lib/crud";

export async function DELETE(request, { params }) {
  const { user, response } = await authenticated();
  if (response) return response;

  const item = await db.outOfBox.findUnique({ where: { id: params.id } });
  if (!item || item.userId !== user.id) {
    return error("Not found or unauthorized", 404);
  }

  await db.outOfBox.delete({ where: { id: params.id } });
  return json({ success: true });
}
