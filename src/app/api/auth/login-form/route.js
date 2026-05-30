import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"));
}

export async function POST() {
  return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"));
}
