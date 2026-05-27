import { db } from "@/lib/db";
import { error, json } from "@/lib/api";
import { authenticated } from "@/lib/crud";

export async function GET() {
  const { user, response } = await authenticated();
  if (response) return response;

  return json({
    education: await db.education.findMany({
      where: { userId: user.id },
      orderBy: { startYear: "desc" },
    }),
  });
}

export async function POST(request) {
  const { user, response } = await authenticated();
  if (response) return response;

  const body = await request.json();
  if (!body.institutionName || !body.degree) {
    return error("Institution and degree are required.");
  }

  const education = await db.education.create({
    data: {
      userId: user.id,
      institutionName: body.institutionName,
      degree: body.degree,
      fieldOfStudy: body.fieldOfStudy || "",
      startYear: body.startYear ? Number(body.startYear) : null,
      endYear: body.endYear ? Number(body.endYear) : null,
      grade: body.grade || "",
      description: body.description || "",
    },
  });

  return json({ education }, 201);
}
