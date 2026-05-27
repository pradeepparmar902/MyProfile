import { db } from "@/lib/db";
import { error, json } from "@/lib/api";
import { authenticated, normalizeEnum } from "@/lib/crud";

export async function GET() {
  const { user, response } = await authenticated();
  if (response) return response;
  return json({
    achievements: await db.achievement.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  });
}

export async function POST(request) {
  const { user, response } = await authenticated();
  if (response) return response;
  const body = await request.json();

  if (!body.title) return error("Achievement title is required.");

  const achievement = await db.achievement.create({
    data: {
      userId: user.id,
      title: body.title,
      category: normalizeEnum(body.category, "PROJECT"),
      problemStatement: body.problemStatement || body.problem || "",
      thinkingProcess: body.thinkingProcess || body.thinking || "",
      executionProcess: body.executionProcess || body.execution || "",
      result: body.result || "",
      metrics: body.metrics || "",
      learning: body.learning || "",
      skillsUsed: body.skillsUsed || body.skills || "",
      proofLink: body.proofLink || body.proof || "",
      status: normalizeEnum(body.status, "PUBLISHED"),
    },
  });

  return json({ achievement }, 201);
}
