import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

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
