import { db } from "@/lib/db";
import { error, json } from "@/lib/api";
import { authenticated } from "@/lib/crud";

export async function GET() {
  const { user, response } = await authenticated();
  if (response) return response;
  return json({
    items: await db.profession.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  });
}

export async function POST(request) {
  const { user, response } = await authenticated();
  if (response) return response;
  const body = await request.json();
  if (!body.companyName) return error("Company name is required.");
  if (!body.designation) return error("Designation is required.");

  const item = await db.profession.create({
    data: {
      userId: user.id,
      companyName: body.companyName,
      designation: body.designation,
      employmentType: body.employmentType || "FULL_TIME",
      location: body.location || "",
      joiningDate: body.joiningDate || "",
      completionDate: body.completionDate || "",
      isCurrent: Boolean(body.isCurrent),
      promotion: body.promotion || "",
      responsibilities: body.responsibilities || "",
      achievements: body.achievements || "",
      companyWebsite: body.companyWebsite || "",
    },
  });

  return json({ item }, 201);
}
