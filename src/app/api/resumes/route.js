import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticated } from "@/lib/crud";
import { error } from "@/lib/api";

export async function POST(req) {
  const auth = await authenticated();
  if (auth.response) return auth.response;

  try {
    const data = await req.json();
    const resume = await db.resume.create({
      data: {
        ...data,
        userId: auth.user.id,
      },
    });
    return NextResponse.json(resume);
  } catch (err) {
    console.error(err);
    return error(err.message, 500);
  }
}
