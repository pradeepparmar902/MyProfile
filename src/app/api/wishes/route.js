import { db } from "@/lib/db";
import { error, json } from "@/lib/api";
import { authenticated } from "@/lib/crud";

export async function GET() {
  const { user, response } = await authenticated();
  if (response) return response;
  return json({
    wishes: await db.wish.findMany({
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

  const item = await db.wish.create({
    data: {
      userId: user.id,
      title: body.title,
      thoughts: body.thoughts || "",
      achievedSteps: body.achievedSteps || "",
      futureSteps: body.futureSteps || "",
      isHidden: false,
    },
  });

  return json({ wish: item }, 201);
}
