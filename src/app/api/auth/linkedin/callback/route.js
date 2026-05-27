import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = process.env.LINKEDIN_REDIRECT_URI?.replace("/api/auth/linkedin/callback", "") || "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?linkedin=denied`);
  }

  try {
    // Exchange auth code for access token
    const tokenRes = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(`${baseUrl}/dashboard/settings?linkedin=error`);
    }

    // Get session user
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.redirect(`${baseUrl}/login`);
    }

    // Calculate expiry (LinkedIn tokens last 60 days)
    const expiresIn = tokenData.expires_in || 5184000; // 60 days default
    const expiry = new Date(Date.now() + expiresIn * 1000);

    // Save token to database
    await db.user.update({
      where: { id: user.id },
      data: {
        linkedinAccessToken: tokenData.access_token,
        linkedinTokenExpiry: expiry,
      },
    });

    return NextResponse.redirect(`${baseUrl}/dashboard/settings?linkedin=connected`);
  } catch (err) {
    console.error("LinkedIn OAuth error:", err);
    const baseUrl = process.env.LINKEDIN_REDIRECT_URI?.replace("/api/auth/linkedin/callback", "") || "http://localhost:3000";
    return NextResponse.redirect(`${baseUrl}/dashboard/settings?linkedin=error`);
  }
}
