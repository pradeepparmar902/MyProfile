import { db } from "@/lib/db";
import { error, json } from "@/lib/api";
import { authenticated } from "@/lib/crud";

export async function PUT(request, { params }) {
  const { user, response } = await authenticated();
  if (response) return response;
  const { id } = await params;
  const body = await request.json();
  const existing = await db.internship.findFirst({ where: { id, userId: user.id } });
  if (!existing) return error("Internship record not found.", 404);

  return json({
    item: await db.internship.update({
      where: { id },
      data: {
        isHidden: body.isHidden !== undefined ? Boolean(body.isHidden) : existing.isHidden,
        companyName: body.companyName,
        designation: body.designation,
        employmentType: body.employmentType || "INTERNSHIP",
        location: body.location || "",
        joiningDate: body.joiningDate || "",
        completionDate: body.completionDate || "",
        isCurrent: Boolean(body.isCurrent),
        promotion: body.promotion || "",
        responsibilities: body.responsibilities || "",
        achievements: body.achievements || "",
        companyWebsite: body.companyWebsite || "",
      },
    }),
  });
}

export async function DELETE(_request, { params }) {
  const { user, response } = await authenticated();
  if (response) return response;
  const { id } = await params;
  const existing = await db.internship.findFirst({ where: { id, userId: user.id } });
  if (!existing) return error("Internship record not found.", 404);
  await db.internship.delete({ where: { id } });
  return json({ ok: true });
}
