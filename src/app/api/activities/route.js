import { db } from "@/lib/db";
import { error, json } from "@/lib/api";
import { authenticated } from "@/lib/crud";

export async function GET() {
  const { user, response } = await authenticated();
  if (response) return response;
  return json({
    activities: await db.activity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  });
}

export async function POST(request) {
  const { user, response } = await authenticated();
  if (response) return response;
  const body = await request.json();

  if (!body.title) return error("Title is required.");

  const item = await db.activity.create({
    data: {
      userId: user.id,
      title: body.title,
      description: body.description || "",
      achievements: body.achievements || "",
      isHidden: false,
    },
  });

  return json({ activity: item }, 201);
}
