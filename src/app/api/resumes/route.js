import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUserLimits } from "@/lib/plans";

export async function POST(req) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    const limits = await getUserLimits(user.id);
    const count = await db.resume.count({ where: { userId: user.id } });
    if (count >= limits.resumeLimit) {
      return NextResponse.json({ error: `Limit reached. Your ${limits.planName} plan only allows ${limits.resumeLimit} resumes.` }, { status: 403 });
    }

    const resume = await db.resume.create({
      data: {
        userId: user.id,
        title: body.title || "Untitled Resume",
        template: body.template || "classic",
        selections: {},
      },
    });

    return NextResponse.json(resume);
  } catch (error) {
    console.error("Resume POST Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
