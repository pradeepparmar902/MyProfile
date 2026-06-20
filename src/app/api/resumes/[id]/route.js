import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticated } from "@/lib/crud";
import { error } from "@/lib/api";

export async function PUT(req, { params }) {
  const auth = await authenticated();
  if (auth.response) return auth.response;

  try {
    const data = await req.json();
    const resume = await db.resume.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(resume);
  } catch (err) {
    console.error(err);
    return error(err.message, 500);
  }
}

export async function DELETE(req, { params }) {
  const auth = await authenticated();
  if (auth.response) return auth.response;

  try {
    const resume = await db.resume.findUnique({ where: { id: params.id } });
    if (!resume || resume.userId !== auth.user.id) {
      return error("Not found or unauthorized", 404);
    }
    
    await db.resume.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return error(err.message, 500);
  }
}
