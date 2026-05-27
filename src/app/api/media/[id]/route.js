import { db } from "@/lib/db";
import { error, json } from "@/lib/api";
import { authenticated } from "@/lib/crud";

export async function DELETE(_request, { params }) {
  const { user, response } = await authenticated();
  if (response) return response;

  const { id } = await params;
  const existing = await db.media.findFirst({ where: { id, userId: user.id } });
  if (!existing) return error("File not found.", 404);

  await db.media.delete({ where: { id } });
  return json({ ok: true });
}
