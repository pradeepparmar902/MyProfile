import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    
    // We store global settings in a single document, grab the first one
    const existing = await db.setting.findFirst({});
    
    if (existing) {
      const updated = await db.setting.update({
        where: { id: existing.id },
        data: {
          ...data,
        }
      });
      return NextResponse.json(updated);
    } else {
      const created = await db.setting.create({
        data: {
          ...data,
        }
      });
      return NextResponse.json(created);
    }
  } catch (error) {
    console.error("Settings save error:", error);
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
