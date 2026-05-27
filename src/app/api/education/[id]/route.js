import { db } from "@/lib/db";
import { error, json } from "@/lib/api";
import { authenticated } from "@/lib/crud";

export async function PUT(request, { params }) {
  const { user, response } = await authenticated();
  if (response) return response;
  const { id } = await params;
  const body = await request.json();

  const existing = await db.education.findFirst({ where: { id, userId: user.id } });
  if (!existing) return error("Education record not found.", 404);

  return json({
    education: await db.education.update({
      where: { id },
      data: {
        institutionName: body.institutionName,
        degree: body.degree,
        fieldOfStudy: body.fieldOfStudy || "",
        startYear: body.startYear ? Number(body.startYear) : null,
        endYear: body.endYear ? Number(body.endYear) : null,
        grade: body.grade || "",
        description: body.description || "",
      },
    }),
  });
}

export async function DELETE(_request, { params }) {
  const { user, response } = await authenticated();
  if (response) return response;
  const { id } = await params;
  const existing = await db.education.findFirst({ where: { id, userId: user.id } });
  if (!existing) return error("Education record not found.", 404);
  await db.education.delete({ where: { id } });
  return json({ ok: true });
}
