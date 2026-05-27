import { db } from "@/lib/db";
import { error, json } from "@/lib/api";
import { authenticated, normalizeEnum } from "@/lib/crud";

export async function GET() {
  const { user, response } = await authenticated();
  if (response) return response;
  return json({
    skills: await db.skill.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  });
}

export async function POST(request) {
  const { user, response } = await authenticated();
  if (response) return response;
  const body = await request.json();
  if (!body.skillName && !body.name) return error("Skill name is required.");

  const skill = await db.skill.create({
    data: {
      userId: user.id,
      skillName: body.skillName || body.name,
      proficiencyLevel: normalizeEnum(body.proficiencyLevel || body.level, "BEGINNER"),
      proofLink: body.proofLink || body.proof || "",
    },
  });

  return json({ skill }, 201);
}
